// Vercel API handler
const { Hono } = require('hono');
const { handle } = require('hono/vercel');

// Create a simple Hono app for Vercel
const app = new Hono();

// Add a basic route
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', message: 'API is running on Vercel' });
});

// Handle all API routes
app.all('/api/*', (c) => {
  return c.json({ 
    error: 'API endpoint not implemented in Vercel deployment',
    message: 'This is a static deployment. Backend functionality requires Cloudflare Workers.'
  }, 501);
});

// Export the handler for Vercel
module.exports = handle(app);