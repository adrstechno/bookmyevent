# Fix CORS "strict-origin" Error

## The Problem
Your production frontend (HTTPS) cannot call your backend (HTTP) due to browser security:
- Frontend: `https://goeventify.com` ✅ HTTPS
- Backend: `http://13.233.131.46:3232` ❌ HTTP
- Browser blocks: Mixed content (HTTPS → HTTP)

## Solutions

### Option 1: Setup HTTPS on EC2 with Nginx (RECOMMENDED)

#### Prerequisites:
1. A subdomain pointing to your EC2 IP
   - Example: `api.goeventify.com` → `13.233.131.46`
2. EC2 Security Group allows ports 80 and 443

#### Steps:

**1. Point subdomain to EC2**
In your domain DNS settings (GoDaddy, Namecheap, etc.):
```
Type: A Record
Name: api
Value: 13.233.131.46
TTL: 300
```

**2. Run setup script on EC2**
```bash
# Upload setup-https-ec2.sh to EC2
chmod +x setup-https-ec2.sh
sudo ./setup-https-ec2.sh
# Enter: api.goeventify.com when prompted
```

**3. Update Frontend .env**
```env
VITE_API_BASE_URL=https://api.goeventify.com
```

**4. Rebuild and deploy frontend**
```bash
npm run build
# Deploy to Vercel
```

**Done!** Your API is now on HTTPS.

---

### Option 2: Use Cloudflare Tunnel (No Domain Setup)

Cloudflare Tunnel creates a secure HTTPS endpoint without needing to configure DNS or SSL.

#### Steps:

**1. Install Cloudflare Tunnel on EC2**
```bash
# Download cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Login to Cloudflare
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create goeventify-api

# Run tunnel
cloudflared tunnel --url http://localhost:3232
```

**2. You'll get a URL like:**
```
https://random-name.trycloudflare.com
```

**3. Update Frontend .env**
```env
VITE_API_BASE_URL=https://random-name.trycloudflare.com
```

**Pros:** Quick, no DNS setup
**Cons:** Random URL, free tier has limitations

---

### Option 3: Use Vercel Serverless Functions (Proxy)

Create a proxy in your Vercel frontend that forwards requests to your EC2 backend.

**1. Create `api/proxy.js` in Frontend:**
```javascript
export default async function handler(req, res) {
  const { path } = req.query;
  const url = `http://13.233.131.46:3232/${path.join('/')}`;
  
  const response = await fetch(url, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
  });
  
  const data = await response.json();
  res.status(response.status).json(data);
}
```

**2. Update Frontend to use:**
```javascript
// Instead of: http://13.233.131.46:3232/User/Login
// Use: /api/proxy?path=User&path=Login
```

**Pros:** No backend changes
**Cons:** Extra latency, complex setup

---

### Option 4: Temporary Fix - Allow HTTP in Production (NOT RECOMMENDED)

**Only for testing, not for production!**

Update Frontend `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://13.233.131.46:3232',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false, // Allow HTTP
      }
    }
  }
})
```

---

## Recommended Solution

**Use Option 1 (Nginx + Let's Encrypt)**

### Why?
- ✅ Free SSL certificate
- ✅ Professional setup
- ✅ Auto-renewal
- ✅ Better performance
- ✅ Custom domain

### Quick Setup:
```bash
# 1. Add DNS record
api.goeventify.com → 13.233.131.46

# 2. On EC2
chmod +x setup-https-ec2.sh
sudo ./setup-https-ec2.sh

# 3. Update frontend
VITE_API_BASE_URL=https://api.goeventify.com

# 4. Rebuild frontend
npm run build
```

**Time: 10 minutes**
**Cost: FREE**

---

## Verify It Works

After setup, test:
```bash
# Should return your API response
curl https://api.goeventify.com

# From browser console on https://goeventify.com
fetch('https://api.goeventify.com/User/Login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'test' }),
  credentials: 'include'
})
```

No more CORS errors! 🎉
