
# Deployment Guide for Lumina Wallpapers

## 1. Environment Setup

Required Environment Variables:
```bash
# General
NODE_ENV=production
API_KEY=your_gemini_api_key

# Database (PostgreSQL/MongoDB)
DATABASE_URL=postgres://user:pass@host:5432/lumina

# Storage (AWS S3)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
S3_BUCKET_NAME=lumina-assets-prod

# Authentication (Auth0/NextAuth)
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://lumina.co

# Payments
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

## 2. Infrastructure (AWS)

### S3 Bucket Configuration
- **Block Public Access**: Enabled
- **CORS Policy**:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT"],
        "AllowedOrigins": ["https://lumina.co"],
        "ExposeHeaders": []
    }
]
```
- **Lifecycle Rule**: Move objects > 90 days to Glacier Deep Archive.

### CloudFront Distribution
- **Origin**: S3 Bucket
- **Viewer Protocol Policy**: Redirect HTTP to HTTPS
- **Allowed Methods**: GET, HEAD, OPTIONS
- **Restrict Viewer Access**: Yes (Use Signed URLs for /originals/* path)

## 3. Database Schema (PostgreSQL Example)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  is_premium BOOLEAN DEFAULT FALSE
);

CREATE TABLE wallpapers (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  uploader_id UUID REFERENCES users(id)
);
```

## 4. Monitoring & Alerts

1. **Sentry**: Initialize in `index.tsx`.
   ```ts
   Sentry.init({ dsn: "https://examplePublicKey@o0.ingest.sentry.io/0" });
   ```
2. **UptimeRobot**: Point to `https://lumina.co/api/health`.
3. **CloudWatch Alarms**: 
   - Alert if 5xx errors > 1% of requests.
   - Alert if Latency > 2s for p99.

## 5. Deployment Commands

**Frontend (Vercel)**
```bash
vercel deploy --prod
```

**Backend (Docker)**
```bash
docker build -t lumina-api .
docker run -p 3000:3000 --env-file .env lumina-api
```
