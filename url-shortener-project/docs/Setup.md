# Setup and Deployment Guide

## Overview

This guide provides comprehensive instructions for setting up, configuring, and deploying the URL Shortener application. It covers local development setup, production deployment, and troubleshooting common issues.

## Prerequisites

### System Requirements

**Minimum Requirements:**
- **Node.js:** Version 14.0 or higher
- **npm:** Version 6.0 or higher (comes with Node.js)
- **MongoDB:** Version 4.0 or higher
- **Operating System:** Windows 10, macOS 10.14, or Linux (Ubuntu 18.04+)
- **Memory:** 512MB RAM minimum
- **Storage:** 100MB free disk space

**Recommended Requirements:**
- **Node.js:** Version 18.0 or higher (LTS)
- **npm:** Version 8.0 or higher
- **MongoDB:** Version 6.0 or higher
- **Memory:** 2GB RAM
- **Storage:** 1GB free disk space

### Software Dependencies

1. **Node.js and npm**
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version` and `npm --version`

2. **MongoDB**
   - **Option 1:** Local installation from [mongodb.com](https://www.mongodb.com/try/download/community)
   - **Option 2:** MongoDB Atlas (cloud database)
   - **Option 3:** Docker container

3. **Git** (optional, for cloning repository)
   - Download from [git-scm.com](https://git-scm.com/)

## Local Development Setup

### Step 1: Clone or Download the Project

**Option A: Using Git**
```bash
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener-project
```

**Option B: Download ZIP**
1. Download the project ZIP file
2. Extract to desired directory
3. Navigate to `url-shortener-project` folder

### Step 2: Install Dependencies

```bash
# Navigate to project directory
cd url-shortener-project

# Install Node.js dependencies
npm install
```

**Expected Output:**
```
added 45 packages, and audited 46 packages in 3s
found 0 vulnerabilities
```

### Step 3: Set Up MongoDB

**Option A: Local MongoDB Installation**

1. **Install MongoDB Community Server**
   - Download and install from MongoDB website
   - Follow platform-specific installation instructions

2. **Start MongoDB Service**
   ```bash
   # Windows (as Administrator)
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux (Ubuntu)
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

3. **Verify MongoDB is Running**
   ```bash
   # Connect to MongoDB shell
   mongosh
   
   # Or check if service is running
   # Windows
   sc query MongoDB
   
   # Linux/macOS
   ps aux | grep mongod
   ```

**Option B: MongoDB Atlas (Cloud)**

1. **Create MongoDB Atlas Account**
   - Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create a new cluster

2. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

3. **Update Configuration**
   - Modify `server.js` to use Atlas connection string
   ```javascript
   const MONGO_URI = "mongodb+srv://username:password@cluster.mongodb.net/Url_Shortner";
   ```

**Option C: Docker MongoDB**

```bash
# Run MongoDB in Docker container
docker run -d --name mongodb -p 27017:27017 mongo:latest

# Verify container is running
docker ps
```

### Step 4: Configure Environment Variables (Recommended)

1. **Create Environment File**
   ```bash
   # Create .env file in project root
   touch .env
   ```

2. **Add Configuration Variables**
   ```bash
   # .env file content
   PORT=5001
   MONGODB_URI=mongodb://127.0.0.1:27017/Url_Shortner
   NODE_ENV=development
   ```

3. **Install dotenv Package**
   ```bash
   npm install dotenv
   ```

4. **Update server.js to Use Environment Variables**
   ```javascript
   require('dotenv').config();
   
   const PORT = process.env.PORT || 5001;
   const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Url_Shortner';
   ```

### Step 5: Start the Application

```bash
# Start the server
npm run devstart

# Or use node directly
node server.js
```

**Expected Output:**
```
Server started 5001
Successfully Connected to MongoDB !!
```

### Step 6: Verify Installation

1. **Open Web Browser**
   - Navigate to `http://localhost:5001`

2. **Test Basic Functionality**
   - Enter a URL (e.g., `https://www.google.com`)
   - Click "Shrink" button
   - Verify shortened URL appears in table
   - Click on shortened URL to test redirect

## Production Deployment

### Deployment Options

#### Option 1: Traditional VPS/Server Deployment

**1. Server Preparation**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**2. Application Deployment**
```bash
# Clone repository
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener-project

# Install dependencies
npm ci --only=production

# Create production environment file
cat > .env << EOF
PORT=80
MONGODB_URI=mongodb://localhost:27017/Url_Shortner
NODE_ENV=production
EOF

# Install PM2 for process management
sudo npm install -g pm2

# Start application with PM2
pm2 start server.js --name "url-shortener"
pm2 startup
pm2 save
```

