// Vercel serverless function wrapper for Express app
// Import from compiled backend JavaScript (built during Vercel build step)
// @ts-ignore - Importing compiled JS from outside api directory
const app = require("../backend/dist/server");

// Export as Vercel serverless function handler
// Handle both ES module default export and CommonJS export
module.exports = app.default || app;
