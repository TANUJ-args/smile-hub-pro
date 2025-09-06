# 🦷 SmileHub Pro - Advanced Dental Practice Management

> **Professional dental patient management platform designed for modern practices**

[![Deploy Status](https://img.shields.io/badge/deploy-ready-brightgreen)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

## ✨ Features

### 👥 Patient Management
- **Complete Patient Records** - Comprehensive patient information management
- **Treatment Tracking** - Monitor treatments, progress, and appointments
- **Financial Management** - Track payments, due amounts, and billing
- **Image Management** - Store and manage patient X-rays and photos

### 🔒 Security & Privacy
- **HIPAA Compliant** - Secure data handling and storage
- **Authentication** - JWT-based secure user authentication
- **Data Encryption** - End-to-end encryption for sensitive data
- **Access Control** - Role-based permissions and access management

### 🚀 Modern Technology
- **AI-Powered Analysis** - Smart X-ray analysis and insights (coming soon)
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates** - Live data synchronization
- **Cloud-Based** - Accessible from anywhere, automatic backups

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern styling
- **Shadcn/ui** for beautiful components
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **PostgreSQL** (Neon) for data storage
- **JWT** for authentication
- **Multer** for file uploads
- **bcrypt** for password hashing

### Deployment
- **Render** for hosting (frontend & backend)
- **Neon** for PostgreSQL database
- **GitHub** for version control

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- PostgreSQL database (Neon recommended)
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/TANUJ-args/smile-hub-pro.git
   cd smile-hub-pro
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment template
   cp server/.env.example server/.env
   
   # Edit server/.env with your configuration:
   # - DATABASE_URL (your Neon PostgreSQL connection string)
   # - JWT_SECRET (a strong secret key)
   # - AI_SERVICE_URL (optional, for AI features)
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Start backend
   cd server && npm start
   
   # Terminal 2: Start frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3001

## 📦 Deployment

Ready for production? See our comprehensive [Deployment Guide](./DEPLOYMENT.md).

### Quick Deploy to Render
1. Push code to GitHub
2. Connect to Render
3. Configure environment variables
4. Deploy automatically with our `render.yaml`

## 📚 Documentation

### API Documentation
The backend provides RESTful APIs for:
- `/api/auth` - Authentication endpoints
- `/api/patients` - Patient management
- `/api/health` - Health check endpoint

### Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │◄──►│   Express API    │◄──►│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)      │    │   (Database)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔐 Security

### Data Protection
- All passwords are hashed using bcrypt
- JWT tokens for secure authentication
- HTTPS enforced in production
- SQL injection protection
- XSS protection headers

### Compliance
- HIPAA compliant architecture
- Data encryption at rest and in transit
- Audit trail capabilities
- Secure file upload handling

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md).

### Development Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

### Getting Help
- 📧 Email: support@smilehub-pro.com
- 📖 Documentation: [docs.smilehub-pro.com](https://docs.smilehub-pro.com)
- 🐛 Issues: [GitHub Issues](https://github.com/TANUJ-args/smile-hub-pro/issues)

### Professional Support
Enterprise support and custom development available. Contact us for:
- Custom integrations
- Training and onboarding
- Priority support
- Compliance consultation

## 🏥 About

SmileHub Pro is designed specifically for dental practices looking to modernize their patient management systems. Built with security, efficiency, and user experience in mind.

### Key Benefits
- **Reduce paperwork** by 90%
- **Improve patient satisfaction** with faster service
- **Ensure compliance** with healthcare regulations
- **Scale your practice** with cloud-based infrastructure

---

**Made with ❤️ for dental professionals worldwide**

© 2025 SmileHub Pro. All rights reserved.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

---

## 📧 Contact & Support

**SmileHub Pro Team**
- **Email**: screative845@gmail.com
- **Location**: Visakhapatnam, Andhra Pradesh, India
- **GitHub**: [TANUJ-args/smile-hub-pro](https://github.com/TANUJ-args/smile-hub-pro)

For technical support, feature requests, or business inquiries, please reach out via email.

---

**Made with ❤️ for dental professionals worldwide**

© 2025 SmileHub Pro. All rights reserved.
