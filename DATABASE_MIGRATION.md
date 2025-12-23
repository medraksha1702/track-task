# Database Migration Guide

## Overview

This guide explains how to create database tables (migrate) for your biomedical service backend.

## Methods to Create Tables

### Method 1: Run Migration Script (Recommended)

#### Local Development:
```bash
cd backend
npm run db:migrate
```

#### On Render (Production):
1. Go to Render Dashboard → Your Backend Service
2. Click **"Shell"** tab
3. Run:
   ```bash
   npm run db:migrate
   ```

### Method 2: Auto-Sync on Server Start

Set environment variable in Render:
- **Key**: `AUTO_SYNC_DB`
- **Value**: `true`

Then restart your service. The server will automatically sync tables on startup.

**⚠️ Note**: Only use this for initial setup. Disable after tables are created.

### Method 3: Use Seed Script (Creates Tables + Sample Data)

The seed script also creates tables:

```bash
npm run db:seed
```

This will:
1. Create all tables
2. Create admin user
3. Add sample data (customers, machines, services, invoices)

## Step-by-Step: Render Deployment

### Step 1: Deploy Backend
Make sure your backend is deployed on Render.

### Step 2: Run Migration

**Option A: Using Render Shell (Recommended)**
1. Go to Render Dashboard
2. Select your backend service
3. Click **"Shell"** tab
4. Run:
   ```bash
   npm run db:migrate
   ```

**Option B: Using Environment Variable**
1. Go to Render Dashboard → Your Service → **Environment**
2. Add variable:
   - Key: `AUTO_SYNC_DB`
   - Value: `true`
3. **Save Changes** (this will trigger a redeploy)
4. Wait for deployment to complete
5. Check logs - you should see: `✅ Database models synchronized.`
6. **Remove** `AUTO_SYNC_DB` variable after first sync (optional, but recommended)

### Step 3: Verify Tables Created

Check Render logs for:
```
✅ Database connection established
✅ Database tables synchronized successfully
```

Or test the API:
```bash
curl https://your-backend-url.onrender.com/health/db
```

Should return: `{"status":"ok","message":"Database connection successful"}`

### Step 4: Seed Database (Optional)

To add sample data:
1. Go to Render Shell
2. Run:
   ```bash
   npm run db:seed
   ```

This creates:
- Admin user: `admin@biomedical.com` / `admin123`
- Sample customers, machines, services, invoices

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run db:create` | Creates the PostgreSQL database (if it doesn't exist) |
| `npm run db:migrate` | Creates/updates all database tables |
| `npm run db:seed` | Creates tables + adds sample data |
| `npm run db:sync` | Alternative sync command |

## Tables Created

After migration, these tables will be created:

1. **users** - Admin users
2. **customers** - Customer information
3. **machines** - Machine inventory
4. **services** - Service records
5. **invoices** - Invoice records
6. **invoice_items** - Invoice line items

## Troubleshooting

### Error: "relation does not exist"
- Tables haven't been created yet
- Run `npm run db:migrate`

### Error: "database does not exist"
- Database needs to be created first
- Run `npm run db:create` (local) or create via Render PostgreSQL dashboard

### Error: "permission denied"
- Check database credentials in `DATABASE_URL`
- Verify user has CREATE TABLE permissions

### Tables not syncing in production
- Check `NODE_ENV` is set to `production`
- Use `AUTO_SYNC_DB=true` or run migration manually via Shell

## Production Best Practices

1. **Run migrations manually** (not auto-sync) for better control
2. **Backup database** before running migrations
3. **Test migrations** in staging environment first
4. **Use migrations** instead of `sync({ alter: true })` for production changes

## Quick Reference

### Local Development
```bash
# Create database
npm run db:create

# Create tables
npm run db:migrate

# Create tables + sample data
npm run db:seed
```

### Render Production
```bash
# Via Shell:
npm run db:migrate

# Or set AUTO_SYNC_DB=true in environment variables
```

## Need Help?

- Check Render logs for error messages
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL service is running
- Check database user permissions

