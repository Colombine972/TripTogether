import "dotenv/config";
import { createServer } from "node:http";

import "../database/checkConnection";
import app from "./app";
import {
  initializeSocket,
} from "./socket/socket";

const port =
  process.env.APP_PORT;

const httpServer =
  createServer(app);

initializeSocket(
  httpServer,
);

httpServer
  .listen(port, () => {
    console.info(
      `Server is listening on port ${port}`,
    );

    console.info(
      "Socket.IO is ready",
    );
  })
  .on(
    "error",
    (err: Error) => {
      console.error(
        "Erreur du serveur :",
        err.message,
      );
    },
  );