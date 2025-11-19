import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";

// Routes
import authRoutes from "./routes/auth.routes";
import spvRoutes from "./routes/spv.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import investorRoutes from "./routes/investor.routes";
import managerRoutes from "./routes/manager.routes";
import adminRoutes from "./routes/admin.routes";
import realEstateRoutes from "./routes/real-estate.routes";
import complianceRoutes from "./routes/compliance.routes";
import invitationRoutes from "./routes/invitation.routes";
import documentRoutes from "./routes/document.routes";
import healthRoutes from "./routes/health.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    const frontendOrigin = process.env.FRONTEND_ORIGIN;

    // If FRONTEND_ORIGIN is set, use it
    if (frontendOrigin) {
      if (origin === frontendOrigin || !origin) {
        callback(null, true);
        return;
      }
    }

    // In development, allow any localhost port
    if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
      if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
        callback(null, true);
        return;
      }
    }

    // In production, only allow specified origin or default to port 3000
    const allowedOrigin = frontendOrigin || "http://localhost:3000";
    if (origin === allowedOrigin || !origin) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip });
  next();
});

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/compliance", complianceRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/spvs", spvRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/investors", investorRoutes);
app.use("/api/managers", managerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/real-estate", realEstateRoutes);
app.use("/api/documents", documentRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception:", error);
  // Don't exit immediately, let the process handle it
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
  });
});

export default app;
