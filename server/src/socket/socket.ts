import type { Server as HttpServer } from "node:http";
import jwt, {
  type JwtPayload,
} from "jsonwebtoken";
import { Server } from "socket.io";

interface MyPayload extends JwtPayload {
  sub: string;
}

let io: Server | null = null;

export const initializeSocket = (
  httpServer: HttpServer,
): Server => {
  io = new Server(httpServer, {
    cors: {
      origin:
        process.env.CLIENT_URL ||
        "http://localhost:5173",
      methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
      ],
      credentials: true,
    },
  });

  /*
   * Authentification Socket.IO
   *
   * Le frontend transmet le JWT avec :
   *
   * auth: {
   *   token
   * }
   */
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth.token;

      if (
        !token ||
        typeof token !== "string"
      ) {
        return next(
          new Error(
            "Token Socket.IO manquant",
          ),
        );
      }

      const secret =
        process.env.APP_SECRET;

      if (!secret) {
        console.error(
          "APP_SECRET est manquant dans les variables d'environnement.",
        );

        return next(
          new Error(
            "Configuration serveur invalide",
          ),
        );
      }

      /*
       * Même vérification que dans ton
       * middleware verifyToken.
       */
      const decoded =
        jwt.verify(
          token,
          secret,
        ) as MyPayload;

      /*
       * Ton JWT est créé avec :
       *
       * {
       *   sub: user.id.toString()
       * }
       *
       * L'identifiant utilisateur se trouve
       * donc dans decoded.sub.
       */
      if (!decoded.sub) {
        return next(
          new Error(
            "Utilisateur Socket.IO invalide",
          ),
        );
      }

      const userId =
        Number(decoded.sub);

      if (
        !Number.isInteger(
          userId,
        ) ||
        userId <= 0
      ) {
        return next(
          new Error(
            "Identifiant utilisateur Socket.IO invalide",
          ),
        );
      }

      /*
       * On conserve l'identifiant dans
       * socket.data pour pouvoir le récupérer
       * après l'authentification.
       */
      socket.data.userId =
        userId;

      next();
    } catch (error) {
      console.error(
        "Erreur authentification Socket.IO :",
        error,
      );

      next(
        new Error(
          "Authentification Socket.IO invalide",
        ),
      );
    }
  });

  /*
   * Connexion Socket.IO réussie
   */
  io.on(
    "connection",
    (socket) => {
      const userId =
        socket.data
          .userId as number;

      /*
       * Chaque utilisateur possède sa propre room.
       *
       * Exemple :
       *
       * user 12
       *      ↓
       * room "user:12"
       */
      const userRoom =
        `user:${userId}`;

      socket.join(
        userRoom,
      );

      console.info(
        `Socket connecté : user ${userId} - ${socket.id}`,
      );

      /*
       * Événement temporaire permettant
       * de vérifier que Socket.IO fonctionne.
       *
       * Nous pourrons le supprimer après
       * nos tests.
       */
      socket.emit(
        "socket:test",
        {
          message:
            "Connexion Socket.IO réussie",
          userId,
        },
      );

      /*
       * Déconnexion
       */
      socket.on(
        "disconnect",
        (reason) => {
          console.info(
            `Socket déconnecté : user ${userId} - ${reason}`,
          );
        },
      );
    },
  );

  return io;
};

/*
 * Permet aux autres services backend
 * d'accéder à l'instance Socket.IO.
 *
 * Exemple :
 *
 * getIo()
 *   .to("user:12")
 *   .emit("notification:refresh");
 */
export const getIo =
  (): Server => {
    if (!io) {
      throw new Error(
        "Socket.IO n'a pas encore été initialisé",
      );
    }

    return io;
  };