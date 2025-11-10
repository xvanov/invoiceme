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
# CRITICAL: Set Java version for Nixpacks
# Railway's Nixpacks defaults to Java 17, but we need Java 21
NIXPACKS_JDK_VERSION=21

# Database Connection
# Railway automatically provides these when you add a PostgreSQL service:
# - POSTGRES_HOST
# - POSTGRES_PORT
# - POSTGRES_DATABASE
# - POSTGRES_USER
# - POSTGRES_PASSWORD
# 
# The application-prod.yml will use these automatically - NO ACTION NEEDED!
# Just make sure your PostgreSQL service is connected to your backend service.

# JWT Secret (generate a secure random string, at least 32 characters)
# Run: openssl rand -base64 32
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

**Note:** Railway automatically provides `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DATABASE`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` when you add a PostgreSQL service. The application configuration (`application-prod.yml`) is already set up to use these variables automatically.

**No manual configuration needed!** Just make sure:
1. You've added a PostgreSQL service to your Railway project
2. The PostgreSQL service is connected to your backend service (Railway does this automatically)
3. The variables are available in your backend service (check Variables tab)

If you need to manually override, you can set:
- `DATABASE_URL` (JDBC format: `jdbc:postgresql://host:port/database`)
- `DATABASE_USER` (or it will use `POSTGRES_USER`)
- `DATABASE_PASSWORD` (or it will use `POSTGRES_PASSWORD`)

### 6. Deploy

1. Railway will automatically deploy when you push to your main branch
2. Or click "Deploy" in the Railway dashboard
3. Wait for build to complete (usually 2-5 minutes)

### 7. Get Your Backend URL

1. Go to your service → Settings
2. Generate a domain (or use the default Railway domain)
3. Your API will be available at: `https://your-service.railway.app`

## Troubleshooting

### Build Fails with JAVA_HOME or Java Version Error

**Common Issues:**
1. `JAVA_HOME is not defined correctly` - Maven wrapper can't find Java
2. `release version 21 not supported` - Wrong Java version (MOST COMMON!)

**Solutions:**
1. **CRITICAL: Set `NIXPACKS_JDK_VERSION=21` in Railway environment variables**
   - Railway's Nixpacks defaults to Java 17, even if you specify `jdk21` in `nixpacks.toml`
   - Go to Railway → Your service → Variables → Add: `NIXPACKS_JDK_VERSION=21`
   - This forces Nixpacks to use Java 21
2. **Make sure `nixpacks.toml` is in your repository root** - This ensures Railway uses Java 21
3. **Check `pom.xml` has explicit Maven compiler plugin** - Should specify Java 21
4. **Verify build command** - Should use `mvn` (not `./mvnw`) and skip tests: `mvn clean package -DskipTests`

**If build still fails:**
- Check Railway build logs for the actual error (scroll down in the logs)
- Make sure `NIXPACKS_JDK_VERSION=21` is set in Railway environment variables
- Verify `nixpacks.toml` specifies `jdk21` in `nixPkgs`

### Database Connection Fails

**Check:**
1. PostgreSQL service is running in Railway
2. PostgreSQL service is connected to your backend service
3. Environment variables are available (check Variables tab)

**Common Issue:** Railway provides `POSTGRES_*` variables, but they might not be visible in your backend service.

**Solution:**
1. **Check Variables Tab:**
   - Go to your backend service → Variables
   - Look for `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DATABASE`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
   - If they're missing, make sure PostgreSQL service is connected

2. **Connect PostgreSQL Service:**
   - Go to your PostgreSQL service → Settings
   - Make sure it's in the same project as your backend
   - Railway automatically shares variables between connected services

3. **Manual Override (if needed):**
   If variables aren't available, you can manually set:
   ```
   DATABASE_URL=jdbc:postgresql://${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DATABASE}
   DATABASE_USER=${POSTGRES_USER}
   DATABASE_PASSWORD=${POSTGRES_PASSWORD}
   ```
   Or get the values from PostgreSQL service → Variables and set them directly.

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
| `NIXPACKS_JDK_VERSION` | **Yes** | **CRITICAL: Forces Nixpacks to use Java 21** | `21` |
| `POSTGRES_HOST` | Auto | Railway provides automatically | `containers-us-west-123.railway.app` |
| `POSTGRES_PORT` | Auto | Railway provides automatically | `5432` |
| `POSTGRES_DATABASE` | Auto | Railway provides automatically | `railway` |
| `POSTGRES_USER` | Auto | Railway provides automatically | `postgres` |
| `POSTGRES_PASSWORD` | Auto | Railway provides automatically | `auto-generated` |
| `JWT_SECRET` | Yes | Secret key for JWT (min 32 chars) | `your-256-bit-secret...` |
| `JWT_EXPIRATION` | No | JWT expiration in ms (default: 86400000) | `86400000` |
| `SPRING_PROFILES_ACTIVE` | No | Spring profile (default: prod) | `prod` |
| `PORT` | Auto | Railway sets this automatically | `8080` |

**Note:** 
- **`NIXPACKS_JDK_VERSION=21` is REQUIRED** - Railway's Nixpacks defaults to Java 17, so you must set this to use Java 21
- `POSTGRES_*` variables are automatically provided by Railway when you add a PostgreSQL service. You don't need to set them manually - just make sure the PostgreSQL service is connected to your backend service.

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

