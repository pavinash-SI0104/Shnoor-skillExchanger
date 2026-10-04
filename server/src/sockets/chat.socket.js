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

    // Track online connections per user
    const currentConnections = onlineUsers.get(uid) || 0;
    onlineUsers.set(uid, currentConnections + 1);

    // Join the user's private room
    socket.join(`user:${uid}`);

    // Broadcast presence to connected clients
    io.emit("userOnline", { uid });

    // Send current online users to this newly connected client
    socket.emit("onlineUsers", {
      uids: Array.from(onlineUsers.keys()),
    });

    // ---------------------------------------------------------
    // Verify that a conversation belongs to an accepted request
    // ---------------------------------------------------------
    const verifyConversationAccess = async (conversationId) => {
      const conversationRef = db
        .collection("conversations")
        .doc(conversationId);

      const conversationSnapshot = await conversationRef.get();

      if (!conversationSnapshot.exists) {
        return {
          allowed: false,
          message: "Conversation not found",
        };
      }

      const conversation = conversationSnapshot.data();

      if (!conversation.requestId) {
        return {
          allowed: false,
          message: "This conversation is not authorized for chat",
        };
      }

      if (!conversation.participants?.includes(uid)) {
        return {
          allowed: false,
          message: "You are not authorized to access this conversation",
        };
      }

      // Verify the exchange request
      const requestRef = db
        .collection("exchangeRequests")
        .doc(conversation.requestId);

      const requestSnapshot = await requestRef.get();

      if (!requestSnapshot.exists) {
        return {
          allowed: false,
          message: "Exchange request not found",
        };
      }

      const request = requestSnapshot.data();

      if (request.status !== "accepted") {
        return {
          allowed: false,
          message: "Chat is available only for accepted requests",
        };
      }

      return {
        allowed: true,
        conversation,
      };
    };

    // ---------------------------------------------------------
    // Join conversation
    // ---------------------------------------------------------
    socket.on("joinConversation", async ({ conversationId } = {}) => {
      try {
        if (!conversationId) {
          socket.emit("chatError", {
            message: "Conversation ID is required",
          });
          return;
        }

        const access = await verifyConversationAccess(conversationId);

        if (!access.allowed) {
          socket.emit("chatError", {
            message: access.message,
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

    // ---------------------------------------------------------
    // Send message
    // ---------------------------------------------------------
    socket.on(
      "sendMessage",
      async ({ conversationId, text } = {}, callback) => {
        const respond = (result) => {
          if (typeof callback === "function") {
            callback(result);
          }
        };

        try {
          if (
            !conversationId ||
            typeof text !== "string" ||
            !text.trim()
          ) {
            respond({
              success: false,
              message: "Conversation ID and message are required",
            });
            return;
          }

          const cleanText = text.trim();

          if (cleanText.length > 2000) {
            respond({
              success: false,
              message: "Message cannot exceed 2000 characters",
            });
            return;
          }

          // Verify conversation + participant + accepted request
          const access = await verifyConversationAccess(conversationId);

          if (!access.allowed) {
            respond({
              success: false,
              message: access.message,
            });
            return;
          }

          const conversation = access.conversation;

          const receiverId = conversation.participants.find(
            (participantId) => participantId !== uid
          );

          if (!receiverId) {
            respond({
              success: false,
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

          const currentUnreadCounts =
            conversation.unreadCounts || {};

          const receiverUnreadCount =
            Number(currentUnreadCounts[receiverId] || 0) + 1;

          // Save message and update conversation together
          const batch = db.batch();

          batch.set(messageRef, message);

          batch.update(
            db.collection("conversations").doc(conversationId),
            {
              lastMessage: cleanText,
              updatedAt: now,
              [`unreadCounts.${receiverId}`]:
                receiverUnreadCount,
              [`unreadCounts.${uid}`]: 0,
            }
          );

          await batch.commit();

          // Broadcast to clients currently in the conversation room
          io.to(`conversation:${conversationId}`).emit(
            "newMessage",
            message
          );

          // Notify receiver's private room
          io.to(`user:${receiverId}`).emit(
            "conversationUpdated",
            {
              conversationId,
              lastMessage: cleanText,
              updatedAt: now,
              unreadCount: receiverUnreadCount,
            }
          );

          // Confirm successful Firestore save
          respond({
            success: true,
            messageId: messageRef.id,
          });
        } catch (error) {
          console.error("Send message error:", error);

          respond({
            success: false,
            message: "Unable to send message",
          });
        }
      }
    );

    // ---------------------------------------------------------
    // Disconnect
    // ---------------------------------------------------------
    socket.on("disconnect", () => {
      const connections = onlineUsers.get(uid) || 1;

      if (connections <= 1) {
        onlineUsers.delete(uid);

        io.emit("userOffline", { uid });
      } else {
        onlineUsers.set(uid, connections - 1);
      }

      console.log(`Chat socket disconnected: ${uid}`);
    });
  });

  return io;
}

module.exports = setupChatSocket;