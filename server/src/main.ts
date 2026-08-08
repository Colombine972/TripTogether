import "dotenv/config";
import { createServer } from "node:http";

import app from "./app";
import "../database/checkConnection";

const port = process.env.APP_PORT;

const httpServer = createServer(app);

httpServer
  .listen(port, () => {
    console.info(`Server is listening on port ${port}`);
  })
  .on("error", (err: Error) => {
    console.error("Erreur du serveur :", err.message);
  });