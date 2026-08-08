// src/socket/socket.ts

import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

type JwtPayload = {
  id: number;
  email?: string;
};

let io: Server | null = null;

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    },
  });

  /*
   * Authentification Socket.IO
   */
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Token manquant"));
      }

      const secret = process.env.JWT_SECRET;

      if (!secret) {
        return next(new Error("JWT_SECRET manquant"));
      }

      const decoded = jwt.verify(token, secret) as JwtPayload;

      socket.data.userId = decoded.id;

      next();
    } catch (error) {
      console.error("Erreur authentification Socket.IO :", error);

      next(new Error("Authentification Socket.IO invalide"));
    }
  });

  /*
   * Connexion d'un utilisateur
   */
  io.on("connection", (socket) => {
    const userId = socket.data.userId as number;

    const userRoom = `user:${userId}`;

    socket.join(userRoom);

    console.log(
      `🟢 Socket connecté : user ${userId} - ${socket.id}`,
    );

    socket.on("disconnect", (reason) => {
      console.log(
        `🔴 Socket déconnecté : user ${userId} - ${reason}`,
      );
    });
  });

  return io;
};

export const getIo = (): Server => {
  if (!io) {
    throw new Error(
      "Socket.IO n'a pas encore été initialisé",
    );
  }

  return io;
};