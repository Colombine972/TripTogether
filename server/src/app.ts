import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import databaseClient from "../database/client";
import apiRouter from "./routers/api/router";

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.FRONTEND_URL) {
  throw new Error(
    "FRONTEND_URL est manquant dans les variables d'environnement.",
  );
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Vérification de disponibilité du backend et de MySQL
app.get("/api/health", async (_req, res) => {
  try {
    await databaseClient.query("SELECT 1");

    res.status(200).json({
      status: "ok",
    });
  } catch (error) {
    console.error("Healthcheck MySQL échoué :", error);

    res.status(503).json({
      status: "unavailable",
    });
  }
});

app.use("/api", apiRouter);

const publicFolderPath = path.join(__dirname, "../../server/public");

if (fs.existsSync(publicFolderPath)) {
  app.use(express.static(publicFolderPath));
}

const clientBuildPath = path.join(__dirname, "../../client/dist");

if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  app.get("*", (_, res) => {
    res.sendFile("index.html", { root: clientBuildPath });
  });
}

import type { ErrorRequestHandler } from "express";

const logErrors: ErrorRequestHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}]`, req.method, req.path, err);

  next(err);
};

app.use(logErrors);

export default app;
