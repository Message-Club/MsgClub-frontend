import {
  io,
  type Socket,
} from "socket.io-client";
import {
  getAccessToken,
  refreshAccessToken,
} from "./auth";

export type ChatSocket =
  Socket;

const SOCKET_URL =
  import.meta.env
    .VITE_SOCKET_URL || 
    "http://localhost:3000";
  // "https://626d-150-129-146-122.ngrok-free.app";

export function createChatSocket() {
  const socket = io(
    SOCKET_URL,
    {
      autoConnect: false,

      // avoids polling CORS issues
      transports: ["websocket"],

      withCredentials: true,

      // NGROK FIX
      transportOptions: {
        polling: {
          extraHeaders: {
            "ngrok-skip-browser-warning":
              "true",
          },
        },
      },

      auth: async (
        callback
      ) => {
        let token =
          getAccessToken();

        if (!token) {
          try {
            token =
              await refreshAccessToken();
          } catch {
            token = null;
          }
        }

        callback({
          token,
        });
      },
    }
  );

  return socket;
}

export default createChatSocket;
