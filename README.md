# AI-Powered Resume Builder - Complete Azure Solution

🚀 **Transform your resume with AI-powered optimization and get matched with your dream job!**

This is a comprehensive AI-powered resume builder built on Azure cloud architecture, featuring advanced resume enhancement, ATS optimization, and job matching capabilities.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Azure Static  │    │   Next.js API    │    │  Azure OpenAI   │
│   Web Apps      │───▶│   Routes         │───▶│   Service       │
│   (Frontend)    │    │  (Serverless)    │    │   (GPT-4)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                       │
         │                        ▼                       │
         │              ┌──────────────────┐              │
         │              │ Azure Cosmos DB  │              │
         └──────────────│ (User & Resume   │◀─────────────┘
                        │     Storage)     │
                        └──────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │  Azure Blob      │
                        │  Storage         │
                        │ (File Storage)   │
                        └──────────────────┘
```

## ✨ Features

### 🤖 AI-Powered Enhancement
- **Resume Content Optimization**: AI rewrites experience descriptions to match job requirements
- **ATS Compatibility**: Optimizes formatting and keywords for Applicant Tracking Systems
- **Job Matching**: Provides compatibility scores and skill matching analysis
- **Smart Suggestions**: Actionable recommendations for resume improvement

### 🔐 Secure Authentication
- **Email + OTP Authentication**: Passwordless login via Azure Communication Services
- **JWT Session Management**: Secure token-based authentication
- **User Account Management**: Automatic user creation and profile management

### 📄 File Processing
- **Multi-Format Support**: PDF, DOC, and DOCX resume uploads
- **Intelligent Parsing**: Extracts personal info, experience, skills, and education
- **Cloud Storage**: Secure file storage with Azure Blob Storage

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Intuitive Interface**: Drag-and-drop file uploads and real-time feedback
- **Professional Templates**: Clean, modern resume templates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Azure subscription
- Azure CLI installed

### 1. Clone and Install
```bash
git clone <repository-url>
cd ai-resume-builder
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and configure:

```bash
# Azure Configuration
AZURE_STORAGE_CONNECTION_STRING=your_azure_storage_connection_string
AZURE_COSMOS_CONNECTION_STRING=your_azure_cosmos_connection_string
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_COMMUNICATION_CONNECTION_STRING=your_azure_communication_connection_string

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Azure Resources Setup

#### Create Resource Group
```bash
az group create --name ai-resume-builder-rg --location "East US"
```

#### Create Cosmos DB
```bash
az cosmosdb create \
  --name ai-resume-cosmosdb \
  --resource-group ai-resume-builder-rg \
  --kind GlobalDocumentDB

az cosmosdb sql database create \
  --account-name ai-resume-cosmosdb \
  --resource-group ai-resume-builder-rg \
  --name ResumeBuilderDB
```

#### Create Storage Account
```bash
az storage account create \
  --name airesumestorage \
  --resource-group ai-resume-builder-rg \
  --location "East US" \
  --sku Standard_LRS
```

#### Create OpenAI Resource
```bash
az cognitiveservices account create \
  --name ai-resume-openai \
  --resource-group ai-resume-builder-rg \
  --location "East US" \
  --kind OpenAI \
  --sku S0