**3. Nginx Reverse Proxy (Optional)**
```bash
# Install Nginx
sudo apt install nginx

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/url-shortener << EOF
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/url-shortener /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Option 2: Docker Deployment

**1. Create Dockerfile**
```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 5001

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Start application
CMD ["node", "server.js"]
```

**2. Create docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5001:5001"
    environment:
      - PORT=5001
      - MONGODB_URI=mongodb://mongodb:27017/Url_Shortner
      - NODE_ENV=production
    depends_on:
      - mongodb
    restart: unless-stopped

  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

**3. Deploy with Docker Compose**
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Option 3: Cloud Platform Deployment

**Heroku Deployment**

1. **Prepare Application**
   ```bash
   # Create Procfile
   echo "web: node server.js" > Procfile
   
   # Update package.json
   {
     "scripts": {
       "start": "node server.js"
     },
     "engines": {
       "node": "18.x"
     }
   }
   ```

2. **Deploy to Heroku**
   ```bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Login and create app
   heroku login
   heroku create your-app-name
   
   # Set environment variables
   heroku config:set MONGODB_URI=your-mongodb-atlas-uri
   heroku config:set NODE_ENV=production
   
   # Deploy
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

**Vercel Deployment**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Create vercel.json**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/server.js"
       }
     ]
   }
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port number | `5001` | No |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/Url_Shortner` | No |
| `NODE_ENV` | Environment mode | `development` | No |

### Security Configuration

**1. Environment Variables for Sensitive Data**
```bash
# Production .env file
PORT=80
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/Url_Shortner
NODE_ENV=production
SESSION_SECRET=your-random-secret-key
```

**2. MongoDB Security**
```bash
# Enable MongoDB authentication
mongosh
use admin
db.createUser({
  user: "urlshortener",
  pwd: "secure-password",
  roles: ["readWrite"]
})
```

**3. Firewall Configuration**
```bash
# Ubuntu UFW
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Troubleshooting

### Common Issues and Solutions

#### 1. MongoDB Connection Issues

**Problem:** `MongoNetworkError: failed to connect to server`

**Solutions:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB service
sudo systemctl start mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test connection
mongosh --host localhost --port 27017
```

#### 2. Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::5001`

**Solutions:**
```bash
# Find process using port
lsof -i :5001
netstat -tulpn | grep :5001

# Kill process
kill -9 <PID>

# Or use different port
PORT=3000 node server.js
```

#### 3. NPM Installation Issues

**Problem:** `npm ERR! code EACCES`

**Solutions:**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Or use npx
npx npm install

# Clear npm cache
npm cache clean --force
```

#### 4. Module Not Found Errors

**Problem:** `Error: Cannot find module 'express'`

**Solutions:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check if package.json exists
ls -la package.json

# Install missing packages manually
npm install express mongoose ejs shortid
```

### Performance Troubleshooting

#### 1. Slow Database Queries

**Solutions:**
```javascript
// Add database indexes
const mongoose = require('mongoose');
const UrlSchema = require('./models/shorturl');

// Add indexes for better performance
UrlSchema.index({ short: 1 });
UrlSchema.index({ createdAt: -1 });
```

#### 2. Memory Issues

**Solutions:**
```bash
# Monitor memory usage
htop
free -h

# Limit Node.js memory
node --max-old-space-size=512 server.js

# Use PM2 with memory limits
pm2 start server.js --max-memory-restart 500M
```

### Debugging

#### Enable Debug Logging

```javascript
// Add to server.js
const debug = process.env.NODE_ENV === 'development';

const log = (message) => {
  if (debug) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }
};

// Use throughout application
log('Server starting...');
log(`Connecting to MongoDB: ${MONGO_URI}`);
```

#### Use Node.js Debugger

```bash
# Start with debugger
node --inspect server.js

# Or with breakpoints
node --inspect-brk server.js
```

## Monitoring and Maintenance

### Health Checks

**Add Health Check Endpoint:**
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
```

### Logging

**Install Winston for Better Logging:**
```bash
npm install winston
```

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Backup Strategy

**MongoDB Backup:**
```bash
# Create backup
mongodump --db Url_Shortner --out /path/to/backup

# Restore backup
mongorestore --db Url_Shortner /path/to/backup/Url_Shortner
```

### Updates and Maintenance

**Regular Maintenance Tasks:**
```bash
# Update dependencies
npm audit
npm update

# Update Node.js
nvm install --lts
nvm use --lts

# Monitor disk space
df -h

# Monitor logs
tail -f /var/log/mongodb/mongod.log
pm2 logs url-shortener
```

## Security Best Practices

### Production Security Checklist

- [ ] Use HTTPS (SSL/TLS certificates)
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Enable CORS properly
- [ ] Use security headers
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities
- [ ] Backup data regularly

### Security Headers

```javascript
// Add security middleware
const helmet = require('helmet');
app.use(helmet());

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
```

This comprehensive setup guide should help you successfully deploy and maintain the URL Shortener application in various environments.