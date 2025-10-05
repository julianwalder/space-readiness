# Space Readiness Assessment Platform

An AI-powered venture readiness assessment platform that evaluates space industry ventures across 8 key dimensions using advanced AI agents and provides actionable insights for improvement.

## 🚀 Features

- **8-Dimension Analysis**: Technology, Customer/Market, Business Model, Team, IP, Funding, Sustainability, and System Integration
- **AI-Powered Agents**: Automated assessment using sophisticated AI agents with confidence scoring
- **Real-time Processing**: BullMQ worker system for asynchronous job processing
- **Dynamic UI**: Modern, responsive interface with structured analysis cards
- **File Upload System**: Production-ready document upload with Supabase Storage
- **Venture Management**: Complete CRUD operations for venture data
- **Assessment Tracking**: Progress monitoring and recommendation management

## 🛠 Tech Stack

- **Frontend**: Next.js 15 with Turbopack, React, TypeScript
- **UI Components**: Shadcn/ui with Tailwind CSS
- **Backend**: Next.js API Routes with Supabase
- **Database**: PostgreSQL (Supabase)
- **Queue System**: BullMQ with Redis (Upstash)
- **Storage**: Supabase Storage for file uploads
- **Authentication**: Supabase Auth

## 📋 Prerequisites

- Node.js 18+ 
- npm
- Supabase account
- Redis instance (Upstash recommended)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/julianwalder/space-readiness.git
cd space-readiness
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Redis Configuration (Upstash)
REDIS_URL=your_redis_url

# Optional: For development
NODE_ENV=development
```

### 4. Database Setup

1. Set up your Supabase project
2. Run the SQL migrations (see `docs/PRODUCTION_UPLOAD_SETUP.md`)
3. Configure Row Level Security (RLS) policies
4. Set up Supabase Storage buckets

### 5. Start Development Server

```bash
# Start the Next.js development server
npm run dev

# In a separate terminal, start the worker
npm run worker
```

### 6. Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (authenticated)/    # Protected routes
│   │   ├── api/               # API routes
│   │   └── ...
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn/ui components
│   │   └── ...
│   ├── lib/                  # Utility libraries
│   └── contexts/             # React contexts
├── worker/                   # BullMQ worker system
├── docs/                     # Documentation
└── public/                   # Static assets
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run worker       # Start BullMQ worker

# Production
npm run build        # Build for production
npm start            # Start production server

# Testing & Debugging
npm run ping-redis   # Test Redis connectivity
npm run bullmq-smoke # Test BullMQ functionality
```

## 🔒 Security

- Environment variables are properly excluded via `.gitignore`
- SQL files and scripts are excluded from version control
- RLS policies protect database access
- Service role keys are server-side only

## 📚 Documentation

- [Production Upload Setup](docs/PRODUCTION_UPLOAD_SETUP.md) - Complete setup guide
- [API Documentation](src/app/api/) - API endpoint documentation
- [Component Library](src/components/) - UI component documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🚀 Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy!

For other deployment options, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
