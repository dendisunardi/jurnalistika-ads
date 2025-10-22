import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Try multiple possible paths for static files
  const possiblePaths = [
    path.resolve(__dirname, "public"), // Local build: dist/index.js -> dist/public
    path.resolve(process.cwd(), "dist/public"), // Alternative: from project root
    path.resolve(process.cwd(), "public"), // Vercel might put files here
    path.resolve(__dirname, "../public"), // Another alternative
    path.resolve(__dirname, "../dist/public"), // Vercel serverless structure
    path.resolve(process.cwd(), ".vercel/output/static"), // Vercel static output
  ];
  
  log(`__dirname: ${__dirname}`);
  log(`process.cwd(): ${process.cwd()}`);
  
  let distPath: string | null = null;
  
  // Find the first path that exists
  for (const testPath of possiblePaths) {
    log(`Testing path: ${testPath}`);
    if (fs.existsSync(testPath)) {
      const files = fs.readdirSync(testPath);
      log(`Found files: ${files.join(', ')}`);
      
      // Check if this directory contains the expected files
      if (files.includes('index.html') || files.includes('assets')) {
        distPath = testPath;
        log(`Using static files directory: ${distPath}`);
        break;
      }
    }
  }

  if (!distPath) {
    // If we can't find static files, serve a basic HTML response
    log(`Could not find static files. Tried: ${possiblePaths.join(', ')}`);
    
    app.use("*", (_req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Jurnalistika Ads</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body>
            <div id="root">
              <h1>Loading...</h1>
              <p>Static files not found. Paths tried: ${possiblePaths.join(', ')}</p>
            </div>
          </body>
        </html>
      `);
    });
    return;
  }

  // Serve static assets with proper MIME types
  app.get('/assets/*', (req, res) => {
    const assetPath = path.join(distPath!, req.path);
    log(`Serving asset: ${assetPath}`);
    
    if (fs.existsSync(assetPath)) {
      // Set proper MIME type
      if (assetPath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (assetPath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
      res.sendFile(assetPath);
    } else {
      log(`Asset not found: ${assetPath}`);
      res.status(404).send('Asset not found');
    }
  });

  // Use express.static as fallback
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath!, "index.html");
    log(`Serving index.html from: ${indexPath}`);
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      log(`index.html not found at ${indexPath}`);
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Jurnalistika Ads</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body>
            <div id="root">
              <h1>Error</h1>
              <p>index.html not found at ${indexPath}</p>
            </div>
          </body>
        </html>
      `);
    }
  });
}
