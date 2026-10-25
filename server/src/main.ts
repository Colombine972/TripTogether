import "dotenv/config";
import { createServer } from "node:http";

import "../database/checkConnection";
import app from "./app";
import { startStepVoteScheduler } from "./modules/step/stepVoteScheduler";
import { initializeSocket } from "./socket/socket";

const port = Number(process.env.PORT || process.env.APP_PORT || 3310);

const httpServer = createServer(app);

initializeSocket(httpServer);

httpServer
  .listen(port, "0.0.0.0", () => {
    console.info(`Server is listening on port ${port}`);
    console.info("Socket.IO is ready");

    // Préparation de la clôture automatique des votes
    startStepVoteScheduler();
  })
  .on("error", (err: Error) => {
    console.error("Erreur du serveur :", err.message);
  });
