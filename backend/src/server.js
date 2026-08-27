import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import { homeRouter } from "./routes/home.js";
import { legislativeRouter } from "./routes/legislative.js";
import { councilorsRouter } from "./routes/councilors.js";
import { aboutRouter } from "./routes/about.js";
import { generalLimiter, searchLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 4000;
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

// --- Security & platform middleware (NFR-8, NFR-9, NFR-11, NFR-19) ---
app.use(helmet());
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    methods: ["GET"], // Public website is strictly read-only.
  })
);
app.use(compression());
app.use(express.json());
app.use(generalLimiter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/home", homeRouter);
app.use("/api/legislative", searchLimiter, legislativeRouter);
app.use("/api/councilors", councilorsRouter);
app.use("/api/about", aboutRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Public website API listening on http://localhost:${PORT}`);
});
