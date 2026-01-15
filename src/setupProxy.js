const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // This ensures that all non-API routes fallback to React Router
  app.use((req, res, next) => {
    // If the request is for a static file or API, let it through
    if (
      req.path.startsWith('/static/') ||
      req.path.startsWith('/api/') ||
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