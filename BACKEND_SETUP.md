# Backend Setup & AI X-ray Analysis

## PostgreSQL Database Setup

You need the following table in your Neon/Postgres database:

```sql
CREATE TABLE patients (
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
```

## Environment Variables

Set `DATABASE_URL` in the Render backend service to your Neon Postgres connection string.
Set `AI_SERVICE_URL` to your FastAPI AI service URL (e.g., http://localhost:8000 for local development).

## API Endpoints

### Patient Management
- Backend endpoint: `/api/patients` (GET, POST, PUT, DELETE)
- Frontend can fetch from: `https://<your-backend-service-url>/api/patients`

### X-ray Analysis
- Backend endpoint: `/api/analyze-xray` (POST)
- AI service endpoint: `/analyze-dental-xray` (POST)
- Health check: `/api/ai-service/health` (GET)

## AI Service Setup

### Quick Start
1. Navigate to `ai-service/` directory
2. Run startup script:
   - Windows: `start_service.bat`
   - macOS/Linux: `./start_service.sh`
3. Service will be available at http://localhost:8000

### Manual Setup
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## Local Development

1. Start AI service: `cd ai-service && python main.py`
2. Start backend: `cd server && npm install && npm start`
3. Start frontend: `npm install && npm run dev`

## Production Deployment

### AI Service on Render
1. Create new Web Service in Render
2. Connect your repository
3. Set build command: `cd ai-service && pip install -r requirements.txt`
4. Set start command: `cd ai-service && python main.py`
5. Set environment variables as needed

### Update Backend Environment
- Set `AI_SERVICE_URL` to your deployed AI service URL
- Ensure all services can communicate

## Features

- **Dental X-ray Analysis**: AI-powered cavity detection and anomaly identification
- **Image Processing**: Automatic preprocessing and enhancement
- **Risk Assessment**: Clinical risk levels and recommendations
- **Visual Annotations**: Highlighted areas of interest on X-ray images
- **Error Handling**: Comprehensive error management and fallbacks
