# Railway Deployment Guide

This guide explains how to deploy InvoiceMe backend to Railway.

## Prerequisites

1. Railway account (sign up at https://railway.app)
2. GitHub repository with your code
3. Railway CLI (optional, for local testing)

## Step-by-Step Deployment

### 1. Create New Project on Railway

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### 2. Configure Build Settings

Railway will auto-detect Java/Maven. The configuration files (`nixpacks.toml` and `railway.json`) are already set up.

**Build Command:** `mvn clean package -DskipTests`
**Start Command:** `java -Dserver.port=$PORT -Dspring.profiles.active=prod $JAVA_OPTS -jar target/invoiceme-1.0.0.jar`

### 3. Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically create a PostgreSQL database

### 4. Configure Environment Variables

Go to your service → Variables tab and add:

**Required Variables:**

```bash
# Database Connection
# Option 1: Use Railway's PostgreSQL service variables (recommended)
# Railway provides these automatically when you add a PostgreSQL service
DATABASE_URL=${{Postgres.DATABASE_URL}}
DATABASE_USER=${{Postgres.DATABASE_USER}}
DATABASE_PASSWORD=${{Postgres.DATABASE_PASSWORD}}

# Option 2: If Railway provides DATABASE_URL in PostgreSQL URI format,
# you need to convert it to JDBC format:
# From: postgresql://user:pass@host:port/db
# To: jdbc:postgresql://host:port/db
# Then set:
# DATABASE_URL=jdbc:postgresql://host:port/db
# DATABASE_USER=user
# DATABASE_PASSWORD=pass

# JWT Secret (generate a secure random string, at least 32 characters)
JWT_SECRET=your-256-bit-secret-key-for-jwt-token-generation-must-be-at-least-256-bits

# JWT Expiration (optional, defaults to 86400000 = 24 hours)
JWT_EXPIRATION=86400000

# Spring Profile (optional, defaults to prod)
SPRING_PROFILES_ACTIVE=prod
```

**To generate a secure JWT secret:**

```bash
# On macOS/Linux
openssl rand -base64 32

# Or use an online generator
# https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
```

**Note:** Railway automatically provides `DATABASE_URL`, `DATABASE_USER`, and `DATABASE_PASSWORD` when you add a PostgreSQL service. However, Railway's `DATABASE_URL` is in PostgreSQL URI format (`postgresql://user:pass@host:port/db`), while Spring Boot needs JDBC format (`jdbc:postgresql://host:port/db`).

**Quick Fix:** In Railway, when you reference the PostgreSQL service variables, you can manually set `DATABASE_URL` to the JDBC format:

1. Go to your PostgreSQL service → Variables
2. Copy the connection details (host, port, database name)
3. In your backend service → Variables, set:
   ```
   DATABASE_URL=jdbc:postgresql://[host]:[port]/[database]
   DATABASE_USER=${{Postgres.DATABASE_USER}}
   DATABASE_PASSWORD=${{Postgres.DATABASE_PASSWORD}}
   ```

Or use Railway's connection string parser (see troubleshooting section below).

### 6. Deploy

1. Railway will automatically deploy when you push to your main branch
2. Or click "Deploy" in the Railway dashboard
3. Wait for build to complete (usually 2-5 minutes)

### 7. Get Your Backend URL

1. Go to your service → Settings
2. Generate a domain (or use the default Railway domain)
3. Your API will be available at: `https://your-service.railway.app`

## Troubleshooting

### Build Fails with JAVA_HOME Error

If you see `JAVA_HOME is not defined correctly`, the `nixpacks.toml` file should fix this by using Maven directly instead of the wrapper.

**Solution:** Make sure `nixpacks.toml` is in your repository root.

### Database Connection Fails

**Check:**
1. PostgreSQL service is running in Railway
2. Environment variables are set correctly
3. Database URL format is correct (JDBC format, not PostgreSQL URI format)

**Common Issue:** Railway provides `DATABASE_URL` in format `postgresql://user:pass@host:port/db`, but Spring Boot needs `jdbc:postgresql://host:port/db`.

**Solution:** Convert the URL format:
1. Get the connection string from Railway PostgreSQL service
2. Extract components:
   - Format: `postgresql://user:password@host:port/database`
   - Example: `postgresql://postgres:abc123@containers-us-west-123.railway.app:5432/railway`
3. Convert to JDBC format:
   - `jdbc:postgresql://host:port/database`
   - Example: `jdbc:postgresql://containers-us-west-123.railway.app:5432/railway`
4. Set in Railway variables:
   - `DATABASE_URL=jdbc:postgresql://containers-us-west-123.railway.app:5432/railway`
   - `DATABASE_USER=postgres`
   - `DATABASE_PASSWORD=abc123`

**Test connection:**
```bash
# From Railway CLI
railway connect postgres

# Or check logs
railway logs
```

### Port Issues

Railway automatically sets the `$PORT` environment variable. Make sure your `application-prod.yml` uses:
```yaml
server:
  port: ${PORT:8080}
```

### JWT Secret Too Short

JWT secret must be at least 256 bits (32 characters). Generate a new one:
```bash
openssl rand -base64 32
```

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL JDBC URL | `jdbc:postgresql://host:5432/dbname` |
| `DATABASE_USER` | Yes | Database username | `postgres` |
| `DATABASE_PASSWORD` | Yes | Database password | `your-password` |
| `JWT_SECRET` | Yes | Secret key for JWT (min 32 chars) | `your-256-bit-secret...` |
| `JWT_EXPIRATION` | No | JWT expiration in ms (default: 86400000) | `86400000` |
| `SPRING_PROFILES_ACTIVE` | No | Spring profile (default: prod) | `prod` |
| `PORT` | Auto | Railway sets this automatically | `8080` |

## Next Steps

After backend is deployed:

1. **Deploy Frontend to Vercel:**
   - See `VERCEL_DEPLOYMENT.md` (to be created)
   - Update frontend API URL to point to your Railway backend

2. **Test the API:**
   ```bash
   # Register a user
   curl -X POST https://your-service.railway.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "password123"}'
   
   # Login
   curl -X POST https://your-service.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "password123"}'
   ```

3. **Monitor Logs:**
   - Go to Railway dashboard → Your service → Logs
   - Watch for errors or warnings

## Cost Estimate

- **Railway Free Tier:** $5 credit/month
- **PostgreSQL:** Included in free tier (limited usage)
- **Estimated Cost:** Free for small projects, ~$5-20/month for moderate usage

