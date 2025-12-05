
# Security Policy

## 1. Headers (WAF/Cloudflare)

Ensure the following headers are set on all responses:

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; img-src 'self' https://* data:; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com;
```

## 2. Input Sanitization

- All API inputs are validated using `zod` schemas.
- File uploads are checked for MIME type magic numbers, not just extensions.
- Image processing (sharp/imagemagick) runs in a sandboxed worker.

## 3. Rate Limiting

- **Public API**: 100 req/min per IP.
- **Downloads**: 20 req/hour for free users, unlimited for premium.
- **Login**: 5 failed attempts locks account for 15 min.

## 4. Disaster Recovery

- **RPO (Recovery Point Objective)**: 1 hour (Database Point-in-Time Recovery enabled).
- **RTO (Recovery Time Objective)**: 4 hours.
- **Backups**: S3 Cross-Region Replication enabled to `us-west-2`.
