# DeepDSA - Docker Setup

A full-stack application with Node.js/Express backend and Next.js frontend, containerized with Docker.

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
│   └── src/               # TypeScript source code
├── main-fb/               # Next.js frontend
│   ├── Dockerfile          # Production frontend image
│   ├── Dockerfile.dev      # Development frontend image
│   └── src/               # React/Next.js source code
├── docker-compose.yml      # Production orchestration
├── docker-compose.dev.yml  # Development orchestration
└── README.md              # This file
```

## 🌐 Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Next.js application |
| Backend | 5373 | Express.js API |
| MongoDB | 27017 | Database |
| Redis | 6379 | Cache & sessions |
| Mongo Express | 8081 | Database management UI |
| Ngrok | 4040 | All tunnels web interface |

## 🔧 Environment Variables

### Backend (.env.local)
```env
MONGO_URI=mongodb://mongo:27017/deepdsa
PORT=5373
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5373
```

### Ngrok Configuration
```env
# Get your auth token from https://dashboard.ngrok.com/get-started/your-authtoken
NGROK_AUTHTOKEN=your_ngrok_auth_token_here
```

## 🛠️ Development

### Hot Reloading with Watch
The development setup uses Docker Compose's watch functionality for optimal development experience:

#### Backend Watch Configuration:
- **Source Code**: `./backend/src` → `/app/src` (sync)
- **Package Files**: `./backend/package.json` → rebuild container
- **Dependencies**: `./backend/package-lock.json` → sync
- **Ignored**: `node_modules/`, `dist/`, `logs/`

#### Frontend Watch Configuration:
- **Source Code**: `./main-fb/src` → `/app/src` (sync)
- **Public Assets**: `./main-fb/public` → `/app/public` (sync)
- **Config Files**: `next.config.ts`, `tsconfig.json`, `postcss.config.mjs` → sync
- **Package Files**: `./main-fb/package.json` → rebuild container
- **Ignored**: `node_modules/`, `.next/`

### Watch Actions:
- **`sync`**: File changes are immediately synced to the container
- **`rebuild`**: Container is rebuilt when package.json changes

### Database Management
Access MongoDB Express at `http://localhost:8081`:
- Username: `admin`
- Password: `admin123`

### Useful Commands

```bash
# Start development with watch functionality
docker-compose -f docker-compose.dev.yml up --build

# View logs
docker-compose logs -f [service-name]

# Execute commands in containers
docker-compose exec backend npm run build
docker-compose exec frontend npm run lint

# Stop all services
docker-compose down

# Remove volumes (⚠️ deletes data)
docker-compose down -v

# Rebuild specific service
docker-compose build backend

# Scale services
docker-compose up --scale backend=2

# Watch specific files/directories
# The watch functionality automatically monitors:
# - Source code changes (immediate sync)
# - Package.json changes (container rebuild)
# - Configuration file changes (sync)
```

## 🔍 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 5000, 27017, 6379, 8081 are available
2. **Permission errors**: Run `sudo chown -R $USER:$USER .` in project directory
3. **Build failures**: Clear Docker cache with `docker system prune -a`

### Health Checks
- Backend: `http://localhost:5373/`
- Frontend: `http://localhost:3000/`
- MongoDB: `docker-compose exec mongo mongosh`
- Redis: `docker-compose exec redis redis-cli ping`

## 🚀 Deployment

### Production Build
```bash
# Build optimized images
docker-compose build

# Start production services
docker-compose up -d
```

### Environment Setup
1. Create `.env.local` files in both `backend/` and `main-fb/`
2. Set production environment variables
3. Update `FRONTEND_URL` and `NEXT_PUBLIC_API_URL` for your domain

## 📊 Monitoring

### Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend

# Follow logs
docker-compose logs -f frontend
```

### Resource Usage
```bash
# Container stats
docker stats

# Disk usage
docker system df
```

## 🔒 Security

- Non-root users in containers
- Isolated network (`deepdsa-network`)
- Persistent volumes for data
- Health checks for all services

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

## 📝 Notes

- Development volumes preserve `node_modules` for faster builds
- MongoDB data persists in `mongo_data` volume
- Redis data persists in `redis_data` volume
- Frontend uses Next.js standalone output for production
- Ngrok tunnels provide public HTTPS URLs for local development 