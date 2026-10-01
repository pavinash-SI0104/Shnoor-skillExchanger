const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { db } = require("./config/firebase");

const app = express();

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use("/api", limiter);

// Basic health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Skill Exchanger API is running",
  });
});

// Firebase health check
app.get("/api/health/firebase", async (req, res) => {
  try {
    await db.collection("_health").doc("test").set({
      status: "connected",
      checkedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "Firebase connected successfully",
    });
  } catch (error) {
    console.error("Firebase error:", error);

    res.status(500).json({
      success: false,
      message: "Firebase connection failed",
      error: error.message,
    });
  }
});

module.exports = app;