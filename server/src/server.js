const http = require("http");
const app = require("./app");
const { db } = require("./config/firebase");
const setupChatSocket = require("./sockets/chat.socket");

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

// Initialize Socket.IO
setupChatSocket(httpServer);

async function startServer() {
  try {
    // Verify Firebase connection
    await db.collection("_health").doc("startup").set({
      status: "ok",
      timestamp: new Date().toISOString(),
    });

    console.log("Firebase connected successfully");

    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();