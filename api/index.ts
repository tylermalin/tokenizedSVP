// Vercel serverless function wrapper for Express app
// Use TypeScript import - Vercel will compile it automatically
import app from "../backend/src/server";

// Export as Vercel serverless function handler
// Vercel expects the Express app directly
export default app;
