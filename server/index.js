const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Security middleware for production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });
}

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://smilehub-pro-frontend.onrender.com'] // Update with your actual frontend URL
    : ['http://localhost:8080', 'http://localhost:8081'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for image uploads

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Initialize database tables
const initDb = async () => {
  try {
    // Create users table for multi-tenancy
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create patients table with updated fields
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        surname VARCHAR(100),
        mobile VARCHAR(20),
        age INT,
        chief_complaint TEXT,
        diagnosis TEXT,
        treatment_plan TEXT,
        treatment_type VARCHAR(100),
        start_date DATE,
        total_fee NUMERIC(10,2),
        images TEXT[],
        payments JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add tenant_id to patients table if it doesn't exist
    const tenantIdColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='patients' and column_name='tenant_id'
    `);

    if (tenantIdColumn.rowCount === 0) {
      await pool.query('ALTER TABLE patients ADD COLUMN tenant_id INT REFERENCES users(id) ON DELETE CASCADE');
      console.log('Added tenant_id column to patients table');
    }

    // Add gender column if it doesn't exist
    const genderColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='patients' and column_name='gender'
    `);

    if (genderColumn.rowCount === 0) {
      await pool.query('ALTER TABLE patients ADD COLUMN gender VARCHAR(20)');
      console.log('Added gender column to patients table');
    }

    console.log('Database initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
};

// Initialize the database on startup
initDb();

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// User registration
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // unique_violation
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// X-ray Analysis endpoint
app.post('/api/analyze-xray', upload.single('xray'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No X-ray image uploaded' });
    }

    console.log('Received X-ray for analysis:', req.file.originalname);

    // Prepare form data to send to FastAPI service
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Send to FastAPI AI service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    try {
      const response = await axios.post(`${aiServiceUrl}/analyze-dental-xray`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 60000, // 60 second timeout
      });

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      // Return AI analysis results
      res.json({
        success: true,
        filename: req.file.originalname,
        analysis: response.data
      });

    } catch (aiError) {
      console.error('AI Service Error:', aiError.message);
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      if (aiError.code === 'ECONNREFUSED') {
        return res.status(503).json({ 
          error: 'AI analysis service is not available. Please ensure the FastAPI service is running.',
          details: `Trying to connect to: ${aiServiceUrl}`
        });
      }

      res.status(500).json({ 
        error: 'Failed to analyze X-ray image',
        details: aiError.response?.data || aiError.message
      });
    }

  } catch (error) {
    console.error('X-ray analysis error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      error: 'Internal server error during X-ray analysis',
      details: error.message
    });
  }
});

// Health check for AI service
app.get('/api/ai-service/health', async (req, res) => {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.get(`${aiServiceUrl}/health`, { timeout: 5000 });
    res.json({ 
      status: 'healthy', 
      aiService: response.data,
      serviceUrl: aiServiceUrl
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      error: 'AI service not available',
      serviceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000'
    });
  }
});

