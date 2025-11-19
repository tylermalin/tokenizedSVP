import { Request, Response, NextFunction } from 'express';
import express from 'express';

/**
 * Middleware to parse webhook body as raw text for signature verification
 * Must be used before json() middleware for webhook routes
 */
export const webhookBodyParser = express.raw({ type: 'application/json' });

