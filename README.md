# Ecommerce CMS

A full-featured ecommerce platform built with Next.js 16, MySQL, and Prisma. Includes a storefront, admin dashboard, affiliate system, and blog — all managed from a single codebase.

## Features

- **Storefront** — Product catalog, category browsing, search, cart, checkout, wishlists, reviews
- **Admin Dashboard** — Products, orders, customers, coupons, pages, blog, media, messages, settings
- **Affiliate System** — Referral tracking, commission management, affiliate dashboard with QR codes
- **Blog** — Rich text editor (Tiptap), categories, tags, multiple layout styles
- **Theme Engine** — Customizable colors, fonts, header layouts, card styles, and page layouts via admin settings
- **Email Notifications** — Order confirmations, shipping updates, password resets, admin alerts
- **Authentication** — Email/password, magic link, password reset, role-based access (Customer, Affiliate, Admin, Super Admin)
- **SEO** — Dynamic sitemap, robots.txt, meta titles/descriptions per page

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | MySQL 8.0+ |
| ORM | Prisma 6 |
| Auth | Auth.js v5 (next-auth beta) |
| Styling | Tailwind CSS v4 |
| Email | Nodemailer (SMTP), Resend, or SendGrid |
| Validation | Zod v4 |
| Editor | Tiptap (rich text) |

## Server Requirements

### Minimum

- **Node.js** 18.17+ (22.x recommended)
- **MySQL** 8.0+ (or MariaDB 10.5+)
- **RAM** 1 GB
- **Disk** 1 GB (plus storage for uploaded media)

### Recommended (Production)

- **Node.js** 22.x LTS
- **MySQL** 8.0+ with at least 512 MB buffer pool
- **RAM** 2 GB+
- **Disk** 10 GB+ SSD
- **Reverse proxy** Nginx or Caddy (for SSL termination)
- **Process manager** PM2 or systemd

### Hosting Options

Works on any platform that supports Node.js:

- **VPS** — DigitalOcean, Linode, Hetzner, AWS EC2
- **PaaS** — Vercel, Railway, Render
- **Self-hosted** — Any Linux server with Node.js and MySQL

---

## Quick Start (Development)

### 1. Clone and install

```bash
git clone <your-repo-url> my-store
cd my-store
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` is required due to next-auth beta peer dependency conflicts.

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database (required)
DATABASE_URL="mysql://user:password@localhost:3306/my_store"

# Auth (required)
AUTH_SECRET="generate-with-openssl-rand-base64-33"
AUTH_URL="http://localhost:3000"

# Email - SMTP (required for email features)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_FROM="noreply@yourstore.com"

# App URL (required for sitemap, password reset links, affiliate links)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 33
```

### 3. Set up the database

```bash
# Push schema to database
npm run db:push

# Seed with sample data (admin user, products, categories)
npm run db:seed
```

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@store.com | admin123 |
| Customer | jane@example.com | password123 |
| Affiliate | alex@affiliate.com | password123 |

> **Important:** Change the admin password immediately after first login.

---

## Production Deployment

### Option A: VPS / Self-Hosted

#### 1. Provision server

Install Node.js 22.x and MySQL 8.0:

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs mysql-server nginx
```

#### 2. Create database

```bash
sudo mysql -u root
```

```sql
CREATE DATABASE my_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'storeuser'@'localhost' IDENTIFIED BY 'strong-password-here';
GRANT ALL PRIVILEGES ON my_store.* TO 'storeuser'@'localhost';
FLUSH PRIVILEGES;
```

#### 3. Deploy application

```bash
# Clone repo
git clone <your-repo-url> /var/www/my-store
cd /var/www/my-store

# Install dependencies
npm install --legacy-peer-deps

# Configure environment
cp .env.example .env
nano .env  # Fill in production values
```

Set these in `.env`:

```env
DATABASE_URL="mysql://storeuser:strong-password-here@localhost:3306/my_store"
AUTH_SECRET="your-generated-secret"
AUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"
```

#### 4. Build and initialize

```bash
# Push schema
npm run db:push

# Seed initial data (first time only)
npm run db:seed

# Build for production
npm run build
```

#### 5. Run with PM2

```bash
# Install PM2
sudo npm install -g pm2

# Start the app
pm2 start npm --name "my-store" -- start

# Auto-start on reboot
pm2 startup
pm2 save
```

#### 6. Configure Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
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

```bash
sudo ln -s /etc/nginx/sites-available/my-store /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 7. SSL with Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

After SSL is configured, update `.env`:

```env
AUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

