# Quick Start: Deploy InvoiceMe to Railway + Vercel

This is a quick reference guide for deploying InvoiceMe. For detailed instructions, see:
- `RAILWAY_DEPLOYMENT.md` - Backend deployment
- `VERCEL_DEPLOYMENT.md` - Frontend deployment

## 🚀 Quick Deployment Steps

### Backend (Railway)

1. **Create Railway Project:**
   - Go to https://railway.app
   - New Project → Deploy from GitHub
   - Select your repository

2. **Add PostgreSQL:**
   - Railway → + New → Database → PostgreSQL

3. **Configure Environment Variables:**
   ```
   DATABASE_URL=jdbc:postgresql://[host]:[port]/[database]
   DATABASE_USER=[username]
   DATABASE_PASSWORD=[password]
   JWT_SECRET=[generate with: openssl rand -base64 32]
   JWT_EXPIRATION=86400000
   SPRING_PROFILES_ACTIVE=prod
   ```

4. **Get Backend URL:**
   - Railway → Your service → Settings → Generate Domain
   - Copy URL (e.g., `https://your-backend.railway.app`)

### Frontend (Vercel)

1. **Deploy to Vercel:**
   - Go to https://vercel.com
   - Add New Project → Import GitHub repo
   - Deploy (auto-detects Next.js)

2. **Set Environment Variable:**
   - Vercel → Your project → Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-backend.railway.app`
   - Select: Production, Preview, Development
   - Save

3. **Redeploy:**
   - Vercel → Deployments → Redeploy

## ✅ Verify Connection

1. **Test Backend:**
   ```bash
   curl https://your-backend.railway.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "password123"}'
   ```

2. **Test Frontend:**
   - Open your Vercel URL
   - Try to register/login
   - Check browser DevTools → Network tab
   - Verify requests go to Railway backend

## 🔧 Common Issues

### Backend Build Fails (JAVA_HOME error)
- ✅ Fixed: `nixpacks.toml` is configured
- Railway uses Maven directly (not wrapper)

### Database Connection Fails
- Convert Railway's `postgresql://` URL to JDBC format: `jdbc:postgresql://`
- Set `DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASSWORD` separately

### Frontend Can't Connect to Backend
- Check `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Verify Railway backend is accessible
- Check CORS (already configured to allow all origins)

## 📝 Environment Variables Summary

### Railway (Backend)
| Variable | Value | Example |
|----------|-------|---------|
| `DATABASE_URL` | JDBC format | `jdbc:postgresql://host:5432/db` |
| `DATABASE_USER` | DB username | `postgres` |
| `DATABASE_PASSWORD` | DB password | `your-password` |
| `JWT_SECRET` | 32+ char secret | `openssl rand -base64 32` |
| `JWT_EXPIRATION` | Milliseconds | `86400000` |
| `SPRING_PROFILES_ACTIVE` | Profile name | `prod` |

### Vercel (Frontend)
| Variable | Value | Example |
|----------|-------|---------|
| `NEXT_PUBLIC_API_URL` | Railway backend URL | `https://your-backend.railway.app` |

## 🎯 That's It!

Your app should now be live:
- **Frontend:** `https://your-project.vercel.app`
- **Backend:** `https://your-backend.railway.app`

Both auto-deploy on git push! 🎉

