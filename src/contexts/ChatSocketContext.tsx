import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createChatSocket,
  type ChatSocket,
} from "../api/socket";
import {
  refreshAccessToken,
  subscribeToAuthChanges,
} from "../api/auth";

type ChatSocketContextValue = {
  socket: ChatSocket | null;
  isConnected: boolean;
  latestMessage: any | null;
  socketError: string | null;
  sendMessage: (payload: {
    roomId: number | string;
    content: string;
    file?: string;
  }) => void;
};

const ChatSocketContext =
  createContext<ChatSocketContextValue | null>(
    null
  );

type ChatSocketProviderProps = {
  roomId: number | null;
  children: ReactNode;
};

export const ChatSocketProvider =
  ({
    roomId,
    children,
  }: ChatSocketProviderProps) => {
    const socketRef =
      useRef<ChatSocket | null>(
        null
      );
    const previousRoomRef =
      useRef<number | null>(
        null
      );
    const [isConnected, setIsConnected] =
      useState(false);
    const [latestMessage, setLatestMessage] =
      useState<any | null>(null);
    const [socketError, setSocketError] =
      useState<string | null>(
        null
      );

    useEffect(() => {
      const socket =
        createChatSocket();
      let retriedAfterRefresh =
        false;

      socketRef.current =
        socket;

      const handleConnect = () => {
        setIsConnected(true);
        setSocketError(null);
      };

      const handleDisconnect = () => {
        setIsConnected(false);
      };

      const handleConnectError = (
        error: Error
      ) => {
        if (
          error.message ===
            "Unauthorized" &&
          !retriedAfterRefresh
        ) {
          retriedAfterRefresh =
            true;

          refreshAccessToken()
            .then(() => {
              socket.connect();
            })
            .catch(() => {
              setSocketError(
                error.message
              );
            });

          return;
        }

        setSocketError(
          error.message
        );
      };

      const handleReceiveMessage = (
        message: any
      ) => {
        setLatestMessage(message);
      };

      const handleErrorMessage = (
        payload: {
          message?: string;
        }
      ) => {
        setSocketError(
          payload?.message ||
            "Socket error"
        );
      };

      socket.on(
        "connect",
        handleConnect
      );
      socket.on(
        "disconnect",
        handleDisconnect
      );
      socket.on(
        "connect_error",
        handleConnectError
      );
      socket.on(
        "receive_message",
        handleReceiveMessage
      );
      socket.on(
        "error_message",
        handleErrorMessage
      );

      socket.connect();

      const unsubscribe =
        subscribeToAuthChanges(
          () => {
            if (
              socket.connected
            ) {
              socket.disconnect();
            }

            socket.connect();
          }
        );

      return () => {
        unsubscribe();
        socket.off(
          "connect",
          handleConnect
        );
        socket.off(
          "disconnect",
          handleDisconnect
        );
        socket.off(
          "connect_error",
          handleConnectError
        );
        socket.off(
          "receive_message",
          handleReceiveMessage
        );
        socket.off(
          "error_message",
          handleErrorMessage
        );
        socket.disconnect();
        socketRef.current =
          null;
      };
    }, []);

    useEffect(() => {
      const socket =
        socketRef.current;

      if (!socket) {
        return;
      }

      const previousRoom =
        previousRoomRef.current;

      if (
        previousRoom &&
        previousRoom !== roomId
      ) {
        socket.emit(
          "leave_room",
          String(previousRoom)
        );
      }

      if (roomId) {
        socket.emit(
          "join_room",
          String(roomId)
        );
      }

      previousRoomRef.current =
        roomId;
    }, [roomId, isConnected]);

    const value: ChatSocketContextValue =
      {
        socket:
          socketRef.current,
        isConnected,
        latestMessage,
        socketError,
        sendMessage: (
          payload
        ) => {
          socketRef.current?.emit(
            "send_message",
            {
              roomId: String(
                payload.roomId
              ),
              content:
                payload.content,
              file: payload.file,
            }
          );
        },
      };

    return (
      <ChatSocketContext.Provider
        value={value}
      >
        {children}
      </ChatSocketContext.Provider>
    );
  };

export const useChatSocket =
  () => {
    const context =
      useContext(
        ChatSocketContext
      );

    if (!context) {
      throw new Error(
        "useChatSocket must be used within ChatSocketProvider"
      );
    }

    return context;
  };
