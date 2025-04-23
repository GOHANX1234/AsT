import express, { type Request, Response, NextFunction } from "express";
import * as nodePath from "path";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Add trust proxy to avoid issues with secure cookies behind a proxy/load balancer
// when deployed on Render or similar platforms

const app = express();

// Enable trust proxy to properly handle secure cookies in production environments
app.set('trust proxy', 1);

// CORS configuration
const isProduction = process.env.NODE_ENV === "production";

// Define origins for CORS
const corsOrigin = isProduction
  ? ["https://aestrialhack.onrender.com"] // Only allow specific origins in production
  : true; // Allow all origins in development

// Apply CORS middleware
app.use(cors({
  origin: corsOrigin,
  credentials: true, // Allow cookies to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // In production, we need to serve static files and handle client-side routing
    serveStatic(app);
    
    // Add a catch-all route for client-side routing
    app.get('*', (req, res) => {
      // Exclude API routes
      if (!req.path.startsWith('/api/')) {
        console.log(`Serving index.html for client-side route: ${req.path}`);
        res.sendFile(nodePath.resolve(process.cwd(), 'dist', 'client', 'index.html'));
      }
    });
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
