# DeepDSA - Comprehensive DSA Learning Platform

A full-stack LeetCode-style platform with Next.js frontend, Node.js/Express backend, and comprehensive code execution capabilities, containerized with Docker.

## 🎯 Features

### Core Learning Features
- **Interactive Code Editor**: Monaco Editor with syntax highlighting, auto-completion, and multi-language support
- **Real-time Code Execution**: Judge0 integration for running code in C++, Java, Python, and JavaScript
- **Problem Management**: Comprehensive problem database with test cases, difficulty levels, and company tags
- **Progress Tracking**: User statistics, streak tracking, and performance analytics
- **AI-Powered Interviews**: Gemini AI integration for mock technical interviews
- **Editorial System**: Detailed problem explanations and solution guides

### User Management & Authentication
- **Clerk Authentication**: Secure user authentication with social login options
- **Role-based Access Control**: User, Admin, and Super Admin roles
- **User Profiles**: Comprehensive user profiles with progress tracking
- **Admin Dashboard**: Full administrative interface for content management

### Premium Features
- **Subscription Plans**: Free, Pro, and Enterprise tiers
- **Interview Limits**: Free users limited to 3 interviews per day
- **Advanced Analytics**: Detailed performance insights for Pro users
- **Priority Support**: Tiered support system

### Technical Features
- **Responsive Design**: Mobile-first design with dark/light theme support
- **Real-time Updates**: Live code execution results and progress tracking
- **Database Management**: MongoDB with Prisma ORM for data modeling
- **Caching**: Redis integration for performance optimization
- **File Management**: Cloudinary integration for image and file storage

## 🚀 Quick Start

### Production
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

### Development
```bash
# Start development environment with hot reloading
docker-compose -f docker-compose.dev.yml up --build

# Run in background
docker-compose -f docker-compose.dev.yml up -d --build
```

### With Ngrok Tunneling
```bash
# Start development with ngrok tunnels
docker-compose -f docker-compose.dev.yml --profile tunnel up --build

# Start production with ngrok tunnels
docker-compose --profile tunnel up --build
```

## 📁 Project Structure

```
DeepDSA/
├── backend/                 # Node.js/Express API
│   ├── Dockerfile          # Production backend image
│   ├── Dockerfile.dev      # Development backend image
│   ├── mongo-init/         # MongoDB initialization scripts
│   └── src/               # TypeScript source code
│       ├── config/         # Environment & database configuration
│       ├── controllers/    # API route controllers
│       ├── middleware/     # Express middleware (auth, rate limiting, etc.)
│       ├── routes/         # API routes with versioning
│       └── lib/           # Utility libraries
├── main-fb/               # Next.js frontend
│   ├── Dockerfile          # Production frontend image
│   ├── Dockerfile.dev      # Development frontend image
│   ├── prisma/            # Database schema and migrations
│   ├── public/            # Static assets (logos, images)
│   └── src/               # React/Next.js source code
│       ├── app/           # Next.js 13+ app directory
│       │   ├── api/       # API routes
│       │   ├── admin/     # Admin dashboard pages
│       │   ├── problems/  # Problem pages and components
│       │   └── profile/   # User profile pages
│       ├── components/    # Reusable React components
│       ├── lib/          # Utility functions and configurations
│       ├── models/       # Mongoose data models
│       ├── middleware/   # Next.js middleware
│       └── utils/        # Helper utilities and code generators
├── docker-compose.yml      # Production orchestration
├── docker-compose.dev.yml  # Development orchestration
├── judge0.conf           # Judge0 server configuration
├── ngrok.yml             # Ngrok tunnel configuration
└── README.md             # This file
```

## 🌐 Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Next.js application with Clerk auth |
| Backend | 5373 | Express.js API (currently disabled in dev) |
| MongoDB | 27017 | Primary database |
| Redis | 6379 | Cache & Judge0 queue management |
| Mongo Express | 8081 | Database management UI |
| Judge0 Server | 2358 | Code execution engine |
| Judge0 Workers | - | Background code execution workers |
| PostgreSQL | 5432 | Judge0 metadata database |
| Ngrok | 4040 | All tunnels web interface |

