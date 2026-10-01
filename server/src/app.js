const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");

const { db } = require("./config/firebase");
const authenticateUser = require("./middleware/auth");

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

// ==============================
// HEALTH CHECK
// ==============================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Skill Exchanger API is running",
  });
});

// ==============================
// FIREBASE HEALTH CHECK
// ==============================

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

// ==============================
// AUTH - CURRENT USER
// ==============================

app.get("/api/auth/me", authenticateUser, (req, res) => {
  res.json({
    success: true,
    message: "User authenticated successfully",
    user: req.user,
  });
});

// ==============================
// CREATE USER PROFILE
// ==============================

app.post("/api/users/profile", authenticateUser, async (req, res) => {
  try {
    const { name, email } = req.body;

    const uid = req.user.uid;

    const userRef = db.collection("users").doc(uid);

    const existingUser = await userRef.get();

    if (existingUser.exists) {
      return res.status(200).json({
        success: true,
        message: "User profile already exists",
        user: existingUser.data(),
      });
    }

    const userProfile = {
      uid,
      name: name || req.user.name || "",
      email: email || req.user.email || "",
      photoURL: req.user.picture || "",

      bio: "",

      interests: [],
      expertiseLevel: "",

      skillsToTeach: [],
      skillsToLearn: [],

      availability: [],

      location: {
        type: "online",
        city: "",
      },

      isActive: true,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await userRef.set(userProfile);

    res.status(201).json({
      success: true,
      message: "User profile created successfully",
      user: userProfile,
    });
  } catch (error) {
    console.error("Create profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create user profile",
    });
  }
});

// ==============================
// GET USER PROFILE
// ==============================

app.get("/api/users/profile", authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;

    const userRef = db.collection("users").doc(uid);

    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    res.json({
      success: true,
      user: userDoc.data(),
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
});

// ==============================
// GET USER SKILLS
// ==============================

app.get("/api/users/skills", authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;

    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    const user = userDoc.data();

    res.json({
      success: true,
      skillsToTeach: user.skillsToTeach || [],
      skillsToLearn: user.skillsToLearn || [],
    });
  } catch (error) {
    console.error("Get skills error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch skills",
    });
  }
});

// ==============================
// ADD USER SKILL
// ==============================

app.post("/api/users/skills", authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;

    const { name, type, level } = req.body;

    if (!name || !type || !level) {
      return res.status(400).json({
        success: false,
        message: "Skill name, type and level are required",
      });
    }

    if (!["teach", "learn"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill type",
      });
    }

    const skill = {
      id: crypto.randomUUID(),
      name: name.trim(),
      level,
    };

    const field =
      type === "teach"
        ? "skillsToTeach"
        : "skillsToLearn";

    const userRef = db.collection("users").doc(uid);

    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    const user = userDoc.data();

    const existingSkills = user[field] || [];

    const duplicate = existingSkills.some(
      (existingSkill) =>
        existingSkill.name.toLowerCase() ===
        name.trim().toLowerCase()
    );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "This skill already exists",
      });
    }

    await userRef.update({
      [field]: [...existingSkills, skill],
      updatedAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: "Skill added successfully",
      skill,
    });
  } catch (error) {
    console.error("Add skill error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add skill",
    });
  }
});

// ==============================
// DELETE USER SKILL
// ==============================

app.delete(
  "/api/users/skills/:skillId",
  authenticateUser,
  async (req, res) => {
    try {
      const uid = req.user.uid;
      const { skillId } = req.params;

      const userRef = db.collection("users").doc(uid);

      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: "User profile not found",
        });
      }

      const user = userDoc.data();

      const teachSkills = user.skillsToTeach || [];
      const learnSkills = user.skillsToLearn || [];

      const updatedTeachSkills = teachSkills.filter(
        (skill) => skill.id !== skillId
      );

      const updatedLearnSkills = learnSkills.filter(
        (skill) => skill.id !== skillId
      );

      if (
        updatedTeachSkills.length === teachSkills.length &&
        updatedLearnSkills.length === learnSkills.length
      ) {
        return res.status(404).json({
          success: false,
          message: "Skill not found",
        });
      }

      await userRef.update({
        skillsToTeach: updatedTeachSkills,
        skillsToLearn: updatedLearnSkills,
        updatedAt: new Date().toISOString(),
      });

      res.json({
        success: true,
        message: "Skill deleted successfully",
      });
    } catch (error) {
      console.error("Delete skill error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to delete skill",
      });
    }
  }
);

module.exports = app;