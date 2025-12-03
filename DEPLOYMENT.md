# Deployment Guide - Atlantic Weizard

This guide covers deploying Atlantic Weizard to production environments.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Application Deployment](#application-deployment)
- [Post-Deployment](#post-deployment)
- [Monitoring \u0026 Maintenance](#monitoring--maintenance)

---

## Pre-Deployment Checklist

Before deploying to production, ensure you have:

### Infrastructure
- [ ] Production server (EC2, VPS, or similar)
- [ ] PostgreSQL database (version 16+)
- [ ] Domain name configured
- [ ] SSL/TLS certificate
- [ ] Reverse proxy (nginx recommended)

### Credentials \u0026 Secrets
- [ ] PayU production merchant key
- [ ] PayU production merchant salt
- [ ] Strong SESSION_SECRET generated
- [ ] Database credentials secured
- [ ] Email service API key (optional)

### Code \u0026 Configuration
- [ ] Latest code from main branch
- [ ] All dependencies installed
- [ ] TypeScript compilation successful
- [ ] Environment variables configured
- [ ] Database migrations ready

---

## Environment Setup

### 1. Server Requirements

**Minimum Specifications:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB SSD
- OS: Ubuntu 22.04 LTS (recommended)

**Software:**
- Node.js 20.x
- PostgreSQL 16.x
- nginx
- PM2 (process manager)
- Git

### 2. Install Dependencies

```bash
# Update system
sudo apt update \u0026\u0026 sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL 16
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \u003e /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-16

# Install nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

### 3. Create Application User

```bash
# Create dedicated user
sudo adduser --disabled-password --gecos "" atlantic

# Add to necessary groups
sudo usermod -aG sudo atlantic
```

---

## Database Setup

### 1. Create Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE atlantic_weizard;
CREATE USER atlantic_user WITH ENCRYPTED PASSWORD 'your-strong-password';
GRANT ALL PRIVILEGES ON DATABASE atlantic_weizard TO atlantic_user;
\q
```

### 2. Configure PostgreSQL

Edit `/etc/postgresql/16/main/postgresql.conf`:

```conf
# Listen on all interfaces (or specific IP)
listen_addresses = 'localhost'

# Connection limits
max_connections = 100

# Memory settings (adjust based on your RAM)
shared_buffers = 256MB
effective_cache_size = 1GB
```

Edit `/etc/postgresql/16/main/pg_hba.conf`:

```conf
# Allow local connections
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

Restart PostgreSQL:

```bash
sudo systemctl restart postgresql
```

### 3. Enable SSL (Recommended)

```bash
# Generate self-signed certificate (or use Let's Encrypt)
sudo -u postgres openssl req -new -x509 -days 365 -nodes \
  -text -out /var/lib/postgresql/16/main/server.crt \
  -keyout /var/lib/postgresql/16/main/server.key

# Set permissions
sudo chmod 600 /var/lib/postgresql/16/main/server.key
sudo chown postgres:postgres /var/lib/postgresql/16/main/server.*

# Enable SSL in postgresql.conf
ssl = on
ssl_cert_file = '/var/lib/postgresql/16/main/server.crt'
ssl_key_file = '/var/lib/postgresql/16/main/server.key'
```

---

## Application Deployment

### 1. Clone Repository

```bash
# Switch to application user
su - atlantic

# Clone repository
git clone https://github.com/your-org/AtlanticWeizard.git
cd AtlanticWeizard
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

**Production .env:**

```bash
# Database
DATABASE_URL=postgresql://atlantic_user:your-password@localhost:5432/atlantic_weizard?sslmode=require

# Session (generate with: openssl rand -base64 32)
SESSION_SECRET=your-generated-secret-here

# PayU Production
PAYU_MERCHANT_KEY=your-production-key
PAYU_MERCHANT_SALT=your-production-salt
PAYU_MODE=LIVE
PAYU_SUCCESS_URL=https://yourdomain.com/api/checkout/payu-callback/success
PAYU_FAILURE_URL=https://yourdomain.com/api/checkout/payu-callback/failure

# Application
BASE_URL=https://yourdomain.com
PORT=5000
NODE_ENV=production
TRUST_PROXY=true

# Email (optional)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@yourdomain.com

# Logging
LOG_LEVEL=info
```

### 3. Install Dependencies

```bash
npm install --production
```

### 4. Build Application

```bash
npm run build
```

### 5. Database Migration

```bash
# Push schema to database
npm run db:push

# Create admin user
npm run seed:admin
```

### 6. Start with PM2

```bash
# Start application
pm2 start npm --name "atlantic-weizard" -- start

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command
```

---

## Nginx Configuration

### 1. Create Nginx Config

Create `/etc/nginx/sites-available/atlantic-weizard`:

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;

# Upstream
upstream atlantic_app {
    server 127.0.0.1:5000;
    keepalive 64;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logging
    access_log /var/log/nginx/atlantic-weizard-access.log;
    error_log /var/log/nginx/atlantic-weizard-error.log;

    # Client body size
    client_max_body_size 10M;

    # Proxy settings
    location / {
        proxy_pass http://atlantic_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API rate limiting
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://atlantic_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Auth endpoints - stricter rate limiting
    location /api/admin/auth/ {
        limit_req zone=auth_limit burst=5 nodelay;
        proxy_pass http://atlantic_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://atlantic_app;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/atlantic-weizard /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 3. SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

---

## Post-Deployment

### 1. Verify Application

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs atlantic-weizard

# Monitor
pm2 monit
```

### 2. Test Endpoints

```bash
# Health check
curl https://yourdomain.com/api/products

# Admin login
curl -X POST https://yourdomain.com/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@atlanticweizard.com","password":"Admin@123"}'
```

### 3. Change Admin Password

1. Login to admin panel
2. Go to Users section
3. Edit admin account
4. Change password

### 4. Test Payment Flow

1. Add products through admin panel
2. Make a test order
3. Complete payment with PayU test credentials
4. Verify order status updates
5. Check transaction logs

---

## Monitoring \u0026 Maintenance

### 1. Set Up Monitoring

**PM2 Monitoring:**

```bash
# Enable PM2 monitoring
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

**System Monitoring:**

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Monitor resources
htop
```

### 2. Database Backups

Create backup script `/home/atlantic/backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/home/atlantic/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="atlantic_weizard_$DATE.sql"

mkdir -p $BACKUP_DIR

pg_dump -U atlantic_user -h localhost atlantic_weizard \u003e "$BACKUP_DIR/$FILENAME"

# Compress
gzip "$BACKUP_DIR/$FILENAME"

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $FILENAME.gz"
```

Make executable and add to cron:

```bash
chmod +x /home/atlantic/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/atlantic/backup-db.sh
```

### 3. Log Management

```bash
# View application logs
pm2 logs atlantic-weizard

# View nginx logs
sudo tail -f /var/log/nginx/atlantic-weizard-access.log
sudo tail -f /var/log/nginx/atlantic-weizard-error.log

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

### 4. Updates \u0026 Maintenance

```bash
# Pull latest code
cd /home/atlantic/AtlanticWeizard
git pull origin main

# Install dependencies
npm install --production

# Build
npm run build

# Restart application
pm2 restart atlantic-weizard

# Check status
pm2 status
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs atlantic-weizard --lines 100

# Check environment variables
pm2 env 0

# Restart
pm2 restart atlantic-weizard
```

### Database Connection Issues

```bash
# Test connection
psql -U atlantic_user -h localhost -d atlantic_weizard

# Check PostgreSQL status
sudo systemctl status postgresql

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Security Hardening

### 1. Firewall

```bash
# Install UFW
sudo apt install -y ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

### 2. Fail2Ban

```bash
# Install fail2ban
sudo apt install -y fail2ban

# Configure
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Enable and start
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Regular Updates

```bash
# Update system packages
sudo apt update \u0026\u0026 sudo apt upgrade -y

# Update Node.js packages
npm audit
npm audit fix

# Update PM2
pm2 update
```

---

## Rollback Procedure

If deployment fails:

```bash
# Stop application
pm2 stop atlantic-weizard

# Checkout previous version
git checkout HEAD~1

# Rebuild
npm install --production
npm run build

# Restart
pm2 restart atlantic-weizard
```

---

## Support

For deployment issues:
- Check logs first
- Review this guide
- Contact: support@atlanticweizard.com

---

**Last Updated:** December 3, 2025
