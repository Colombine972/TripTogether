import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import type { Socket } from "socket.io-client";

import {
  connectSocket,
  disconnectSocket,
} from "../services/socket";

import { useAuth } from "./AuthContext";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext =
  createContext<SocketContextType | undefined>(
    undefined,
  );

type SocketProviderProps = {
  children: ReactNode;
};

export const SocketProvider = ({
  children,
}: SocketProviderProps) => {
  const { auth } = useAuth();

  const [socket, setSocket] =
    useState<Socket | null>(null);

  const [isConnected, setIsConnected] =
    useState(false);

  useEffect(() => {
    if (!auth?.token) {
      disconnectSocket();

      setSocket(null);
      setIsConnected(false);

      return;
    }

    const currentSocket =
      connectSocket(auth.token);

    setSocket(currentSocket);

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    currentSocket.on(
      "connect",
      handleConnect,
    );

    currentSocket.on(
      "disconnect",
      handleDisconnect,
    );

    if (currentSocket.connected) {
      setIsConnected(true);
    }

    return () => {
      currentSocket.off(
        "connect",
        handleConnect,
      );

      currentSocket.off(
        "disconnect",
        handleDisconnect,
      );
    };
  }, [auth?.token]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context =
    useContext(SocketContext);

  if (!context) {
    throw new Error(
      "useSocket must be used within a SocketProvider",
    );
  }

  return context;
};