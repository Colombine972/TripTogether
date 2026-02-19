import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import apiRouter from "./routers/api/router";

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (process.env.CLIENT_URL != null) {
  app.use(cors({ origin: [process.env.CLIENT_URL] }));
}

app.use(express.json());

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
  console.error(err);
  console.error("on req:", req.method, req.path);
  next(err);
};

app.use(logErrors);

export default app;
