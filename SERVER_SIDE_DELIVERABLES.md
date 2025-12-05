
# Production Backend Deliverables

This file contains the server-side code and configurations required to deploy the "Upload from Gallery" feature in a production environment.

## 1. API Implementation (Node.js/Express)

```javascript
// routes/admin.js
const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { isAdmin } = require('../middleware/auth');
const Queue = require('bull');

const s3 = new AWS.S3({
  signatureVersion: 'v4',
  region: process.env.AWS_REGION
});

const uploadQueue = new Queue('image-processing', process.env.REDIS_URL);

// INIT UPLOAD: Get Signed URLs
router.post('/uploads/init', isAdmin, async (req, res) => {
  const { files } = req.body; // Array of { name, type, size }
  
  try {
    const signedUrls = await Promise.all(files.map(async (file) => {
      const fileId = uuidv4();
      const ext = file.name.split('.').pop();
      const key = `temp/${fileId}.${ext}`;
      
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Expires: 300, // 5 minutes
        ContentType: file.type
      };
      
      const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
      
      return {
        fileName: file.name,
        uploadUrl,
        key,
        tempId: fileId
      };
    }));
    
    res.json(signedUrls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// COMPLETE UPLOAD: Trigger Processing
router.post('/uploads/complete', isAdmin, async (req, res) => {
  const { s3Key, metadata, processingConfig } = req.body;
  
  // Add job to Bull queue
  const job = await uploadQueue.add({
    s3Key,
    metadata,
    processingConfig,
    adminId: req.user.id
  });
  
  res.status(202).json({ jobId: job.id, message: 'Processing started' });
});

module.exports = router;
```

## 2. Image Processing Worker (Sharp)

```javascript
// worker.js
const Queue = require('bull');
const sharp = require('sharp');
const AWS = require('aws-sdk');
const crypto = require('crypto');
const db = require('./db');

const s3 = new AWS.S3();
const uploadQueue = new Queue('image-processing', process.env.REDIS_URL);

uploadQueue.process(async (job) => {
  const { s3Key, metadata, processingConfig } = job.data;
  
  // 1. Download original from Temp
  const originalObj = await s3.getObject({ Bucket: process.env.S3_BUCKET, Key: s3Key }).promise();
  const originalBuffer = originalObj.Body;

  // 2. Compute SHA256 Hash for Dedup
  const hash = crypto.createHash('sha256').update(originalBuffer).digest('hex');
  const existing = await db.query('SELECT id FROM wallpapers WHERE hash = $1', [hash]);
  
  if (existing.rows.length > 0) {
    throw new Error('Duplicate image detected');
  }

  // 3. Process Variants
  const variants = [];
  const folder = metadata.isPremium ? 'premium' : 'free';
  const baseName = uuidv4();

  // Define sizes
  const sizes = [
    { name: 'thumb', width: 400, quality: 80 },
    { name: '1080p', width: 1920, quality: 90 },
    { name: '4K', width: 3840, quality: 95 }
  ];

  for (const size of sizes) {
    const buffer = await sharp(originalBuffer)
      .resize(size.width)
      .webp({ quality: size.quality })
      .toBuffer();
      
    const key = `wallpapers/${folder}/${baseName}-${size.name}.webp`;
    
    await s3.putObject({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'image/webp',
      ACL: 'public-read' // Or private for premium
    }).promise();
    
    variants.push({
      key: size.name,
      url: `https://cdn.lumina.co/${key}`,
      width: size.width,
      format: 'webp'
    });
  }

  // 4. Save to Database
  await db.query(
    `INSERT INTO wallpapers (id, title, hash, variants, folder, premium, uploader_id) 
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [baseName, metadata.title, hash, JSON.stringify(variants), folder, metadata.isPremium, job.data.adminId]
  );
  
  // 5. Cleanup Temp
  await s3.deleteObject({ Bucket: process.env.S3_BUCKET, Key: s3Key }).promise();

  return { success: true, id: baseName };
});
```

## 3. Database Schema (PostgreSQL)

```sql
CREATE TABLE wallpapers (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  hash CHAR(64) UNIQUE, -- SHA256
  
  -- Organization
  category VARCHAR(50),
  tags TEXT[],
  folder VARCHAR(10) CHECK (folder IN ('free', 'premium')),
  is_premium BOOLEAN DEFAULT FALSE,
  license VARCHAR(50),
  
  -- Assets (JSONB for flexibility)
  variants JSONB, 
  original_url TEXT,
  
  -- Meta
  uploader_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  views INT DEFAULT 0,
  downloads INT DEFAULT 0,
  
  -- Moderation
  status VARCHAR(20) DEFAULT 'pending', -- pending, published, rejected
  moderated_at TIMESTAMP,
  moderator_id UUID REFERENCES users(id)
);

CREATE INDEX idx_wallpapers_hash ON wallpapers(hash);
CREATE INDEX idx_wallpapers_category ON wallpapers(category);
```

## 4. Security Policy (S3 CORS)

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT", "POST", "GET"],
        "AllowedOrigins": ["https://admin.lumina.co"],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
    }
]
```

## 5. Trending API with Caching (Node.js/Redis)

```javascript
// routes/trending.js
const express = require('express');
const router = express.Router();
const redis = require('../redis');
const db = require('../db');

