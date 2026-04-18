import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// API routes
app.use("/api", router);

// Serve built React frontend in production
if (process.env.NODE_ENV === "production") {
  // Path from dist/index.mjs → up to api-server → up to artifacts → dealership/dist/public
  const staticPath = path.resolve(__dirname, "../../dealership/dist/public");
  const indexHtmlPath = path.join(staticPath, "index.html");

  app.use(express.static(staticPath));

  // SPA fallback: any non-API request that didn't match a static file
  // returns index.html so React Router can handle the route client-side.
  // Using app.use (middleware) instead of app.get("*") because Express 5
  // with path-to-regexp v8 no longer accepts the bare "*" wildcard.
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(indexHtmlPath);
  });
}

export default app;
