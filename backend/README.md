# DeepDSA Backend

A Node.js/Express backend with TypeScript for the DeepDSA project.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment file:
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` with your configuration:
   ```
   MONGO_URI=mongodb://localhost:27017/deepdsa
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Start the server:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Project Structure

- `src/index.ts` - Main server entry point
- `src/config/` - Configuration files (database, CORS, environment)
- `src/middleware/` - Express middleware
- `src/routes/` - API routes with versioning
- `src/controllers/` - Route controllers
- `src/lib/` - Utility libraries

## API Endpoints

- `GET /` - Health check
- `GET /api/v1/health` - API v1 health check

## Features

- TypeScript support
- Express.js with middleware
- MongoDB with Mongoose
- CORS configuration
- Rate limiting
- Environment variable validation
- API versioning
- Request logging 