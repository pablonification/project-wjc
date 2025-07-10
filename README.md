# Project WJC - Full-Stack Web Application

A modern, production-ready web application built with Next.js, MongoDB, and DatoCMS for managing content across three main sections: **Kegiatan** (Activities), **Berita** (News), and **Dokumentasi** (Documentation).

![Architecture](https://img.shields.io/badge/Architecture-Full--Stack-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🏗️ Architecture Overview

```mermaid
graph TB
    subgraph "Content Management"
        DC[DatoCMS<br/>Headless CMS]
        DCA[DatoCMS Admin UI<br/>Content Editors]
    end
    
    subgraph "Data Synchronization"
        WH[Webhook Handler<br/>/api/webhooks/datocms]
        SS[Sync Script<br/>scripts/syncDatoToMongo.ts]
    end
    
    subgraph "Database Layer"
        MDB[(MongoDB Atlas<br/>Primary Database)]
        CACHE[localStorage<br/>Client Cache]
    end
    
    subgraph "API Layer"
        API[Next.js API Routes<br/>/api/*]
        MW[Middleware<br/>Auth, Rate Limiting, Validation]
    end
    
    subgraph "Frontend Layer"
        UI[Next.js Frontend<br/>React Components]
        HOOKS[Custom Hooks<br/>useKegiatan, useBerita, useDokumentasi]
        STORE[Zustand Store<br/>Global State Management]
    end
    
    subgraph "External Services"
        EMAIL[Email Service<br/>Nodemailer/SendGrid/Resend]
        VERCEL[Vercel<br/>Hosting & Deployment]
    end
    
    subgraph "CI/CD Pipeline"
        GHA[GitHub Actions<br/>Automated Testing & Deployment]
        TEST[Jest & Testing Library<br/>Unit & Integration Tests]
    end
    
    DCA --> DC
    DC --> WH
    DC --> SS
    WH --> MDB
    SS --> MDB
    
    MDB --> API
    API --> MW
    MW --> UI
    UI --> HOOKS
    HOOKS --> STORE
    STORE --> CACHE
    
    API --> EMAIL
    UI --> VERCEL
    
    GHA --> TEST
    GHA --> VERCEL
    
    classDef cms fill:#e1f5fe
    classDef database fill:#f3e5f5
    classDef api fill:#fff3e0
    classDef frontend fill:#e8f5e8
    classDef external fill:#fff8e1
    classDef cicd fill:#fce4ec
    
    class DC,DCA cms
    class MDB,CACHE database
    class API,MW,WH,SS api
    class UI,HOOKS,STORE frontend
    class EMAIL,VERCEL external
    class GHA,TEST cicd
```

## ✨ Features

### 🎯 **Content Management**
- **DatoCMS Integration**: Headless CMS for non-technical content editing
- **Real-time Sync**: Automatic synchronization between DatoCMS and MongoDB
- **Webhook Support**: Instant content updates via DatoCMS webhooks

### 🔧 **Technical Features**
- **Full-Stack TypeScript**: End-to-end type safety
- **RESTful & GraphQL APIs**: Flexible data access patterns
- **State Management**: Zustand with localStorage persistence
- **Authentication**: JWT-based auth with role-based access control
- **Rate Limiting**: Built-in protection against abuse
- **Email Integration**: Registration confirmations via multiple providers
- **Testing Suite**: 80%+ code coverage with Jest and React Testing Library

### 📱 **User Features**
- **Activity Registration**: Full registration system with email confirmations
- **Content Filtering**: Advanced filtering and search capabilities
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Live content synchronization

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- DatoCMS account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/project-wjc.git
   cd project-wjc
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/project-wjc
   DATOCMS_READONLY_TOKEN=your_datocms_token
   JWT_SECRET=your_super_secret_jwt_key
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🐳 Docker Setup

### Using Docker Compose (Recommended)

1. **Start the entire stack**
   ```bash
   docker-compose up -d
   ```

2. **With MongoDB UI (optional)**
   ```bash
   docker-compose --profile mongo-ui up -d
   ```

3. **Access the services**
   - Application: http://localhost:3000
   - MongoDB Express: http://localhost:8081 (admin/admin)

### Production Docker Build

```bash
# Build the image
docker build -t project-wjc .

# Run the container
docker run -p 3000:3000 --env-file .env.local project-wjc
```

## 📊 DatoCMS Setup

### Content Models

Create these models in your DatoCMS project:

#### 1. Kegiatan Model
```
Fields:
- title (Single-line string, required)
- description (Multi-paragraph text, required)
- content (Structured text, optional)
- slug (Slug, auto-generated from title)
- startDate (Date and time, required)
- endDate (Date and time, required)
- location (Single-line string, required)
- status (Single-line string, dropdown)
- registrationDeadline (Date and time, optional)
- maxParticipants (Integer, optional)
- image (Single asset, optional)
- category (Single-line string, optional)
```

#### 2. Berita Model
```
Fields:
- title (Single-line string, required)
- content (Structured text, required)
- excerpt (Multi-paragraph text, required)
- slug (Slug, auto-generated from title)
- author (Single-line string, required)
- publishDate (Date and time, required)
- category (Single-line string, required)
- image (Single asset, optional)
- tags (Multiple strings)
```

#### 3. Dokumentasi Model
```
Fields:
- title (Single-line string, required)
- description (Multi-paragraph text, required)
- year (Integer, required)
- type (Single-line string, dropdown: document/video/image/link)
- url (Single-line string, required)
- fileSize (Single-line string, optional)
- category (Single-line string, optional)
```

## 🔧 Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

### Testing
```bash
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Data Management
```bash
npm run sync:dato-to-mongo  # Sync DatoCMS content to MongoDB
npm run seed:mongo          # Seed MongoDB with sample data
```

### Type Checking
```bash
npm run type-check   # Run TypeScript type checking
```

## 📋 API Documentation

### Authentication Endpoints
```
POST /api/auth/login     # User login
POST /api/auth/register  # User registration
POST /api/auth/refresh   # Refresh JWT token
```

### Kegiatan Endpoints
```
GET    /api/kegiatan           # List kegiatan (with filtering)
POST   /api/kegiatan           # Create kegiatan (auth required)
GET    /api/kegiatan/[slug]    # Get kegiatan by slug
PUT    /api/kegiatan/[slug]    # Update kegiatan (auth required)
DELETE /api/kegiatan/[slug]    # Delete kegiatan (admin only)
POST   /api/kegiatan/[slug]/register # Register for kegiatan
```

### Berita Endpoints
```
GET    /api/berita             # List berita (with pagination)
POST   /api/berita             # Create berita (auth required)
GET    /api/berita/[slug]      # Get berita by slug
PUT    /api/berita/[slug]      # Update berita (auth required)
DELETE /api/berita/[slug]      # Delete berita (admin only)
GET    /api/berita/search      # Search berita
```

### Dokumentasi Endpoints
```
GET    /api/dokumentasi        # List dokumentasi (with filtering)
POST   /api/dokumentasi        # Create dokumentasi (auth required)
GET    /api/dokumentasi/years  # Get available years
PUT    /api/dokumentasi/[id]   # Update dokumentasi (auth required)
DELETE /api/dokumentasi/[id]   # Delete dokumentasi (admin only)
```

### Webhook Endpoints
```
POST   /api/webhooks/datocms   # DatoCMS webhook handler
```

## 🧪 Testing

The project includes comprehensive testing with Jest and React Testing Library:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Coverage Requirements
- **Minimum Coverage**: 80%
- **Test Types**: Unit tests, integration tests, API tests
- **Coverage Areas**: Components, hooks, API routes, utilities

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on every push to main

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
DATOCMS_READONLY_TOKEN=your_datocms_token
JWT_SECRET=your_production_jwt_secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
# ... other production variables
```

## 🔄 Content Sync Workflow

### Automatic Sync
1. Content editor makes changes in DatoCMS
2. DatoCMS sends webhook to `/api/webhooks/datocms`
3. Webhook handler triggers sync process
4. Content is automatically updated in MongoDB
5. Frontend reflects changes immediately

### Manual Sync
```bash
npm run sync:dato-to-mongo
```

## 🛠️ Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Automatic code formatting
- **Commit Messages**: Conventional commit format

### Project Structure
```
project-wjc/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── kegiatan/         # Kegiatan pages
│   ├── berita/           # Berita pages
│   └── dokumentasi/      # Dokumentasi pages
├── lib/                   # Utility libraries
│   ├── models/           # Mongoose models
│   ├── validations.ts    # Zod schemas
│   ├── auth.ts          # Authentication utilities
│   ├── email.ts         # Email utilities
│   └── datocms.ts       # DatoCMS integration
├── hooks/                 # Custom React hooks
├── store/                 # Zustand stores
├── types/                 # TypeScript type definitions
├── scripts/              # Utility scripts
└── tests/                # Test files
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'feat: add new feature'`
6. Push to branch: `git push origin feature/new-feature`
7. Submit a pull request

## 📞 Support

- **Documentation**: Check this README and code comments
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **DatoCMS** for the excellent headless CMS
- **MongoDB** for the reliable database
- **Vercel** for seamless deployment
- **Open Source Community** for the tools and libraries

---

**Built with ❤️ using modern web technologies**