## 🔧 Environment Variables

### Frontend (.env.local)
```env
# Database
DATABASE_URL=mongodb://mongo:27017/deepdsa
MONGO_URI=mongodb://mongo:27017/deepdsa

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5373
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Code Execution (Judge0)
JUDGE0_API_URL=http://judge0-server:2358
JUDGE0_API_KEY=your_rapidapi_key_here
JUDGE0_AUTH_TOKEN=your_judge0_auth_token

# AI Integration (Gemini)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Ngrok Tunneling
NGROK_AUTHTOKEN=your_ngrok_auth_token
```

### Backend (.env.local) - Currently Disabled in Development
```env
MONGO_URI=mongodb://mongo:27017/deepdsa
PORT=5373
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Judge0 Configuration (judge0.conf)
```env
# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=68zzFzRSDNw3ZpaNucnzKVPFWJcqBMMs

# PostgreSQL Configuration
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_DB=judge0
POSTGRES_USER=judge0
POSTGRES_PASSWORD=your_postgres_password
```

## 🔐 Authentication & Authorization

### Clerk Authentication Setup
1. **Create Clerk Account**: Sign up at [clerk.com](https://clerk.com)
2. **Create Application**: Set up a new application in Clerk dashboard
3. **Get API Keys**: Copy publishable and secret keys from Clerk dashboard
4. **Configure Webhooks**: Set up webhook endpoint for user synchronization
5. **Set Environment Variables**: Add Clerk keys to your `.env.local`

### User Roles
- **USER**: Default role for regular users
- **ADMIN**: Can manage problems, users, and content
- **SUPER_ADMIN**: Full system access including user role management

### Protected Routes
- **Public**: `/`, `/sign-in`, `/sign-up`
- **Protected**: All other routes require authentication
- **Admin Only**: `/admin/*` routes require admin privileges

## 🤖 External Service Integrations

### Judge0 Code Execution
- **Purpose**: Execute user code in multiple programming languages
- **Languages Supported**: C++, Java, Python, JavaScript
- **Configuration**: Self-hosted Judge0 instance with PostgreSQL and Redis
- **API Integration**: Batch submissions for efficient test case execution

### Gemini AI Integration
- **Purpose**: Power AI-driven mock interviews
- **Model**: Gemini 1.5 Flash for fast response times
- **Features**: Interview question generation, code review, hints
- **Rate Limiting**: Integrated with user subscription tiers

### Cloudinary File Storage
- **Purpose**: Store and manage user uploads, images, and assets
- **Features**: Image optimization, transformation, and CDN delivery
- **Integration**: Used for user avatars and problem-related media

### Clerk Authentication
- **Purpose**: Secure user authentication and session management
- **Features**: Social login, multi-factor authentication, user management
- **Webhooks**: Real-time user synchronization with application database

## 🛠️ Development

### Current Development Setup
**Note**: The backend service is currently disabled in development mode. The frontend handles all API routes directly using Next.js API routes.

### Hot Reloading with Watch
The development setup uses Docker Compose's watch functionality for optimal development experience:

#### Frontend Watch Configuration:
- **Source Code**: `./main-fb/src` → `/app/src` (sync)
- **Public Assets**: `./main-fb/public` → `/app/public` (sync)
- **Config Files**: `next.config.ts`, `tsconfig.json`, `postcss.config.mjs` → sync
- **Package Files**: `./main-fb/package.json` → rebuild container
- **Ignored**: `node_modules/`, `.next/`

#### Backend Watch Configuration (Currently Disabled):
- **Source Code**: `./backend/src` → `/app/src` (sync)
- **Package Files**: `./backend/package.json` → rebuild container
- **Dependencies**: `./backend/package-lock.json` → sync
- **Ignored**: `node_modules/`, `dist/`, `logs/`

### Watch Actions:
- **`sync`**: File changes are immediately synced to the container
- **`rebuild`**: Container is rebuilt when package.json changes

### Development Notes
- **Monorepo Structure**: Frontend and backend are separate services
- **Database**: MongoDB is the primary database with Prisma ORM
- **Code Execution**: Judge0 runs in separate containers with PostgreSQL and Redis
- **Authentication**: Clerk handles all authentication flows
- **API Routes**: Next.js API routes handle all backend functionality

### Database Management
Access MongoDB Express at `http://localhost:8081`:
- Username: `admin`
- Password: `admin123`

### Judge0 Management
- **Judge0 API**: Available at `http://localhost:2358`
- **Health Check**: `http://localhost:2358/health`
- **System Info**: `http://localhost:2358/system_info`

### Useful Commands

```bash
# Start development with watch functionality
docker-compose -f docker-compose.dev.yml up --build

# Start with ngrok tunnels
docker-compose -f docker-compose.dev.yml --profile tunnel up --build

# View logs
docker-compose logs -f frontend
docker-compose logs -f judge0-server
docker-compose logs -f mongo

# Execute commands in containers
docker-compose exec frontend npm run lint
docker-compose exec frontend npm run build
docker-compose exec mongo mongosh

# Stop all services
docker-compose down

# Remove volumes (⚠️ deletes data)
docker-compose down -v

# Rebuild specific service
docker-compose build frontend

# Check service status
docker-compose ps

# Access Judge0 logs
docker-compose logs -f judge0-server judge0-workers
```

### Development Workflow
1. **Start Services**: `docker-compose -f docker-compose.dev.yml up --build`
2. **Access Application**: `http://localhost:3000`
3. **Database Management**: `http://localhost:8081`
4. **Judge0 API**: `http://localhost:2358`
5. **Ngrok Dashboard**: `http://localhost:4040` (when using tunnels)

## 🔍 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 5373, 2358, 27017, 5432, 6379, 8081, 4040 are available
2. **Permission errors**: Run `sudo chown -R $USER:$USER .` in project directory
3. **Build failures**: Clear Docker cache with `docker system prune -a`
4. **Judge0 not responding**: Check if cgroup-init container is running properly
5. **MongoDB connection issues**: Verify MongoDB container is healthy
6. **Clerk authentication errors**: Ensure environment variables are set correctly

### Health Checks
- Frontend: `http://localhost:3000/`
- Judge0 API: `http://localhost:2358/health`
- MongoDB: `docker-compose exec mongo mongosh`
- Redis: `docker-compose exec redis redis-cli ping`
- PostgreSQL: `docker-compose exec db psql -U judge0 -d judge0`

### Debug Commands
```bash
# Check all container status
docker-compose ps

# Check specific service logs
docker-compose logs -f [service-name]

# Restart specific service
docker-compose restart [service-name]

# Check Judge0 system info
curl http://localhost:2358/system_info

# Test MongoDB connection
docker-compose exec mongo mongosh --eval "db.adminCommand('ping')"

# Check Redis connection
docker-compose exec redis redis-cli ping
```

## 🚀 Deployment

### Production Build
```bash
# Build optimized images
docker-compose build

# Start production services
docker-compose up -d
```

### Environment Setup
1. Create `.env.local` file in `main-fb/` directory
2. Set all required environment variables (see Environment Variables section)
3. Configure external services:
   - Set up Clerk application and get API keys
   - Configure Judge0 instance or use RapidAPI
   - Set up Cloudinary account for file storage
   - Configure Gemini AI API key
4. Update URLs for your production domain:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_APP_URL`
   - `FRONTEND_URL`

### Production Considerations
- **Security**: Use strong passwords and secure API keys
- **Performance**: Configure Redis for caching and Judge0 for code execution
- **Monitoring**: Set up logging and monitoring for all services
- **Backup**: Regular MongoDB backups
- **SSL**: Configure HTTPS for production domains

## 📊 Monitoring

### Logs
```bash
# All services
docker-compose logs

# Specific services
docker-compose logs frontend
docker-compose logs judge0-server
docker-compose logs mongo

# Follow logs
docker-compose logs -f frontend
docker-compose logs -f judge0-server judge0-workers
```

### Resource Usage
```bash
# Container stats
docker stats

# Disk usage
docker system df

# Service health
docker-compose ps
```

### Application Monitoring
- **Frontend**: Next.js built-in monitoring
- **Database**: MongoDB Express at `http://localhost:8081`
- **Code Execution**: Judge0 API health checks
- **Authentication**: Clerk dashboard monitoring

## 🔒 Security

### Container Security
- Non-root users in containers
- Isolated network (`deepdsa-network`)
- Persistent volumes for data
- Health checks for all services
- Privileged containers only for Judge0 (required for code execution)

### Application Security
- **Authentication**: Clerk handles secure user authentication
- **Authorization**: Role-based access control (USER, ADMIN, SUPER_ADMIN)
- **API Security**: Rate limiting and input validation
- **Data Protection**: Environment variables for sensitive data
- **Code Execution**: Sandboxed Judge0 environment for safe code execution

### Environment Security
- Secure environment variable management
- API key rotation capabilities
- Database access controls
- Redis password protection

## 🌐 Ngrok Tunneling

### Setup
1. **Get Ngrok Auth Token**:
   - Sign up at [ngrok.com](https://ngrok.com)
   - Get your auth token from [dashboard.ngrok.com](https://dashboard.ngrok.com/get-started/your-authtoken)

2. **Set Environment Variable**:
   ```bash
   export NGROK_AUTHTOKEN=your_ngrok_auth_token_here
   ```

3. **Start with Tunnels**:
   ```bash
   # Development with tunnels
   docker-compose -f docker-compose.dev.yml --profile tunnel up --build
   
   # Production with tunnels
   docker-compose --profile tunnel up --build
   ```

### Accessing Tunnels
- **All Tunnels**: Visit `http://localhost:4040` for all tunnel status
- **Public URLs**: The ngrok web interface will show all your public URLs

### Tunnel URLs
Once running, you'll get public URLs like:
- Backend: `https://abc123.ngrok.io` → Your API
- Frontend: `https://xyz789.ngrok.io` → Your Next.js app
- MongoDB: `tcp://def456.ngrok.io:12345` → Your database (TCP tunnel)

### Features
- **Automatic HTTPS**: All tunnels are HTTPS by default
- **Custom Domains**: Available with paid ngrok plans
- **Request Inspection**: View all requests in the ngrok web interface
- **Webhook Testing**: Perfect for testing webhooks and integrations

### Security Notes
- **Public Access**: Anyone with the ngrok URL can access your app
- **Development Only**: Use tunnels only for development/testing
- **Auth Token**: Keep your ngrok auth token secure
- **Rate Limits**: Free ngrok accounts have rate limits

## 📝 Additional Notes

### Development Notes
- Development volumes preserve `node_modules` for faster builds
- MongoDB data persists in `mongo_data_dev` volume
- Redis data persists in `redis_data_dev` volume
- Judge0 data persists in `judge0_data_dev` volume
- Frontend uses Next.js standalone output for production
- Ngrok tunnels provide public HTTPS URLs for local development

### Architecture Notes
- **Monorepo**: Frontend and backend are separate but integrated
- **API Routes**: Next.js API routes handle all backend functionality in development
- **Database**: MongoDB with Prisma ORM for data modeling
- **Code Execution**: Self-hosted Judge0 with PostgreSQL and Redis
- **Authentication**: Clerk provides complete authentication solution
- **AI Integration**: Gemini AI powers interview features

### Performance Considerations
- Redis caching for improved performance
- Judge0 batch submissions for efficient test execution
- MongoDB indexing for fast queries
- Next.js optimization features enabled
- Docker multi-stage builds for smaller images

### Future Enhancements
- Backend service re-enablement for production
- Additional programming language support
- Advanced analytics and reporting
- Real-time collaboration features
- Mobile application development 