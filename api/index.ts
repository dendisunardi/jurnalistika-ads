import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { serveStatic, log } from "../server/vite";

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// Cache the initialized app
let cachedApp: express.Express | null = null;

async function createApp() {
  if (cachedApp) {
    return cachedApp;
  }

  const app = express();

  app.use(express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ extended: false }));

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
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

  try {
    log(`NODE_ENV: ${process.env.NODE_ENV}`);
    log(`Current working directory: ${process.cwd()}`);
    
    // Register routes
    await registerRoutes(app);

    // Setup static file serving for production
    log("Setting up static file serving for production");
    serveStatic(app);

    // Error handler (should be last)
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log(`Error: ${status} - ${message}`);
      res.status(status).json({ message });
    });
    
    log("App initialized successfully");
    cachedApp = app;
    return app;
  } catch (error) {
    log(`Initialization error: ${error}`);
    throw error;
  }
}

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  try {
    const app = await createApp();
    return app(req, res);
  } catch (error) {
    log(`Handler error: ${error}`);
    res.status(500).json({ error: 'Internal Server Error', details: String(error) });
  }
}