# Vercel Deployment Guide

This guide explains how to deploy InvoiceMe frontend to Vercel and connect it to your Railway backend.

## Prerequisites

1. Vercel account (sign up at https://vercel.com - free tier available)
2. GitHub repository with your code
3. Railway backend deployed and running (see `RAILWAY_DEPLOYMENT.md`)

## Step-by-Step Deployment

### 1. Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 2. Configure Build Settings

Vercel auto-detects Next.js, so no special build settings needed.

**Build Command:** `npm run build` (auto-detected)
**Output Directory:** `.next` (auto-detected)
**Install Command:** `npm install` (auto-detected)

### 3. Configure Environment Variables

Go to your project → Settings → Environment Variables and add:

**Required Variable:**

```bash
# Backend API URL (your Railway backend URL)
NEXT_PUBLIC_API_URL=https://your-backend-service.railway.app
```

**Important Notes:**
- Replace `your-backend-service.railway.app` with your actual Railway backend URL
- The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser
- Get your Railway backend URL from Railway dashboard → Your service → Settings → Generate Domain

### 4. Deploy

1. Click "Deploy"
2. Vercel will automatically:
   - Install dependencies
   - Build the Next.js app
   - Deploy to production
3. Wait for deployment to complete (usually 1-2 minutes)

### 5. Get Your Frontend URL

After deployment, Vercel provides:
- **Production URL:** `https://your-project.vercel.app`
- **Preview URLs:** For each branch/PR

## How It Works

### Development (Local)

When running locally:
- `NEXT_PUBLIC_API_URL` is not set (or set to `http://localhost:8080`)
- Next.js rewrites proxy `/api/*` requests to `http://localhost:8080/api/*`
- Frontend connects to local backend

### Production (Vercel)

When deployed to Vercel:
- `NEXT_PUBLIC_API_URL` is set to your Railway backend URL (e.g., `https://your-backend.railway.app`)
- Next.js rewrites proxy `/api/*` requests to `${NEXT_PUBLIC_API_URL}/api/*`
- Frontend connects to Railway backend

### API Client Configuration

The API client (`lib/api/client.ts`) uses `/api` as the base URL, which:
1. In development: Gets proxied to `http://localhost:8080/api` via Next.js rewrites
2. In production: Gets proxied to `${NEXT_PUBLIC_API_URL}/api` via Next.js rewrites

This means your frontend code doesn't need to change - it always uses `/api`, and Next.js handles the routing.

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | Railway backend URL | `https://your-backend.railway.app` |

## Troubleshooting

### Frontend Can't Connect to Backend

**Symptoms:**
- API requests fail with network errors
- CORS errors in browser console
- 404 errors when calling API endpoints

**Solutions:**

1. **Check Railway Backend URL:**
   ```bash
   # Test if backend is accessible
   curl https://your-backend.railway.app/api/health
   ```

2. **Verify Environment Variable:**
   - Go to Vercel → Your Project → Settings → Environment Variables
   - Make sure `NEXT_PUBLIC_API_URL` is set correctly
   - Make sure it's added to **Production** environment (and Preview if needed)

3. **Check CORS Configuration:**
   - Railway backend needs to allow requests from your Vercel domain
   - Check `SecurityConfig.java` - it should allow all origins or your Vercel domain
   - Example: `https://your-project.vercel.app`

4. **Redeploy After Environment Variable Changes:**
   - After adding/changing environment variables, you need to redeploy
   - Go to Vercel → Deployments → Click "..." → "Redeploy"

### Build Fails

**Check:**
1. Node.js version (should be 20.11.0+)
2. Build logs in Vercel dashboard
3. Make sure all dependencies are in `package.json`

**Solution:**
- Vercel auto-detects Node.js version from `package.json` engines field
- If build fails, check the build logs for specific errors

### API Requests Return 401/403

**Issue:** Authentication tokens not being sent

**Check:**
1. Login flow is working
2. Tokens are being stored in localStorage
3. API client is adding Authorization header (see `lib/api/client.ts`)

**Solution:**
- Check browser console for errors
- Verify token is being stored: `localStorage.getItem('authToken')`

## Connecting Railway to Vercel

### Option 1: Environment Variable (Recommended)

1. **Get Railway Backend URL:**
   - Go to Railway → Your backend service
   - Settings → Generate Domain (or use existing)
   - Copy the URL (e.g., `https://your-backend.railway.app`)

2. **Set in Vercel:**
   - Go to Vercel → Your project → Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-backend.railway.app`
   - Select environments: Production, Preview, Development
   - Save

3. **Redeploy:**
   - Go to Deployments → Redeploy

### Option 2: Custom Domain

If you have a custom domain:

1. **Set up Railway custom domain:**
   - Railway → Your service → Settings → Custom Domain
   - Add your domain (e.g., `api.yourdomain.com`)

2. **Set up Vercel custom domain:**
   - Vercel → Your project → Settings → Domains
   - Add your domain (e.g., `yourdomain.com`)

3. **Update environment variable:**
   - Set `NEXT_PUBLIC_API_URL` to your Railway custom domain
   - Example: `https://api.yourdomain.com`

## Testing the Connection

### 1. Test Backend Directly

```bash
# Test if Railway backend is accessible
curl https://your-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 2. Test from Vercel Frontend

1. Open your Vercel deployment URL
2. Open browser DevTools → Network tab
3. Try to login or make an API request
4. Check if requests are going to your Railway backend URL

### 3. Check CORS

If you see CORS errors:
- Railway backend needs to allow your Vercel domain
- Update `SecurityConfig.java` to allow your Vercel origin

## Production Checklist

- [ ] Railway backend is deployed and accessible
- [ ] Railway backend URL is correct
- [ ] `NEXT_PUBLIC_API_URL` is set in Vercel
- [ ] Environment variable is set for Production environment
- [ ] Frontend is deployed to Vercel
- [ ] Can access frontend URL
- [ ] Can login/register from frontend
- [ ] API requests are working
- [ ] No CORS errors in browser console

## Cost Estimate

- **Vercel Free Tier:**
  - Unlimited deployments
  - 100GB bandwidth/month
  - Perfect for small to medium projects

- **Estimated Cost:** Free for most projects

## Next Steps

After both are deployed:

1. **Test the full flow:**
   - Register a user
   - Login
   - Create a customer
   - Create an invoice
   - Record a payment

2. **Set up monitoring:**
   - Vercel Analytics (optional)
   - Railway logs
   - Error tracking (Sentry, etc.)

3. **Set up custom domains** (optional):
   - Custom domain for frontend
   - Custom domain for backend API

4. **Set up CI/CD:**
   - Both Vercel and Railway auto-deploy on git push
   - No additional setup needed!