// Cache Middleware
const cache = async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const key = `trending:page:${page}:limit:${limit}`;
  const data = await redis.get(key);
  if (data) return res.json(JSON.parse(data));
  next();
};

router.get('/api/wallpapers/trending', cache, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  try {
    // MongoDB Aggregation Pipeline for Trending Score
    // Formula: (views * 1) + (downloads * 2) + (RecencyBoost * 100)
    // RecencyBoost = max(0, 1 - ageInDays/30)
    
    const pipeline = [
      { $match: { status: 'published' } },
      {
        $addFields: {
          ageInDays: {
            $divide: [
              { $subtract: [new Date(), "$createdAt"] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $addFields: {
          recencyBoost: {
            $max: [0, { $subtract: [1, { $divide: ["$ageInDays", 30] }] }]
          }
        }
      },
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $multiply: ["$views", 1] },
              { $multiply: ["$downloads", 2] },
              { $multiply: ["$recencyBoost", 100] }
            ]
          }
        }
      },
      { $sort: { trendingScore: -1 } },
      { $skip: offset },
      { $limit: limit },
      {
        $project: {
          title: 1,
          thumbnailUrl: 1,
          tags: 1,
          uploader: 1,
          trendingScore: 1,
          createdAt: 1,
          views: 1,
          downloads: 1
        }
      }
    ];

    const wallpapers = await db.collection('wallpapers').aggregate(pipeline).toArray();
    
    // Cache Result (60 seconds)
    const key = `trending:page:${page}:limit:${limit}`;
    await redis.setex(key, 60, JSON.stringify(wallpapers));

    res.json(wallpapers);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## 6. Custom Download & Resize API Route (Node.js/Express + Sharp)

```javascript
// routes/download.js
const express = require('express');
const router = express.Router();
const sharp = require('sharp');
const AWS = require('aws-sdk');
const db = require('../db'); // Your DB access layer
const { isAuthenticated } = require('../middleware/auth');

const s3 = new AWS.S3();

router.get('/api/download', async (req, res) => {
  try {
    const { id, width, height, quality, format } = req.query;

    // 1. Input Validation
    if (!id || !width || !height) return res.status(400).send("Missing parameters");
    const w = parseInt(width);
    const h = parseInt(height);
    const q = parseInt(quality) || 90;
    const fmt = ['jpg', 'jpeg', 'webp', 'avif'].includes(format) ? format : 'jpg';

    if (w > 8000 || h > 8000) return res.status(400).send("Dimensions too large (max 8000px)");

    // 2. Fetch Metadata & Auth Check
    const wallpaper = await db.query('SELECT * FROM wallpapers WHERE id = $1', [id]);
    if (!wallpaper.rows[0]) return res.status(404).send("Not found");
    const wpData = wallpaper.rows[0];

    if (wpData.is_premium) {
      // Middleware should attach 'user' to req
      // In a real app, use verifyToken middleware or similar
      const authHeader = req.headers.authorization; 
      if (!authHeader) return res.status(403).send("Premium subscription required");
      // Add detailed auth check here
    }

    // 3. Setup Stream Pipeline
    // Fetch original from S3
    const s3Params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: wpData.original_s3_key // e.g., "wallpapers/premium/uuid-original.png"
    };

    const s3Stream = s3.getObject(s3Params).createReadStream();

    // 4. Configure Sharp Transformer
    const transformer = sharp()
      .resize(w, h, {
        fit: 'cover',
        position: 'center',
        withoutEnlargement: false
      })
      .rotate() // Auto-orient based on EXIF
      .toFormat(fmt, { quality: q });

    // 5. Set Response Headers
    const cleanTitle = wpData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `lumina-${cleanTitle}-${w}x${h}.${fmt}`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', `image/${fmt}`);
    // Cache the *generated* response in CDN/Browser for 1 year if immutable
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    // 6. Pipe: S3 -> Sharp -> Response
    s3Stream.pipe(transformer).pipe(res);

    // Error Handling
    s3Stream.on('error', (err) => {
      console.error('S3 Stream Error:', err);
      if (!res.headersSent) res.status(500).send("Source image error");
    });

    transformer.on('error', (err) => {
      console.error('Sharp Processing Error:', err);
      if (!res.headersSent) res.status(500).send("Image processing failed");
    });

  } catch (error) {
    console.error("Download Route Error", error);
    if (!res.headersSent) res.status(500).send("Server Error");
  }
});

module.exports = router;
```
