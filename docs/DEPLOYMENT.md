# DEPLOYMENT GUIDE - Queue Cure

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Deployment on Vercel (Frontend)](#deployment-on-vercel-frontend)
3. [Deployment on Railway (Backend)](#deployment-on-railway-backend)
4. [Deployment on Heroku (Backend)](#deployment-on-heroku-backend)
5. [Self-Hosted Deployment](#self-hosted-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Production Checklist](#production-checklist)

---

## Local Development Setup

### 1. Clone/Setup the Project

```bash
# Navigate to project directory
cd Queue_Hackathon

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Start Development Servers

**Terminal 1 - Backend (Port 5000):**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend (Port 3000):**
```bash
cd frontend
npm run dev
```

### 3. Access Application
- Receptionist Dashboard: http://localhost:3000
- Waiting Room: http://localhost:3000/waiting-room
- Doctor Analytics: http://localhost:3000/doctor-analytics
- Patient Tracking: http://localhost:3000/track?token=1

---

## Deployment on Vercel (Frontend)

Vercel is perfect for React frontends with automatic deployments.

### Step 1: Prepare Frontend

```bash
cd frontend
npm run build
```

### Step 2: Connect to Vercel

**Option A: Using Vercel CLI**
```bash
npm install -g vercel
vercel
# Follow prompts to connect to your Git repo
```

**Option B: GitHub Integration**
1. Push code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Select your GitHub repository
5. Import from Git

### Step 3: Configure Environment Variables

In Vercel Dashboard:
```
Settings → Environment Variables

VITE_API_URL=https://queue-cure-backend.up.railway.app
VITE_SOCKET_URL=https://queue-cure-backend.up.railway.app
```

### Step 4: Deploy

```bash
vercel --prod
```

**Result:**
- Frontend URL: `https://queue-cure.vercel.app`

---

## Deployment on Railway (Backend) - RECOMMENDED

Railway is simple and has free tier.

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project

### Step 2: Connect Backend

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to Railway project
cd backend
railway link

# Deploy
railway up
```

### Step 3: Set Environment Variables

In Railway Dashboard:
```
Project → Variables

PORT=5000
NODE_ENV=production
```

### Step 4: Get Your Backend URL

In Railway Dashboard, find your service URL:
```
Your backend will be available at:
https://queue-cure-backend.up.railway.app
```

### Step 5: Update Frontend Environment

Update frontend environment variables to point to Railway backend:
```
VITE_API_URL=https://queue-cure-backend.up.railway.app
VITE_SOCKET_URL=https://queue-cure-backend.up.railway.app
```

---

## Deployment on Heroku (Backend) - Alternative

### Step 1: Create Heroku App

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create queue-cure-backend

# Add buildpack
heroku buildpacks:add heroku/nodejs -a queue-cure-backend
```

### Step 2: Deploy

```bash
cd backend

# Add git remote
heroku git:remote -a queue-cure-backend

# Deploy
git push heroku main
```

### Step 3: Configure

```bash
# Set environment variables
heroku config:set PORT=5000 -a queue-cure-backend
heroku config:set NODE_ENV=production -a queue-cure-backend

# View logs
heroku logs --tail -a queue-cure-backend
```

### Step 4: Get Backend URL

```bash
heroku domains -a queue-cure-backend
# Your backend: https://queue-cure-backend.herokuapp.com
```

---

## Self-Hosted Deployment

### Option 1: AWS EC2

**Step 1: Launch EC2 Instance**
```bash
# Amazon Linux 2 or Ubuntu 20.04
# Choose t2.micro for free tier
```

**Step 2: Connect and Setup**
```bash
# SSH into instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install nodejs -y

# Install Git
sudo apt install git -y

# Clone repository
git clone https://github.com/yourusername/queue-cure.git
cd queue-cure
```

**Step 3: Setup Backend**
```bash
cd backend
npm install
npm start
```

**Step 4: Setup Frontend**
```bash
cd frontend
npm install
npm run build

# Install and configure nginx
sudo apt install nginx -y
sudo cp -r dist /var/www/html/queue-cure
```

**Step 5: Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/default
```

Add:
```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    server_name your-domain.com;
    
    # Frontend
    location / {
        root /var/www/html/queue-cure;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:5000/socket.io;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**Step 6: Setup SSL (Optional but Recommended)**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### Option 2: DigitalOcean Droplet

Similar to AWS - choose Ubuntu 20.04 Droplet, follow AWS steps above.

### Option 3: Docker Deployment

**Dockerfile for Backend**
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

**Dockerfile for Frontend**
```dockerfile
FROM node:16-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

Run with:
```bash
docker-compose up -d
```

---

## Environment Configuration

### Frontend `.env` (if using create-react-app or Vite)

```env
VITE_API_URL=https://api.queue-cure.com
VITE_SOCKET_URL=https://api.queue-cure.com
VITE_CLINIC_ID=clinic-001
VITE_APP_NAME=Queue Cure
```

### Backend `.env`

```env
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://queue-cure.vercel.app
DB_HOST=localhost
DB_PORT=3306
DB_USER=queuecure
DB_PASS=secure_password
DB_NAME=queuecure

# Optional
LOG_LEVEL=info
ANALYTICS_ENABLED=true
```

---

## Production Checklist

### Security
- [ ] Enable HTTPS/SSL everywhere
- [ ] Add authentication (JWT tokens)
- [ ] Validate and sanitize all inputs
- [ ] Add rate limiting (express-rate-limit)
- [ ] Set CORS correctly for production domains
- [ ] Use environment variables for secrets
- [ ] Add security headers (helmet.js)
- [ ] Implement CSRF protection

### Performance
- [ ] Enable compression (gzip)
- [ ] Add CDN for static assets
- [ ] Optimize images
- [ ] Minify CSS/JS
- [ ] Enable caching headers
- [ ] Add Redis for session management
- [ ] Implement database connection pooling

### Monitoring & Logging
- [ ] Setup error tracking (Sentry)
- [ ] Enable application logging
- [ ] Monitor server health
- [ ] Setup alerts for downtime
- [ ] Track performance metrics
- [ ] Monitor database performance

### Database
- [ ] Migrate to persistent database (MySQL/PostgreSQL)
- [ ] Setup automated backups
- [ ] Add database indexing
- [ ] Setup read replicas for scaling
- [ ] Enable query logging and optimization
- [ ] Configure connection pooling

### Scalability
- [ ] Setup load balancing
- [ ] Containerize application (Docker)
- [ ] Use auto-scaling groups
- [ ] Implement horizontal scaling
- [ ] Setup message queue (Redis/RabbitMQ)
- [ ] Use multi-clinic architecture

### Testing
- [ ] Unit tests (Jest)
- [ ] Integration tests
- [ ] E2E tests (Cypress/Playwright)
- [ ] Load testing
- [ ] Security testing

### Documentation
- [ ] API documentation
- [ ] Deployment runbooks
- [ ] Incident response procedures
- [ ] User guides
- [ ] Admin guides

### CI/CD
- [ ] Setup GitHub Actions
- [ ] Automated testing on PR
- [ ] Automated deployment to staging
- [ ] Manual approval for production
- [ ] Rollback procedures

---

## Monitoring Your Deployment

### Using PM2 (for self-hosted)

```bash
# Install PM2
npm install -g pm2

# Start backend with PM2
cd backend
pm2 start server.js --name "queue-cure-backend"

# Monitor
pm2 monit

# View logs
pm2 logs queue-cure-backend

# Setup auto-restart on reboot
pm2 startup
pm2 save
```

### Useful Commands

```bash
# Check backend health
curl https://api.queue-cure.com/api/health

# Check frontend
curl https://queue-cure.vercel.app

# Monitor logs
tail -f backend/logs/app.log
```

---

## Troubleshooting

### Frontend Can't Connect to Backend

**Problem:** "ERR_CONNECTION_REFUSED"

**Solution:**
```javascript
// Check frontend environment variables
console.log(process.env.VITE_API_URL);

// Verify backend is running
curl https://your-backend.com/api/health

// Update Socket.IO connection
// frontend/src/utils/socket.js - check initializeSocket() URL
```

### WebSocket Connection Failed

**Problem:** "WebSocket is closed before the connection is established"

**Solution:**
```javascript
// Backend: Check CORS configuration
io.use((socket, next) => {
  const origin = socket.request.headers.origin;
  console.log('Connection from:', origin);
  next();
});

// Frontend: Verify Socket.IO client version matches server
npm list socket.io-client
npm list socket.io (backend)
```

### High Latency/Slow Updates

**Problem:** Events take >1 second to propagate

**Solution:**
1. Check network latency: `ping your-backend.com`
2. Monitor server CPU/memory
3. Check database query times
4. Enable compression in nginx/server
5. Use Redis for caching

### Database Connection Issues

**Problem:** "Cannot connect to database"

**Solution:**
```bash
# Test database connection
mysql -h localhost -u queuecure -p

# Check database exists
mysql> SHOW DATABASES;

# Verify credentials in .env
cat .env | grep DB_
```

---

## Rollback Procedures

### Vercel Rollback
1. Go to Vercel Dashboard
2. Click on your project
3. Go to Deployments tab
4. Find previous deployment
5. Click three dots → Promote to Production

### Railway Rollback
```bash
railway down  # Stop current deployment
git revert HEAD
railway up    # Deploy previous version
```

### Manual Rollback
```bash
# SSH into server
ssh user@server.com

# Kill current process
pm2 stop queue-cure-backend

# Checkout previous code
git checkout previous-commit

# Reinstall and restart
npm install
npm start
```

---

## Getting Help

- **Documentation**: See `README.md` and `docs/`
- **Issues**: Check GitHub issues
- **Logs**: Check server logs with `pm2 logs`
- **Network**: Check browser DevTools → Network tab
- **Console**: Check browser console for errors

---

**Queue Cure Deployment Guide**
Follow this guide to get your system live in production!
