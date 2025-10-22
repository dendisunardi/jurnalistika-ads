import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  // Middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    res.json = function(body) {
      console.log(`${req.method} ${req.path} - Response:`, body);
      return originalJson.call(this, body);
    };
    console.log(`${req.method} ${req.path} - Body:`, req.body);
    next();
  });

  // Basic health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Serve static files
  const staticPaths = [
    path.resolve(process.cwd(), "dist/public"),
    path.resolve(__dirname, "../dist/public"),
    path.resolve(__dirname, "../../dist/public"),
    path.resolve("/var/task/dist/public"),
  ];

  let staticDir: string | null = null;
  for (const staticPath of staticPaths) {
    if (fs.existsSync(staticPath)) {
      staticDir = staticPath;
      console.log(`Found static files at: ${staticPath}`);
      break;
    }
  }

  if (staticDir) {
    // Serve assets with proper MIME types
    app.get('/assets/*', (req, res) => {
      const filePath = path.join(staticDir!, req.path);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath);
        const mimeTypes: { [key: string]: string } = {
          '.js': 'application/javascript',
          '.css': 'text/css',
          '.html': 'text/html',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
        };
        
        const mimeType = mimeTypes[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', mimeType);
        res.sendFile(filePath);
      } else {
        res.status(404).send('Asset not found');
      }
    });

    // Serve static files
    app.use(express.static(staticDir));

    // Fallback to index.html for SPA routing
    app.get('*', (req, res) => {
      const indexPath = path.join(staticDir!, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send(`
          <html>
            <body>
              <h1>Application Error</h1>
              <p>Static files not found. Please check your build configuration.</p>
              <p>Looking for files in: ${staticDir}</p>
            </body>
          </html>
        `);
      }
    });
  } else {
    console.log("No static files found, serving basic response");
    app.get('*', (req, res) => {
      res.send(`
        <html>
          <body>
            <h1>Jurnalistika Ads Platform</h1>
            <p>Application is running but static files are not available.</p>
            <p>Searched paths: ${staticPaths.join(', ')}</p>
            <p>Current working directory: ${process.cwd()}</p>
            <p>__dirname: ${__dirname}</p>
          </body>
        </html>
      `);
    });
  }

  // Error handling middleware (must be last)
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Error occurred:", err);
    res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  });

  cachedApp = app;
  return app;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await createApp();
    return app(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ 
      message: "Server initialization failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}