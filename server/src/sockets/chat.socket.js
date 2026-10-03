const { Server } = require("socket.io");
const { auth, db } = require("../config/firebase");

const onlineUsers = new Map();

function setupChatSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authenticate every socket connection using Firebase ID token
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const decodedToken = await auth.verifyIdToken(token);

      socket.user = decodedToken;

      next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);
      next(new Error("Invalid or expired authentication token"));
    }
  });

  io.on("connection", (socket) => {
    const uid = socket.user.uid;

    console.log(`Chat socket connected: ${uid}`);

    // Track online users
    const currentConnections = onlineUsers.get(uid) || 0;
    onlineUsers.set(uid, currentConnections + 1);

    // Personal room
    socket.join(`user:${uid}`);

    // Tell clients that this user is online
    io.emit("userOnline", {
      uid,
    });

    // Join conversation
    socket.on("joinConversation", async ({ conversationId }) => {
      try {
        if (!conversationId) {
          socket.emit("chatError", {
            message: "Conversation ID is required",
          });
          return;
        }

        const conversationRef = db
          .collection("conversations")
          .doc(conversationId);

        const conversationSnapshot = await conversationRef.get();

        if (!conversationSnapshot.exists) {
          socket.emit("chatError", {
            message: "Conversation not found",
          });
          return;
        }

        const conversation = conversationSnapshot.data();

        if (!conversation.requestId) {
          socket.emit("chatError", {
            message: "This conversation is not authorized for chat",
          });
          return;
        }

        if (!conversation.participants?.includes(uid)) {
          socket.emit("chatError", {
            message: "You are not authorized to access this conversation",
          });
          return;
        }

        socket.join(`conversation:${conversationId}`);

        socket.emit("conversationJoined", {
          conversationId,
        });
      } catch (error) {
        console.error("Join conversation error:", error);

        socket.emit("chatError", {
          message: "Unable to join conversation",
        });
      }
    });

    // Send message
    socket.on("sendMessage", async ({ conversationId, text }) => {
      try {
        if (!conversationId || !text?.trim()) {
          socket.emit("chatError", {
            message: "Conversation ID and message are required",
          });
          return;
        }

        const cleanText = text.trim();

        if (cleanText.length > 2000) {
          socket.emit("chatError", {
            message: "Message cannot exceed 2000 characters",
          });
          return;
        }

        const conversationRef = db
          .collection("conversations")
          .doc(conversationId);

        const conversationSnapshot = await conversationRef.get();

        if (!conversationSnapshot.exists) {
          socket.emit("chatError", {
            message: "Conversation not found",
          });
          return;
        }

        const conversation = conversationSnapshot.data();

        if (!conversation.requestId) {
          socket.emit("chatError", {
            message: "This conversation is not authorized for chat",
          });
          return;
        }

        if (!conversation.participants?.includes(uid)) {
          socket.emit("chatError", {
            message: "You are not authorized to send messages here",
          });
          return;
        }

        const receiverId = conversation.participants.find(
          (participantId) => participantId !== uid
        );

        if (!receiverId) {
          socket.emit("chatError", {
            message: "Conversation participant not found",
          });
          return;
        }

        const now = new Date().toISOString();

        const messageRef = db.collection("messages").doc();

        const message = {
          id: messageRef.id,
          conversationId,
          senderId: uid,
          receiverId,
          text: cleanText,
          createdAt: now,
        };

        await messageRef.set(message);

        const currentUnreadCounts = conversation.unreadCounts || {};

        const receiverUnreadCount =
          Number(currentUnreadCounts[receiverId] || 0) + 1;

        await conversationRef.update({
          lastMessage: cleanText,
          updatedAt: now,
          [`unreadCounts.${receiverId}`]: receiverUnreadCount,
          [`unreadCounts.${uid}`]: 0,
        });

        // Send message to users currently inside the conversation
        io.to(`conversation:${conversationId}`).emit(
          "newMessage",
          message
        );

        // Notify receiver
        io.to(`user:${receiverId}`).emit("conversationUpdated", {
          conversationId,
          lastMessage: cleanText,
          updatedAt: now,
          unreadCount: receiverUnreadCount,
        });
      } catch (error) {
        console.error("Send message error:", error);

        socket.emit("chatError", {
          message: "Unable to send message",
        });
      }
    });

    socket.on("disconnect", () => {
      const connections = onlineUsers.get(uid) || 1;

      if (connections <= 1) {
        onlineUsers.delete(uid);

        io.emit("userOffline", {
          uid,
        });
      } else {
        onlineUsers.set(uid, connections - 1);
      }

      console.log(`Chat socket disconnected: ${uid}`);
    });
  });

  return io;
}

module.exports = setupChatSocket;