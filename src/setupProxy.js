const https = require('https');

module.exports = function (app) {
  // Proxy Firebase Storage file downloads to avoid CORS issues in development.
  // Fetches the file server-side and streams the binary response back.
  app.get('/firebase-storage-proxy', (req, res) => {
    const fileUrl = req.query.url;
    if (!fileUrl || !fileUrl.startsWith('https://firebasestorage.googleapis.com/')) {
      return res.status(400).send('Missing or invalid url parameter');
    }

    https
      .get(fileUrl, (upstream) => {
        if (upstream.statusCode !== 200) {
          return res.status(upstream.statusCode).send('Firebase Storage error');
        }
        // Forward content-type so the browser gets the right binary data
        const ct = upstream.headers['content-type'];
        if (ct) res.setHeader('Content-Type', ct);
        upstream.pipe(res);
      })
      .on('error', (err) => {
        res.status(502).send('Proxy fetch failed: ' + err.message);
      });
  });

  // This ensures that all non-API routes fallback to React Router
  app.use((req, res, next) => {
    // If the request is for a static file or API, let it through
    if (
      req.path.startsWith('/static/') ||
      req.path.startsWith('/api/') ||
      req.path.startsWith('/firebase-storage-proxy') ||
      req.path.includes('.') ||
      req.method !== 'GET'
    ) {
      return next();
    }

    // For all other GET requests, serve index.html to enable client-side routing
    req.url = '/';
    next();
  });
};
