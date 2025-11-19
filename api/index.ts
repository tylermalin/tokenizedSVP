// Vercel serverless function wrapper for Express app
// Import from compiled backend (built during Vercel build step)
// Vercel compiles TypeScript in api/ directory, but backend is pre-compiled
// @ts-ignore - Compiled JS file exists at runtime in Vercel
import app from "../backend/dist/server";

// Export as Vercel serverless function handler
// Vercel expects the Express app directly
export default app;
