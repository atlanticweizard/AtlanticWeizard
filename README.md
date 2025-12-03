# Atlantic Weizard - E-Commerce Platform

A full-stack e-commerce application with PayU payment integration, admin dashboard, and multi-currency support (INR/USD).

## Features

- Product catalog with cart functionality
- PayU payment gateway integration (TEST/LIVE modes)
- Admin dashboard with order and product management
- Multi-currency support (INR/USD)
- Session-based authentication with PostgreSQL storage
- Responsive design for all devices

---

## EC2 Deployment Guide (Ubuntu 22.04/24.04)

### Prerequisites

- Ubuntu EC2 instance (t2.small or larger recommended)
- SSH access to the server
- Domain name (optional, but recommended for HTTPS)

---

### Step 1: Update System & Install Dependencies

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 globally (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx
```

---

### Step 2: Setup PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt, run these commands:
CREATE USER atlantic_user WITH PASSWORD 'your-secure-password';
CREATE DATABASE atlantic_weizard OWNER atlantic_user;
GRANT ALL PRIVILEGES ON DATABASE atlantic_weizard TO atlantic_user;
\q
```

---

### Step 3: Deploy Application

```bash
# Create app directory
sudo mkdir -p /var/www/atlantic-weizard
sudo chown $USER:$USER /var/www/atlantic-weizard
cd /var/www/atlantic-weizard

# Upload your ZIP file and extract
# (Use SCP, SFTP, or your preferred method)
unzip atlantic-weizard.zip -d .

# Install dependencies
npm install
```

---

### Step 4: Configure Environment Variables

```bash
# Copy example and edit
cp .env.example .env
nano .env
```

**Required `.env` configuration:**

```env
# Database (REQUIRED)
DATABASE_URL=postgresql://atlantic_user:your-password@localhost:5432/atlantic_weizard

# Session Secret (REQUIRED) - Generate with: openssl rand -base64 32
SESSION_SECRET=your-generated-secret-here

# PayU Payment Gateway (REQUIRED)
PAYU_MERCHANT_KEY=your-merchant-key
PAYU_MERCHANT_SALT=your-merchant-salt
PAYU_MODE=TEST

# Application (REQUIRED)
BASE_URL=https://your-domain.com
PORT=5000
NODE_ENV=production
```

---

### Step 5: Initialize Database & Seed Admin

```bash
# Push database schema (creates all tables)
npm run db:push

# Create admin user
npm run seed:admin
```

**Default Admin Credentials:**
| Field | Value |
|-------|-------|
| Email | `admin@atlanticweizard.com` |
| Password | `Admin@123` |
| Login URL | `https://your-domain.com/admin` |

**IMPORTANT:** Change this password immediately after first login!

---

### Step 6: Build & Start Application

```bash
# Build for production
npm run build

# Start with PM2
pm2 start dist/index.cjs --name "atlantic-weizard"

# Save PM2 config for auto-restart on reboot
pm2 save
pm2 startup
# Follow the instructions printed by pm2 startup
```

---

### Step 7: Configure Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/atlantic-weizard
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable the site:**

```bash
sudo ln -s /etc/nginx/sites-available/atlantic-weizard /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

---

### Step 8: Setup SSL with Let's Encrypt (Recommended)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
# Follow the prompts, select option to redirect HTTP to HTTPS
```

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/dbname` |
| `SESSION_SECRET` | Yes | Secret for session encryption (32+ chars) | Generate with `openssl rand -base64 32` |
| `PAYU_MERCHANT_KEY` | Yes | PayU merchant key | `cLHbnq` (test) |
| `PAYU_MERCHANT_SALT` | Yes | PayU merchant salt | Your salt from PayU dashboard |
| `PAYU_MODE` | Yes | Payment mode | `TEST` or `LIVE` |
| `BASE_URL` | Yes | Full URL of your site | `https://your-domain.com` |
| `PORT` | No | Server port | `5000` (default) |
| `NODE_ENV` | Yes | Environment mode | `production` |

---

## Accessing the Site

| Page | URL |
|------|-----|
| Store Homepage | `https://your-domain.com/` |
| Admin Login | `https://your-domain.com/admin` |
| Admin Dashboard | `https://your-domain.com/admin/dashboard` |

---

## PM2 Commands Reference

```bash
pm2 list                        # View running processes
pm2 logs atlantic-weizard       # View logs
pm2 logs atlantic-weizard --lines 100  # View last 100 lines
pm2 restart atlantic-weizard    # Restart app
pm2 stop atlantic-weizard       # Stop app
pm2 delete atlantic-weizard     # Remove from PM2
pm2 monit                       # Monitor resources
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection manually
psql -U atlantic_user -d atlantic_weizard -h localhost

# Check if tables exist
psql -U atlantic_user -d atlantic_weizard -c "\dt"
```

### Application Won't Start

```bash
# Check PM2 logs for errors
pm2 logs atlantic-weizard --lines 50

# Verify environment variables are set
cat .env

# Try running directly to see errors
NODE_ENV=production node dist/index.cjs

# Rebuild if needed
npm run build
pm2 restart atlantic-weizard
```

### Nginx Issues

```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Port Already in Use

```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill if needed
sudo kill -9 <PID>
```

### Build Fails

```bash
# Clear node_modules and rebuild
rm -rf node_modules
npm install
npm run build
```

---

## Database Backup & Restore

```bash
# Backup database
pg_dump -U atlantic_user -h localhost atlantic_weizard > backup_$(date +%Y%m%d).sql

# Restore database
psql -U atlantic_user -h localhost atlantic_weizard < backup.sql
```

---

## Updating the Application

```bash
cd /var/www/atlantic-weizard

# Stop current app
pm2 stop atlantic-weizard

# Upload new files (or git pull)
# ...

# Install any new dependencies
npm install

# Run database migrations if schema changed
npm run db:push

# Rebuild
npm run build

# Restart
pm2 restart atlantic-weizard
```

---

## Project Structure

```
atlantic-weizard/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components (shadcn/ui)
│   │   ├── pages/       # Page components
│   │   ├── lib/         # Contexts and utilities
│   │   └── hooks/       # Custom React hooks
│   └── index.html
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── db.ts            # Database connection (pg driver)
│   ├── storage.ts       # Data access layer
│   ├── payu.ts          # PayU payment integration
│   ├── static.ts        # Static file serving
│   └── vite.ts          # Vite dev server (dev only)
├── shared/              # Shared code
│   └── schema.ts        # Drizzle ORM schema
├── script/              # Build scripts
│   ├── build.ts         # Production build
│   └── seed-admin.ts    # Admin user seeder
├── dist/                # Production build output
│   ├── index.cjs        # Server bundle
│   └── public/          # Static assets
├── .env.example         # Environment template
├── package.json         # Dependencies
└── README.md            # This file
```

---

## Development Notes

This project was developed and tested on Replit using:
- Replit's built-in PostgreSQL database (Neon-backed)
- Development mode with Vite hot-reload
- Environment variables configured via Replit Secrets

For local development:
```bash
npm install
npm run dev  # Starts development server on port 5000
```

The codebase uses standard PostgreSQL via the `pg` driver, making it fully compatible with any PostgreSQL installation (EC2, RDS, local, etc.).

---

## Tech Stack

- **Frontend:** React 18, TypeScript, TailwindCSS, shadcn/ui, Vite
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Payments:** PayU payment gateway
- **Process Manager:** PM2 (recommended for production)

---

## Security Checklist for Production

- [ ] Change default admin password
- [ ] Generate strong SESSION_SECRET
- [ ] Enable HTTPS with SSL certificate
- [ ] Set PAYU_MODE=LIVE for real payments
- [ ] Configure firewall (allow only 80, 443, 22)
- [ ] Set up database backups
- [ ] Enable logging and monitoring

---

## License

MIT License
