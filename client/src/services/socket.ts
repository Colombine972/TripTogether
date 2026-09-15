import { type Socket, io } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL, {
      autoConnect: false,

      auth: {
        token,
      },

      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("🟢 Socket.IO connecté :", socket?.id);
    });

    socket.on("connect_error", (error) => {
      console.error("🔴 Erreur Socket.IO :", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("🟠 Socket.IO déconnecté :", reason);
    });
  }

  // Toujours mettre à jour le token avant une connexion/reconnexion
  socket.auth = {
    token,
  };

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (!socket) {
    return;
  }

  socket.disconnect();
  socket.removeAllListeners();

  socket = null;
};
