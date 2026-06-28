# RX Ecommerce - Deployment Guide

This guide will help you deploy the RX Ecommerce application to production.

## Prerequisites

- Node.js (v18 or higher)
- MySQL database
- PM2 (for process management)
- Domain name (optional)
- SSL certificate (recommended for production)

## Architecture

The application consists of three parts:
1. **Backend API** (Node.js/Express) - Port 5000
2. **Customer Frontend** (Nuxt 3) - Port 3000
3. **Admin Panel** (React/Vite) - Port 5173

## Environment Configuration

### Backend (Server)

Copy `.env.example` to `.env` in the `server/` directory:

```bash
cd server
cp .env.example .env
```

Update the following variables for production:

```env
PORT=5000

DB_HOST=your_production_db_host
DB_PORT=3306
DB_NAME=rx_ecommerce
DB_USER=your_db_user
DB_PASSWORD=your_secure_password

JWT_SECRET=your_very_secure_jwt_secret_change_this
JWT_EXPIRES_IN=7d

NODE_ENV=production
```

### Customer Frontend

Copy `.env.example` to `.env` in the `customer/` directory:

```bash
cd customer
cp .env.example .env
```

Update the API base URL for production:

```env
NUXT_PUBLIC_API_BASE=https://your-domain.com/api
```

## Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE rx_ecommerce;
```

2. Import the database schema:
```bash
mysql -u your_user -p rx_ecommerce < database/schema.sql
```

3. Run any migrations if available.

## Building for Production

### Backend

The backend runs directly with Node.js. No build step required.

```bash
cd server
npm install --production
```

### Customer Frontend

Build the Nuxt application:

```bash
cd customer
npm install
npm run build
```

The built files will be in the `.output/` directory.

### Admin Panel

Build the React application:

```bash
cd admin
npm install
npm run build
```

The built files will be in the `dist/` directory.

## Deployment Options

### Option 1: VPS/Dedicated Server

#### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

#### 2. Setup Application

Clone your repository and setup the application:

```bash
# Clone repository
git clone your-repo-url
cd RX-ecommerce

# Install dependencies
cd server && npm install --production
cd ../customer && npm install && npm run build
cd ../admin && npm install && npm run build
```

#### 3. Configure PM2

Create an ecosystem file:

```javascript
module.exports = {
  apps: [
    {
      name: 'rx-ecommerce-api',
      script: './server/server.js',
      cwd: '/path/to/RX-ecommerce',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'rx-ecommerce-customer',
      script: './node_modules/.bin/nuxt',
      args: 'start',
      cwd: '/path/to/RX-ecommerce/customer',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
}
```

Start the applications:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 4. Configure Nginx

Create a configuration file for your domain:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.key;

    # Customer Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection '_upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static Files (Product Images)
    location /uploads {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Admin Panel (Optional - separate subdomain recommended)
    location /admin {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/rx-ecommerce /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Option 2: Docker Deployment

Create a `Dockerfile` for each service:

#### Backend Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

#### Customer Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```

#### Docker Compose

```yaml
version: '3.8'
services:
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: rx_ecommerce
    volumes:
      - db_data:/var/lib/mysql
    ports:
      - "3306:3306"

  api:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - DB_HOST=db
      - NODE_ENV=production
    depends_on:
      - db

  customer:
    build: ./customer
    ports:
      - "3000:3000"
    environment:
      - NUXT_PUBLIC_API_BASE=http://localhost:5000/api
    depends_on:
      - api

volumes:
  db_data:
```

Run with:

```bash
docker-compose up -d
```

### Option 3: Cloud Platforms

#### Vercel (Frontend Only)

1. Connect your GitHub repository to Vercel
2. Set root directory to `customer`
3. Add environment variable: `NUXT_PUBLIC_API_BASE=your-api-url`
4. Deploy

#### Render/Railway

Both platforms support full-stack deployment with databases.

## Post-Deployment Checklist

- [ ] Database is accessible from the server
- [ ] Environment variables are correctly set
- [ ] SSL certificate is installed and valid
- [ ] API is responding correctly
- [ ] Frontend can communicate with the API
- [ ] Image uploads are working
- [ ] Email notifications (if configured) are working
- [ ] Payment gateway (if configured) is working
- [ ] Backup strategy is in place
- [ ] Monitoring is set up

## Monitoring and Maintenance

### Logs

View PM2 logs:
```bash
pm2 logs rx-ecommerce-api
pm2 logs rx-ecommerce-customer
```

### Restart Services

```bash
pm2 restart rx-ecommerce-api
pm2 restart rx-ecommerce-customer
```

### Database Backups

Set up automated backups:

```bash
# Daily backup
0 2 * * * mysqldump -u user -p password rx_ecommerce > /backups/rx_ecommerce_$(date +\%Y\%m\%d).sql
```

## Security Recommendations

1. **Change all default passwords and secrets**
2. **Use strong JWT secrets** (at least 32 characters)
3. **Enable HTTPS only** in production
4. **Set up firewall rules** (only allow necessary ports)
5. **Keep dependencies updated**
6. **Regular security audits**
7. **Rate limiting is already configured** (200 requests per 15 minutes)
8. **CORS is configured** - adjust for your domain

## Performance Optimization

The application includes several optimizations:
- Image lazy loading
- Skeleton loading states
- CSS animations
- Responsive design
- API response caching (304 Not Modified)

For additional performance:
- Use a CDN for static assets
- Enable gzip compression on Nginx
- Use Redis for session storage
- Implement database query caching

## Troubleshooting

### API returns 500 errors
- Check database connection
- Verify environment variables
- Check PM2 logs

### Images not loading
- Verify upload directory permissions
- Check Nginx configuration for `/uploads`
- Ensure image paths in database are correct

### Frontend can't connect to API
- Verify `NUXT_PUBLIC_API_BASE` is correct
- Check CORS settings
- Ensure API is running

## Support

For issues or questions, refer to the main README.md or open an issue in the repository.
