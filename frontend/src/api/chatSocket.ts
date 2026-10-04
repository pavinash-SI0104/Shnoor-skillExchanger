
import { io, type Socket } from "socket.io-client";
import { auth } from "../config/firebase";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5000";

let socket: Socket | null = null;
let refreshInProgress = false;

export async function connectChatSocket(): Promise<Socket> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not authenticated");
  }

  // Reuse an already-connected socket.
  if (socket?.connected) {
    return socket;
  }

  // Get a fresh Firebase ID token.
  const token = await user.getIdToken(true);

  // Reuse an existing disconnected socket.
  if (socket) {
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  // Create the socket only once.
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  // Refresh token when the server rejects a connection.
  socket.on("connect_error", async (error) => {
    console.error("Socket connection error:", error.message);

    if (refreshInProgress) return;

    refreshInProgress = true;

    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        socket?.disconnect();
        return;
      }

      const freshToken = await currentUser.getIdToken(true);

      if (socket) {
        socket.auth = { token: freshToken };

        // Retry using the refreshed token.
        socket.connect();
      }
    } catch (refreshError) {
      console.error("Failed to refresh Firebase token:", refreshError);
    } finally {
      refreshInProgress = false;
    }
  });

  return socket;
}

export function getChatSocket(): Socket | null {
  return socket;
}

export function disconnectChatSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  refreshInProgress = false;
}