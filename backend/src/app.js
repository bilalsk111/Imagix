import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import imageRoutes from "./routes/image.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Serve static frontend assets from the public folder
app.use(express.static(path.join(__dirname, "..", "public")));

// API Routes
app.use("/api/image", imageRoutes);

// API health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API is running 🚀" });
});

// Serve frontend for root and all unknown routes (SPA support)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});


export default app;