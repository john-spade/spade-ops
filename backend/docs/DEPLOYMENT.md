# Deployment Guide for callie.js

This guide covers deploying callie.js applications to various hosting providers.

## Table of Contents

- [General Requirements](#general-requirements)
- [Hostinger](#hostinger)
- [GoDaddy](#godaddy)
- [cPanel Shared Hosting](#cpanel-shared-hosting)
- [VPS / DigitalOcean / Linode](#vps)
- [PM2 Process Manager](#pm2-process-manager)
- [Nginx Configuration](#nginx-configuration)
- [SSL/HTTPS Setup](#ssl-setup)
- [Troubleshooting](#troubleshooting)

---

## General Requirements

Before deploying, ensure your hosting provider supports:

- **Node.js 18+** (LTS recommended)
- **MySQL 5.7+** or **MariaDB 10.3+**
- **SSH access** (recommended but not required)

## Pre-Deployment Checklist

1. ✅ Set `NODE_ENV=production` in `.env`
2. ✅ Generate a strong `JWT_SECRET`
3. ✅ Configure production database credentials
4. ✅ Set `CORS_ORIGIN` to your frontend domain
5. ✅ Run `npm install --production`

---

## Hostinger

### Node.js Hosting

1. **Login to hPanel** and go to **Websites** → **Advanced** → **Node.js**

2. **Create Node.js Application**
   - Node.js version: 18.x or 20.x
   - Application root: `/public_html/api` (or your folder)
   - Application startup file: `index.js`
   - Application mode: Production

3. **Upload Files**
   - Use File Manager or FTP
   - Upload all files EXCEPT `node_modules`
   - Create `.env` with production settings

4. **Install Dependencies**
   - Click "Run NPM Install" in hPanel
   - Or use SSH: `cd ~/public_html/api && npm install --production`

5. **Start Application**
   - Click "Restart" in the Node.js section

### Database Setup

1. Go to **Databases** → **MySQL Databases**
2. Create a new database
3. Note the connection details for your `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=u123456789_mydb
DB_PASSWORD=your_password
DB_NAME=u123456789_mydb
```

4. Import your schema:
   - Go to phpMyAdmin
   - Select your database
   - Import `database/schema.sql`

---

## GoDaddy

### cPanel Node.js Setup

1. **Access cPanel** from your hosting dashboard

2. **Setup Node.js App**
   - Find "Setup Node.js App" in Software section
   - Click "Create Application"
   - Node.js version: 18.x
   - Application mode: Production
   - Application root: your project folder
   - Application URL: your domain/subdomain
   - Startup file: index.js

3. **Upload Files**
   - Use File Manager or FTP
   - Upload to the application root

4. **Configure Environment**
   - Create `.env` in the application root
   - Or set environment variables in cPanel

5. **Install & Start**
   ```bash
   source /home/username/nodevenv/myapp/18/bin/activate
   cd ~/myapp
   npm install --production
   ```
   
6. **Restart** the application from cPanel

---

## cPanel Shared Hosting

Most cPanel hosts with Node.js support follow a similar pattern:

### Step 1: Create Node.js Application

```
Software → Setup Node.js App → Create Application
```

Settings:
- Node version: 18.x or higher
- Mode: Production
- Application root: `public_html/api` or subdomain folder
- URL: Your domain
- Startup file: `index.js`

### Step 2: Upload Files

Via File Manager:
1. Navigate to application root
2. Upload all project files (ZIP and extract if needed)
3. Delete `node_modules` if uploaded

### Step 3: Configure Environment

Create `.env` file:

```env
NODE_ENV=production
PORT=3000

DB_HOST=localhost
DB_USER=cpaneluser_dbuser
DB_PASSWORD=secure_password
DB_NAME=cpaneluser_dbname

JWT_SECRET=generate-a-long-random-string-here
CORS_ORIGIN=https://yoursite.com
```

### Step 4: Install Dependencies

Option A - Via cPanel:
- Click "Run NPM Install" button

Option B - Via SSH:
```bash
source /home/user/nodevenv/appname/18/bin/activate
cd ~/public_html/api
npm install --production
```

### Step 5: Start Application

- Click "Restart" in Node.js section
- Application will run on the specified port

### Accessing Your API

Your API will be available at:
- `https://yourdomain.com` (if root)
- `https://yourdomain.com/api` (if subfolder)
- `https://api.yourdomain.com` (if subdomain)

---

## VPS (DigitalOcean, Linode, AWS EC2)

### Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Install PM2
npm install -g pm2
```

### Deploy Application

```bash
# Clone or upload your application
cd /var/www
git clone your-repo my-api
cd my-api

# Install dependencies
npm install --production

# Create .env
nano .env

# Start with PM2
pm2 start index.js --name my-api
pm2 save
pm2 startup
```

### Configure MySQL

```bash
# Login to MySQL
sudo mysql

# Create database and user
CREATE DATABASE myapp;
CREATE USER 'myapp'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON myapp.* TO 'myapp'@'localhost';
FLUSH PRIVILEGES;

# Import schema
mysql -u myapp -p myapp < database/schema.sql
```

---

## PM2 Process Manager

PM2 keeps your Node.js app running and restarts it if it crashes.

### Basic Commands

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start index.js --name my-api

# Other useful commands
pm2 status          # View running processes
pm2 logs my-api     # View logs
pm2 restart my-api  # Restart app
pm2 stop my-api     # Stop app
pm2 delete my-api   # Remove from PM2

# Enable startup on boot
pm2 startup
pm2 save
```

### PM2 Ecosystem File

Create `ecosystem.config.cjs`:

```javascript
module.exports = {
  apps: [{
    name: 'my-api',
    script: 'index.js',
    instances: 'max',      // Use all CPU cores
    exec_mode: 'cluster',  // Cluster mode
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

Start with: `pm2 start ecosystem.config.cjs --env production`

---

## Nginx Configuration

### Basic Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://localhost:3000;
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

### With Load Balancing (Multiple Instances)

```nginx
upstream callie_api {
    least_conn;
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://callie_api;
        # ... same proxy headers as above
    }
}
```

---

## SSL Setup

### Using Certbot (Free SSL)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.example.com

# Auto-renewal (usually automatic)
sudo certbot renew --dry-run
```

### Force HTTPS in Nginx

```nginx
server {
    listen 80;
    server_name api.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        # ... proxy headers
    }
}
```

---

## Troubleshooting

### Application Won't Start

1. **Check logs**:
   ```bash
   pm2 logs my-api
   # or
   cat ~/.pm2/logs/my-api-error.log
   ```

2. **Verify Node version**:
   ```bash
   node --version  # Should be 18+
   ```

3. **Check .env file**:
   - Ensure all required variables are set
   - No trailing spaces
   - Correct database credentials

### Database Connection Issues

1. **Test MySQL connection**:
   ```bash
   mysql -u your_user -p your_database
   ```

2. **Check MySQL is running**:
   ```bash
   sudo systemctl status mysql
   ```

3. **Verify credentials in .env**

### Port Already in Use

```bash
# Find what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 pm2 start index.js
```

### Permission Issues

```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/my-api

# Fix permissions
chmod -R 755 /var/www/my-api
```

### Memory Issues on Shared Hosting

1. Reduce connection pool size in `.env`:
   ```env
   DB_POOL_SIZE=3
   ```

2. Limit max old space in Node:
   ```bash
   node --max-old-space-size=256 index.js
   ```

---

## Health Monitoring

### Built-in Health Check

Your callie.js app includes a `/health` endpoint. Use it for monitoring:

```bash
curl https://api.example.com/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected"
  }
}
```

### External Monitoring

Use services like:
- UptimeRobot (free)
- Pingdom
- StatusCake

Set them to check `/health` every 1-5 minutes.

---

## Security Recommendations

1. **Never commit `.env`** - Use `.env.example` as template
2. **Use strong JWT secret** - 256+ bit random string
3. **Restrict database access** - Only localhost if possible
4. **Enable firewall** - Only open ports 80, 443, 22
5. **Keep dependencies updated** - `npm audit fix`
6. **Use HTTPS everywhere** - Free with Let's Encrypt

---

For more help, open an issue on GitHub or check the documentation.
