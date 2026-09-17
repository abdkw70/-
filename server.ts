import express from 'express';
import path from 'path';
import https from 'https';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes/api';
import { db } from './server/db';
import { storeImporter } from './server/importer';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Firebase Auth reverse proxy for same-origin authDomain
  // Prevents Safari ITP, iOS storage partitioning, and "missing initial state" errors
  // Placed before express.json() to stream request bodies directly
  app.use('/__/auth', (req, res) => {
    const targetHost = 'perceptive-edge-j52jj.firebaseapp.com';
    const targetUrl = new URL(req.originalUrl || req.url, `https://${targetHost}`);

    const headers: Record<string, string> = {};
    for (const [key, val] of Object.entries(req.headers)) {
      if (val !== undefined) {
        headers[key] = Array.isArray(val) ? val.join(', ') : String(val);
      }
    }
    headers.host = targetHost;

    // Remove hop-by-hop headers
    delete headers['connection'];
    delete headers['keep-alive'];
    delete headers['proxy-authenticate'];
    delete headers['proxy-authorization'];
    delete headers['te'];
    delete headers['trailers'];
    delete headers['transfer-encoding'];
    delete headers['upgrade'];

    const proxyReq = https.request(
      targetUrl.toString(),
      {
        method: req.method,
        headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );

    proxyReq.on('error', (err) => {
      console.error('[Auth Proxy] Error forwarding to Firebase:', err);
      if (!res.headersSent) {
        res.status(502).send('Auth proxy gateway error');
      }
    });

    req.pipe(proxyReq);
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Request logger for API debugging
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      store: 'مكتبة الشاطئ الازرق | Blue Beach Stationery',
      productsCount: db.getProducts().length,
      categoriesCount: db.getCategories().length,
      importerStatus: storeImporter.getStatus().status,
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API Router
  app.use('/api', apiRouter);

  // Serve static files from public directory
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Blue Beach Stationery Store Server is running on http://0.0.0.0:${PORT}`);
    console.log(`📦 Database loaded with ${db.getProducts().length} products and ${db.getCategories().length} categories`);

    // Auto-seed from original store if database is empty
    if (db.getProducts().length === 0) {
      console.log('🔄 Database is empty, initiating initial auto-sync from maktaba-q8.com...');
      storeImporter.start().catch(err => {
        console.error('Initial auto-sync error:', err);
      });
    }
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
