// Vercel serverless function wrapper for Express app
import app from '../backend/src/server';

// Export as Vercel serverless function handler
// The Express app can be used directly as a request handler
export default app;