// Get all patients for the logged-in user
app.get('/api/patients', authenticateToken, async (req, res) => {
  try {
    const tenantId = req.user.id;
    const result = await pool.query('SELECT * FROM patients WHERE tenant_id = $1 ORDER BY created_at DESC', [tenantId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single patient for the logged-in user
app.get('/api/patients/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = parseInt(id);
    const tenantId = req.user.id;

    if (isNaN(patientId)) {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
    
    const result = await pool.query('SELECT * FROM patients WHERE id = $1 AND tenant_id = $2', [patientId, tenantId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new patient for the logged-in user
app.post('/api/patients', authenticateToken, async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { 
      name, 
      surname, 
      gender,
      mobile, 
      age, 
      chief_complaint, 
      diagnosis, 
      treatment_plan,
      treatment_type, 
      start_date, 
      total_fee, 
      images, 
      payments 
    } = req.body;

    const result = await pool.query(
      `INSERT INTO patients 
        (name, surname, gender, mobile, age, chief_complaint, diagnosis, treatment_plan, treatment_type, start_date, total_fee, images, payments, tenant_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
       RETURNING *`,
      [name, surname, gender, mobile, age, chief_complaint, diagnosis, treatment_plan, treatment_type, start_date, total_fee, images, JSON.stringify(payments), tenantId]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a patient for the logged-in user
app.put('/api/patients/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = parseInt(id, 10);
    const tenantId = req.user.id;
    
    if (isNaN(patientId)) {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
    
    const { 
      name, 
      surname, 
      gender,
      mobile, 
      age, 
      chief_complaint, 
      diagnosis, 
      treatment_plan,
      treatment_type, 
      start_date, 
      total_fee, 
      images, 
      payments 
    } = req.body;

    const result = await pool.query(
      `UPDATE patients SET
        name = $1, surname = $2, gender = $3, mobile = $4, age = $5, chief_complaint = $6, 
        diagnosis = $7, treatment_plan = $8, treatment_type = $9, 
        start_date = $10, total_fee = $11, images = $12, payments = $13
       WHERE id = $14 AND tenant_id = $15
       RETURNING *`,
      [name, surname, gender, mobile, age, chief_complaint, diagnosis, treatment_plan, treatment_type, 
        start_date, total_fee, images, JSON.stringify(payments), patientId, tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a patient for the logged-in user
app.delete('/api/patients/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = parseInt(id, 10);
    const tenantId = req.user.id;
    
    if (isNaN(patientId)) {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
    
    const result = await pool.query('DELETE FROM patients WHERE id = $1 AND tenant_id = $2 RETURNING *', [patientId, tenantId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Patient not found or you do not have permission to delete it' });
    }

    res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get original patient data (for reverting changes) - now tenant-aware
app.get('/api/patients/:id/original', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = parseInt(id, 10);
    const tenantId = req.user.id;
    
    if (isNaN(patientId)) {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
    
    const result = await pool.query('SELECT * FROM patients WHERE id = $1 AND tenant_id = $2', [patientId, tenantId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update specific image in patient's images array - now tenant-aware
app.put('/api/patients/:id/images/:imageIndex', authenticateToken, async (req, res) => {
  try {
    const { id, imageIndex } = req.params;
    const { imageData } = req.body;
    const tenantId = req.user.id;
    
    // Convert id to integer for PostgreSQL
    const patientId = parseInt(id);
    if (isNaN(patientId)) {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
    
    // Get current patient data, ensuring it belongs to the tenant
    const result = await pool.query('SELECT images FROM patients WHERE id = $1 AND tenant_id = $2', [patientId, tenantId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    const images = result.rows[0].images || [];
    const index = parseInt(imageIndex);
    
    if (index < 0 || index >= images.length) {
      return res.status(400).json({ error: 'Invalid image index' });
    }
    
    // Update the specific image
    images[index] = imageData;
    
    // Update the database
    await pool.query('UPDATE patients SET images = $1 WHERE id = $2 AND tenant_id = $3', [images, patientId, tenantId]);
    
    res.json({ message: 'Image updated successfully', images });
  } catch (err) {
    console.error('Error updating image:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete specific image from patient's images array - now tenant-aware
app.delete('/api/patients/:id/images/:imageIndex', authenticateToken, async (req, res) => {
  try {
    const { id, imageIndex } = req.params;
    const tenantId = req.user.id;
    
    // Convert id to integer for PostgreSQL
    const patientId = parseInt(id);
    if (isNaN(patientId)) {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
    
    // Get current patient data, ensuring it belongs to the tenant
    const result = await pool.query('SELECT images FROM patients WHERE id = $1 AND tenant_id = $2', [patientId, tenantId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    const images = result.rows[0].images || [];
    const index = parseInt(imageIndex);
    
    if (index < 0 || index >= images.length) {
      return res.status(400).json({ error: 'Invalid image index' });
    }
    
    if (images.length <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last remaining image' });
    }
    
    // Remove the specific image
    images.splice(index, 1);
    
    // Update the database
    await pool.query('UPDATE patients SET images = $1 WHERE id = $2 AND tenant_id = $3', [images, patientId, tenantId]);
    
    res.json({ message: 'Image deleted successfully', images });
  } catch (err) {
    console.error('Error deleting image:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Health check endpoint for deployment
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
