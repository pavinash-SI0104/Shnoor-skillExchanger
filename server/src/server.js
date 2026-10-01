require("dotenv").config();

const http = require("http");
const app = require("./app");
const { db } = require("./config/firebase");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const startServer = async () => {
  try {
    // Test Firebase connection
    await db.collection("_health").doc("startup").set({
      status: "connected",
      checkedAt: new Date().toISOString(),
    });

    console.log("Firebase connected successfully");

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Firebase connection failed:", error.message);
    process.exit(1);
  }
};

startServer();