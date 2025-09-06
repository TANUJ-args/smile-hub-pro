# Dental X-ray AI Analysis System

A complete solution for AI-powered dental X-ray analysis featuring a React frontend, Node.js/Express backend, and Python FastAPI AI service.

## 🏗️ System Architecture

```
Frontend (React/Vite) ← HTTP → Backend (Node.js/Express) ← HTTP → AI Service (Python/FastAPI)
                                       ↓
                               PostgreSQL Database
```

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ and pip
- PostgreSQL database (or Neon cloud database)

### 1. Clone and Setup Project
```bash
git clone <your-repo>
cd dental-patient-manager
```

### 2. Setup Backend
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your database URL and AI service URL
```

### 3. Setup AI Service
```bash
cd ../ai-service

# On Windows:
start_service.bat

# On macOS/Linux:
chmod +x start_service.sh
./start_service.sh
```

### 4. Setup Frontend
```bash
cd ..
npm install
npm run dev
```

### 5. Start Backend
```bash
cd server
npm start
```

## 📋 API Endpoints

### Backend Endpoints (Port 3001)

#### X-ray Analysis
- **POST** `/api/analyze-xray`
  - Upload X-ray image for AI analysis
  - Content-Type: `multipart/form-data`
  - Field: `xray` (image file)

#### AI Service Health
- **GET** `/api/ai-service/health`
  - Check AI service availability

#### Patient Management
- **GET** `/api/patients` - Get all patients
- **POST** `/api/patients` - Create new patient
- **PUT** `/api/patients/:id` - Update patient
- **DELETE** `/api/patients/:id` - Delete patient

### AI Service Endpoints (Port 8000)

#### Analysis
- **POST** `/analyze-dental-xray`
  - Analyze dental X-ray image
  - Returns: JSON with anomalies, assessment, annotated image

#### Health Check
- **GET** `/health` - Service health status
- **GET** `/model-info` - AI model information

## 💻 Frontend Usage

### X-ray Analysis Component
```tsx
import XrayAnalysis from '@/components/XrayAnalysis';

// Use in your app
<XrayAnalysis />
```

### Key Features
- Drag & drop image upload
- Real-time analysis progress
- AI service health monitoring
- Annotated image display
- Risk assessment visualization
- Clinical recommendations

## 🔧 Backend Implementation

### X-ray Analysis Endpoint
```javascript
app.post('/api/analyze-xray', upload.single('xray'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No X-ray image uploaded' });
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));

    const response = await axios.post(`${aiServiceUrl}/analyze-dental-xray`, formData);
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      filename: req.file.originalname,
      analysis: response.data
    });
  } catch (error) {
    // Error handling
    res.status(500).json({ error: 'Analysis failed' });
  }
});
```

### Error Handling
- File validation (type, size)
- AI service connectivity checks
- Automatic file cleanup
- Comprehensive error responses

## 🤖 AI Service Implementation

### Core Analysis Function
```python
class DentalXrayAnalyzer:
    def analyze_xray(self, image_bytes: bytes) -> Dict[str, Any]:
        # Convert bytes to image
        image = Image.open(io.BytesIO(image_bytes))
        image_np = np.array(image)
        
        # Preprocess image
        processed_image = self.preprocess_image(image_np)
        
        # Detect anomalies using computer vision
        anomalies = self.detect_anomalies(processed_image)
        
        # Generate assessment
        assessment = self._generate_assessment(anomalies)
        
        # Create annotated image
        annotated_image = self._create_annotated_image(image_np, anomalies)
        
        return {
            "status": "success",
            "total_anomalies": len(anomalies),
            "anomalies": anomalies,
            "assessment": assessment,
            "annotated_image": annotated_image
        }
```

### Detection Features
- **Cavity Detection**: Identifies potential cavities using shape analysis
- **Restoration Identification**: Detects existing dental work
- **Anomaly Highlighting**: Visual annotation of detected areas
- **Risk Assessment**: Provides clinical risk levels and recommendations

## 📊 Response Format

### Analysis Response
```json
{
  "status": "success",
  "total_anomalies": 2,
  "anomalies": [
    {
      "id": 0,
      "type": "potential_cavity",
      "confidence": 0.85,
      "location": {"x": 100, "y": 150, "width": 30, "height": 25},
      "area": 750,
      "description": "Potential cavity detected with 85% confidence..."
    }
  ],
  "assessment": {
    "overall_status": "abnormal",
    "risk_level": "medium",
    "recommendations": [
      "Schedule dental checkup within 2 weeks",
      "Monitor for pain or sensitivity"
    ],
    "summary": "Detected 2 areas of interest, 1 potential cavities"
  },
  "annotated_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...",
  "image_dimensions": {"width": 800, "height": 600}
}
```

## 🔒 Security Considerations

### File Upload Security
- File type validation (images only)
- File size limits (10MB max)
- Automatic file cleanup
- Secure temporary storage

### Error Handling
- Sanitized error messages
- No sensitive data exposure
- Graceful service degradation

## 🎯 Production Deployment

### Environment Variables
```bash
# Backend (.env)
PORT=3001
DATABASE_URL=postgresql://user:pass@host:port/db
AI_SERVICE_URL=http://ai-service:8000

# AI Service
PYTHONPATH=/app
```

### Docker Deployment (Optional)
```dockerfile
# AI Service Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "main.py"]
```

### Render Deployment
1. Deploy backend and frontend using existing `render.yaml`
2. Deploy AI service as separate web service
3. Update `AI_SERVICE_URL` environment variable

## 🧪 Testing

### Test X-ray Analysis
```bash
# Test AI service directly
curl -X POST "http://localhost:8000/analyze-dental-xray" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@dental_xray.jpg"

# Test through backend
curl -X POST "http://localhost:3001/api/analyze-xray" \
  -F "xray=@dental_xray.jpg"
```

### Health Checks
```bash
# AI service health
curl http://localhost:8000/health

# Backend health check
curl http://localhost:3001/api/ai-service/health
```

## ⚠️ Important Notes

1. **AI Model**: This implementation uses computer vision techniques for demonstration. For production, integrate trained deep learning models.

2. **Medical Disclaimer**: Results are for informational purposes only and should not replace professional dental examination.

3. **Performance**: For better performance in production:
   - Use GPU-accelerated inference
   - Implement model caching
   - Add rate limiting
   - Use CDN for image serving

4. **Scalability**: Consider using:
   - Message queues for async processing
   - Load balancers for multiple AI service instances
   - Distributed storage for large images

## 📝 Example Usage

```javascript
// Frontend usage example
const analyzeXray = async (file) => {
  const formData = new FormData();
  formData.append('xray', file);
  
  const response = await fetch('/api/analyze-xray', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  return result;
};
```

This system provides a complete foundation for dental X-ray analysis with AI integration, suitable for both development and production environments.
