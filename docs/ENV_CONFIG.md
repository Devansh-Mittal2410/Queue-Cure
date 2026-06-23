# Environment Variables Configuration

## Backend .env Example

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Database (for future production)
DB_HOST=localhost
DB_PORT=3306
DB_USER=queuecure
DB_PASS=your_secure_password
DB_NAME=queuecure
DB_POOL_SIZE=10

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/app.log

# Features
ENABLE_ANALYTICS=true
ENABLE_VOICE_ANNOUNCEMENTS=true
ENABLE_SOUND_NOTIFICATIONS=true

# Security (for production)
JWT_SECRET=your_jwt_secret_key_here
API_RATE_LIMIT=100

# Optional
SENTRY_DSN=
ENVIRONMENT=development
```

## Frontend .env Example

Create a `.env.local` file in the `frontend/` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

# App Configuration
VITE_CLINIC_ID=clinic-001
VITE_APP_NAME=Queue Cure
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_DARK_MODE=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_VOICE=true

# Development
VITE_DEBUG_MODE=true
```

## Production Environment Variables

### Backend Production

```env
# Server
PORT=5000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://queue-cure.vercel.app

# Database
DB_HOST=your-db-server.com
DB_PORT=3306
DB_USER=queuecure_prod
DB_PASS=super_secure_password_123!
DB_NAME=queuecure_production
DB_POOL_SIZE=20

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/queue-cure/app.log

# Security
JWT_SECRET=use_a_very_long_random_string_here_min_32_chars
API_RATE_LIMIT=1000
ENABLE_HTTPS=true

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/123456
DATADOG_API_KEY=your_datadog_key

# Clinic Settings
CLINIC_NAME=General Clinic
CLINIC_ID=clinic-001
MAX_CONSULTATION_TIME=60
MIN_CONSULTATION_TIME=5
```

### Frontend Production

```env
# API
VITE_API_URL=https://api.queue-cure.com
VITE_SOCKET_URL=https://api.queue-cure.com

# App
VITE_CLINIC_ID=clinic-001
VITE_APP_NAME=Queue Cure
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_VOICE=true

# Analytics
VITE_GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/123456
```

## Docker Environment Variables

### For docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    environment:
      - PORT=5000
      - NODE_ENV=production
      - CORS_ORIGIN=http://frontend:3000
      - DB_HOST=mysql
      - DB_USER=${DB_USER}
      - DB_PASS=${DB_PASS}
      - DB_NAME=queuecure

  frontend:
    environment:
      - VITE_API_URL=http://backend:5000
      - VITE_SOCKET_URL=http://backend:5000

  mysql:
    environment:
      - MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
      - MYSQL_DATABASE=queuecure
      - MYSQL_USER=${DB_USER}
      - MYSQL_PASSWORD=${DB_PASS}
```

### .env file for docker-compose

```env
DB_USER=queuecure_user
DB_PASS=secure_database_password
DB_ROOT_PASSWORD=root_secure_password
```

## Railway Environment Configuration

### Deploy to Railway

Set these variables in Railway dashboard:

```
Backend Service Variables:
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
```

## Vercel Environment Configuration

### Frontend on Vercel

Go to: Project Settings → Environment Variables

```
Production, Preview, Development:

VITE_API_URL=https://queue-cure-api.up.railway.app
VITE_SOCKET_URL=https://queue-cure-api.up.railway.app
VITE_APP_NAME=Queue Cure
```

## Heroku Environment Configuration

### Deploy to Heroku

```bash
# Set variables
heroku config:set PORT=5000 -a your-app-name
heroku config:set NODE_ENV=production -a your-app-name
heroku config:set CORS_ORIGIN=https://your-frontend.com -a your-app-name

# Verify
heroku config -a your-app-name
```

## Environment Variable Guide

### PORT
- **Default**: 5000
- **Type**: Number
- **Purpose**: Server port for backend
- **Production**: Usually set by hosting provider

### NODE_ENV
- **Options**: `development`, `production`
- **Default**: `development`
- **Effect**: Disables/enables optimizations, logging levels

### CORS_ORIGIN
- **Default**: `http://localhost:3000`
- **Format**: Single URL or comma-separated
- **Important**: Must match frontend URL exactly

### Database Variables
- **DB_HOST**: Database server address
- **DB_PORT**: Database port (3306 for MySQL)
- **DB_USER**: Database username
- **DB_PASS**: Database password
- **DB_NAME**: Database name

### API Keys
- **JWT_SECRET**: For authentication (min 32 chars)
- **SENTRY_DSN**: Error tracking
- **GOOGLE_ANALYTICS_ID**: Analytics tracking

### Feature Flags
- **ENABLE_ANALYTICS**: Enable analytics collection
- **ENABLE_VOICE_ANNOUNCEMENTS**: Enable text-to-speech
- **ENABLE_SOUND_NOTIFICATIONS**: Enable notification sounds
- **ENABLE_DARK_MODE**: Enable dark mode in UI

## Security Best Practices

### For Secrets

```bash
# NEVER commit .env files
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# Use strong passwords (min 16 chars)
# Generate with: openssl rand -base64 32

# Rotate secrets regularly
# Use different keys for dev/staging/production
```

### Environment Separation

```
Development:
- Use localhost URLs
- Enable debug logging
- Use weak secrets (OK, only local)

Staging:
- Use staging URLs
- Moderate logging
- Use production-like secrets

Production:
- Use production URLs
- Minimal logging
- Strong secrets (32+ chars)
- Regular rotation
```

## Debugging Environment Issues

### Check Which .env is Loaded

```bash
# Backend
cd backend
npm start
# Check console output

# Frontend
cd frontend
npm run dev
# Check browser console: console.log(import.meta.env)
```

### Verify Variables in Code

```javascript
// Backend (Node.js)
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Frontend (Vite - must start with VITE_)
console.log('API URL:', import.meta.env.VITE_API_URL);
```

### Common Issues

```bash
# Issue: "Cannot connect to backend"
# Solution: Check VITE_API_URL matches actual backend URL

# Issue: "CORS error"
# Solution: Check CORS_ORIGIN includes your frontend domain

# Issue: "Database connection failed"
# Solution: Verify DB_HOST, DB_PORT, DB_USER, DB_PASS

# Issue: "JWT errors in production"
# Solution: Ensure JWT_SECRET is set and consistent
```

## Tips

1. **Local Development**: Use `localhost` URLs
2. **Production**: Use fully qualified domain names (https)
3. **Secrets**: Never share or commit secrets
4. **Rotation**: Change secrets every 90 days
5. **Auditing**: Log when secrets are accessed
6. **Monitoring**: Alert on unusual environment changes

---

**Queue Cure Environment Configuration**
Properly configure your environment for secure and reliable deployment!