```

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
├── src/
│   ├── components/          # React components
│   │   └── Layout.tsx      # Main layout component
│   ├── lib/                # Utility libraries
│   │   ├── azure.ts        # Azure service configurations
│   │   ├── auth.ts         # Authentication utilities
│   │   ├── aiProcessor.ts  # AI processing functions
│   │   └── fileProcessor.ts # File parsing utilities
│   ├── pages/              # Next.js pages
│   │   ├── api/            # API routes
│   │   │   ├── auth/       # Authentication endpoints
│   │   │   ├── upload-resume.ts
│   │   │   └── generate-resume.ts
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard.tsx   # Main dashboard
│   │   ├── index.tsx       # Landing page
│   │   └── _app.tsx        # App configuration
│   ├── styles/             # CSS styles
│   ├── types/              # TypeScript definitions
│   └── utils/              # Utility functions
├── azure-pipelines.yml     # CI/CD pipeline
├── staticwebapp.config.json # Azure Static Web Apps config
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and authenticate

### Resume Processing
- `POST /api/upload-resume` - Upload and process resume
- `POST /api/generate-resume` - Generate enhanced resume

## 🗄️ Database Schema

### Users Collection
```json
{
  "id": "user_uuid",
  "email": "user@example.com",
  "created_at": "2024-01-01T00:00:00Z",
  "last_login": "2024-01-01T00:00:00Z",
  "subscription_type": "free|premium"
}
```

### Resumes Collection
```json
{
  "id": "resume_uuid",
  "user_id": "user_uuid",
  "original_resume_url": "blob_storage_url",
  "enhanced_resume_url": "blob_storage_url",
  "job_description": "text",
  "extracted_data": {
    "personal_info": {...},
    "experience": [...],
    "skills": [...],
    "education": [...]
  },
  "ai_enhancements": {
    "matched_skills": [...],
    "optimized_experience": [...],
    "suggestions": [...],
    "ats_score": 85
  },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## 🚀 Deployment

### Azure Static Web Apps Deployment

1. **Create Static Web App**:
```bash
az staticwebapp create \
  --name ai-resume-builder-app \
  --resource-group ai-resume-builder-rg \
  --source https://github.com/yourusername/ai-resume-builder \
  --location "East US2" \
  --branch main \
  --app-location "/" \
  --output-location ".next"
```

2. **Configure Environment Variables** in Azure Portal:
   - Navigate to your Static Web App
   - Go to Configuration
   - Add all environment variables from `.env.example`

3. **Set up CI/CD**:
   - The `azure-pipelines.yml` file configures automatic deployment
   - Connect your repository to Azure DevOps
   - Configure service connections and variable groups

### Manual Deployment Steps

1. Build the application:
```bash
npm run build
```

2. Deploy to Azure Static Web Apps:
```bash
npx @azure/static-web-apps-cli deploy \
  --deployment-token $DEPLOYMENT_TOKEN \
  --app-location . \
  --output-location .next
```

## 💰 Cost Optimization

### Free Tier Utilization
- **Azure Static Web Apps**: Free for hobby projects
- **Azure Functions**: 1M executions/month free
- **Cosmos DB**: 1000 RU/s free tier
- **Blob Storage**: 5GB free
- **Azure OpenAI**: Pay-per-use model

### Estimated Monthly Costs (100 users)
- Static Web Apps: $0
- API Routes: $0-5
- Cosmos DB: $0-10
- Blob Storage: $0-2
- OpenAI API: $20-50
- Communication Services: $1-3

**Total: ~$25-70/month**

## 📊 Monitoring & Analytics

### Application Insights Setup
```bash
az monitor app-insights component create \
  --app ai-resume-insights \
  --location "East US" \
  --resource-group ai-resume-builder-rg
```

### Key Metrics Tracked
- Resume enhancement success rate
- User engagement time
- API response times
- Cost per enhancement
- ATS score improvements

## 🔒 Security Features

### Data Protection
- ✅ Encryption at rest and in transit
- ✅ GDPR compliance for EU users
- ✅ Secure JWT token management
- ✅ File upload validation and sanitization
- ✅ Rate limiting on API endpoints

### Privacy Features
- ✅ User data anonymization options
- ✅ Resume deletion capabilities
- ✅ Automatic data retention policies
- ✅ Secure file handling with Azure Blob Storage

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Type checking:
```bash
npm run type-check
```

Linting:
```bash
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**Environment Variables Not Loading**
- Ensure `.env.local` is in the root directory
- Restart the development server after changes
- Check for typos in variable names

**Azure Connection Issues**
- Verify connection strings are correct
- Ensure Azure resources are in the same region
- Check firewall settings and IP restrictions

**File Upload Failures**
- Verify blob storage container permissions
- Check file size limits (10MB max)
- Ensure supported file formats (PDF, DOC, DOCX)

### Getting Help
- 📧 Email: support@airesume.com
- 💬 Discord: [Join our community](https://discord.gg/airesume)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/ai-resume-builder/issues)

## 🎯 Roadmap

### Phase 1 ✅
- [x] Basic resume upload and parsing
- [x] Azure OpenAI integration
- [x] User authentication with OTP
- [x] ATS score calculation

### Phase 2 🚧
- [ ] Multiple resume templates
- [ ] Resume history and versioning
- [ ] Advanced AI suggestions
- [ ] Mobile app development

### Phase 3 📋
- [ ] Premium subscription features
- [ ] Integration with job boards
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard

---

**Built with ❤️ using Azure Cloud Services**

*Transform your career with AI-powered resume optimization!*