Rebuild and restart:

```bash
npm run build
pm2 restart my-store
```

### Option B: Vercel

#### 1. Push to GitHub

```bash
git remote add origin https://github.com/you/my-store.git
git push -u origin main
```

#### 2. Import in Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import your repository
2. Add environment variables (same as `.env`, but use your production MySQL URL)
3. Set the build command to: `prisma generate && next build`
4. Deploy

#### 3. Database

Vercel doesn't provide MySQL. Use a managed MySQL provider:

- [PlanetScale](https://planetscale.com) (MySQL-compatible)
- [Aiven](https://aiven.io)
- [AWS RDS](https://aws.amazon.com/rds/mysql/)
- [DigitalOcean Managed Databases](https://www.digitalocean.com/products/managed-databases-mysql)

Set `DATABASE_URL` in Vercel environment variables to your remote database connection string.

> **Note:** If using PlanetScale, add `?sslaccept=strict` to your `DATABASE_URL` and set `relationMode = "prisma"` in your Prisma schema.

### Option C: Railway / Render

Both platforms support Node.js apps with MySQL:

1. Connect your GitHub repo
2. Add a MySQL database service
3. Set environment variables
4. Deploy — the platform handles builds and process management

---

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server (port 3000) |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:migrate` | Create and run migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:reset` | Reset database (deletes all data) |
| `npm run db:fresh` | Reset + re-seed database |
| `npm run db:studio` | Open Prisma Studio (database GUI) |

---

## Project Structure

```
src/
  actions/          # Server actions (auth, cart, orders, products, etc.)
  app/
    (admin)/        # Admin dashboard routes (/admin/*)
    (affiliate)/    # Affiliate dashboard routes (/affiliate/*)
    (auth)/         # Auth routes (/login, /register, /forgot-password, /reset-password)
    (storefront)/   # Public storefront routes (/, /products, /blog, /contact, etc.)
    api/            # API routes (auth, upload, affiliate tracking)
  components/
    admin/          # Admin-specific components
    storefront/     # Storefront components (header, footer, product cards, etc.)
    ui/             # Reusable UI primitives (button, input, card, etc.)
  lib/
    email/          # Email sending, templates, notification wrappers
    payments/       # Payment provider abstraction
    prisma.ts       # Prisma client singleton
    settings.ts     # Settings helpers
    utils.ts        # Utility functions
  auth.ts           # Auth.js configuration
  auth.config.ts    # Auth callbacks and route protection

prisma/
  schema.prisma     # Database schema
  seed.ts           # Database seeder
  reset.ts          # Database reset script
```

---

## Email Configuration

The platform supports three email providers. Configure one in `.env`:

### SMTP (default)

```env
EMAIL_PROVIDER="smtp"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="you@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourstore.com"
```

### Resend

```env
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_xxxxxxxxxxxxx"
EMAIL_FROM="noreply@yourstore.com"
```

### SendGrid

```env
EMAIL_PROVIDER="sendgrid"
SENDGRID_API_KEY="SG.xxxxxxxxxxxxx"
EMAIL_FROM="noreply@yourstore.com"
```

---

## Admin Settings

After deployment, log in at `/admin` to configure:

- **General** — Store name, description, admin notification email
- **Payment** — Venmo, Cash App, Bitcoin addresses
- **Shipping** — Flat rate, weight-based rates, free shipping threshold
- **Email** — Provider selection, notification preferences
- **Theme** — Colors, fonts, header layout, product card styles, blog layout, contact page layout
- **Menus** — Header and footer navigation

---

## Updating

To update a running deployment:

```bash
cd /var/www/my-store
git pull origin main
npm install --legacy-peer-deps
npm run db:push        # Apply any schema changes
npm run build
pm2 restart my-store
```

---

## Troubleshooting

### `ECONNREFUSED` on database connection
Verify MySQL is running and the `DATABASE_URL` credentials are correct:
```bash
sudo systemctl status mysql
mysql -u storeuser -p my_store
```

### `--legacy-peer-deps` error
Always use `npm install --legacy-peer-deps` — the next-auth beta has peer dependency conflicts with React 19.

### Images not loading
If using external image hosts, add their domains to `next.config.ts` under `images.remotePatterns`. Uploaded images are stored in `public/uploads/`.

### Email not sending
Check the admin settings for the notification email address. Verify your SMTP credentials. Check server logs for `[email]` messages.

### Port 3000 already in use
```bash
PORT=3001 npm start
# or with PM2:
pm2 start npm --name "my-store" -- start -- -p 3001
```
