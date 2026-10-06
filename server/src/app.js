const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");
const multer = require("multer");
const { generateAIMatches } = require("./services/aiMatching");
const { extractResumeText, extractSkillsFromResume } = require("./services/resumeExtraction");
const { db } = require("./config/firebase");
const authenticateUser = require("./middleware/auth");
const adminRoutes = require("./Routes/adminRoutes");
const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
  const fileName = file.originalname.toLowerCase();

  const isPdf =
    file.mimetype === "application/pdf" ||
    fileName.endsWith(".pdf");

  const isDocx =
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".docx");

  if (!isPdf && !isDocx) {
    return cb(
      new Error("Only PDF and DOCX resumes are supported.")
    );
  }

  cb(null, true);
},

});
// ==============================
// SECURITY
// ==============================

app.use(helmet());

// ==============================
// CORS
// ==============================

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// ==============================
// BODY PARSING
// ==============================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================
// COOKIES
// ==============================

app.use(cookieParser());

// ==============================
// RATE LIMITING
// ==============================

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
    const {
      name,
      email,
      location,
      bio,
      photoURL,
    } = req.body;

    const uid = req.user.uid;

    const userRef = db.collection("users").doc(uid);
    const existingUser = await userRef.get();

    /*
     * =========================
     * EXISTING USER
     * =========================
     */

    if (existingUser.exists) {
      const existingData = existingUser.data() || {};

      const updatedData = {
        name:
          name !== undefined
            ? name
            : existingData.name || "",

        email:
          email !== undefined
            ? email
            : existingData.email ||
              req.user.email ||
              "",

        role: existingData.role || "user",

        location:
          location !== undefined
            ? (
                typeof location === "string"
                  ? {
                      type: "online",
                      city: location,
                    }
                  : location
              )
            : existingData.location || {
                type: "online",
                city: "",
              },

        bio:
          bio !== undefined
            ? bio
            : existingData.bio || "",

        /*
         * IMPORTANT:
         * Save the profile picture URL against
         * this user's Firebase UID.
         */
        photoURL:
          photoURL !== undefined
            ? photoURL
            : existingData.photoURL ||
              req.user.picture ||
              "",

        updatedAt: new Date().toISOString(),
      };

      /*
       * Preserve existing resumeProcessed value.
       */

      if (
        existingData.resumeProcessed ===
        undefined
      ) {
        updatedData.resumeProcessed = false;
      }

      await userRef.update(updatedData);

      const updatedUser = {
        ...existingData,
        ...updatedData,
      };

      return res.status(200).json({
        success: true,
        message: "User profile updated successfully",
        user: updatedUser,
      });
    }

    /*
     * =========================
     * NEW USER
     * =========================
     */

    const now = new Date().toISOString();

    const userProfile = {
      uid,

      name:
        name ||
        req.user.name ||
        "",

      email:
        email ||
        req.user.email ||
        "",

      role: "user",

      photoURL:
        photoURL ||
        req.user.picture ||
        "",

      bio:
        bio || "",

      interests: [],

      expertiseLevel: "",

      skillsToTeach: [],

      skillsToLearn: [],

      resumeProcessed: false,

      availability: [],

      location:
        typeof location === "string"
          ? {
              type: "online",
              city: location,
            }
          : location || {
              type: "online",
              city: "",
            },

      isActive: true,

      createdAt: now,

      updatedAt: now,
    };

    await userRef.set(userProfile);

    return res.status(201).json({
      success: true,
      message:
        "User profile created successfully",
      user: userProfile,
    });
  } catch (error) {
    console.error(
      "Profile save error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to save user profile",
    });
  }
});



// ==============================
// GET CURRENT USER PROFILE
// ==============================

app.get("/api/users/profile", authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;

    const userDoc = await db.collection("users").doc(uid).get();

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
// GET CURRENT USER SKILLS
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
// UPLOAD AND PROCESS RESUME
// ==============================

app.post(
  "/api/users/resume",
  authenticateUser,
  upload.single("resume"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload a resume.",
        });
      }

      const uid = req.user.uid;

      const userRef = db.collection("users").doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: "User profile not found",
        });
      }

      // Extract text from PDF/DOCX
      const resumeText = await extractResumeText(req.file);

      // Extract skills using Gemini
      const extractedSkills =
        await extractSkillsFromResume(resumeText);

      const user = userDoc.data();
      const existingSkills = user.skillsToTeach || [];

      const newSkills = [];

      for (const extractedSkill of extractedSkills) {
        const skillName = extractedSkill.name?.trim();

        if (!skillName) {
          continue;
        }

        const duplicate = existingSkills.some(
          (existingSkill) =>
            existingSkill.name?.toLowerCase() ===
            skillName.toLowerCase()
        );

        const alreadyAdded = newSkills.some(
          (skill) =>
            skill.name?.toLowerCase() ===
            skillName.toLowerCase()
        );

        if (duplicate || alreadyAdded) {
          continue;
        }

        newSkills.push({
          id: crypto.randomUUID(),
          name: skillName,
          level: extractedSkill.level || "Intermediate",
        });
      }

      const updatedSkills = [
        ...existingSkills,
        ...newSkills,
      ];

      await userRef.update({
        skillsToTeach: updatedSkills,
        resumeProcessed: true,
        updatedAt: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: "Resume processed successfully",
        skills: newSkills,
        skillsToTeach: updatedSkills,
      });
    } catch (error) {
      console.error("Resume processing error:", error);

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to process resume",
      });
    }
  }
);

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

    const trimmedName = name.trim();

    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        message: "Skill name cannot be empty",
      });
    }

    const skill = {
      id: crypto.randomUUID(),
      name: trimmedName,
      level,
    };

    const field = type === "teach" ? "skillsToTeach" : "skillsToLearn";

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
        existingSkill.name?.toLowerCase() === trimmedName.toLowerCase()
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

// ==============================
// DISCOVER USERS
// ==============================

app.get(
  "/api/users/discover",
  authenticateUser,
  async (req, res) => {
    try {
      const currentUid = req.user.uid;

      const snapshot = await db
        .collection("users")
        .get();

      const users = snapshot.docs
        .map((doc) => {
          const user = doc.data();

          return {
            uid: doc.id,
            name: user.name || "",
            role: user.role || "",
            bio: user.bio || "",
            photoURL: user.photoURL || "",
            location: user.location || {
              type: "online",
              city: "",
            },
            expertiseLevel:
              user.expertiseLevel || "",
            skillsToTeach:
              user.skillsToTeach || [],
            skillsToLearn:
              user.skillsToLearn || [],
          };
        })
        .filter(
          (user) =>
            user.uid !== currentUid &&
            user.role !== "admin"
        )
        .filter((user) => {
          return user.role !== "admin";
        })
        .filter((user) => {
          const originalUser = snapshot.docs
            .find(
              (doc) =>
                doc.id === user.uid
            )
            ?.data();

          return (
            originalUser?.isActive !== false
          );
        });

      return res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      console.error(
        "Discover users error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch users",
      });
    }
  }
);

// ==============================
// GET PUBLIC USER PROFILE
// ==============================

app.get("/api/users/profile/:uid", authenticateUser, async (req, res) => {
  try {
    const { uid } = req.params;

    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    const user = userDoc.data();

    if (user.isActive === false) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        uid: userDoc.id,
        name: user.name || "",
        role: user.role || "",
        bio: user.bio || "",
        photoURL: user.photoURL || "",
        location: user.location || {
          type: "online",
          city: "",
        },
        expertiseLevel: user.expertiseLevel || "",
        interests: user.interests || [],
      },
    });
  } catch (error) {
    console.error("Get public profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
});

// ==============================
// GET PUBLIC USER SKILLS
// ==============================

app.get("/api/users/skills/:uid", authenticateUser, async (req, res) => {
  try {
    const { uid } = req.params;

    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    const user = userDoc.data();

    if (user.isActive === false) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    res.status(200).json({
      success: true,
      skillsToTeach: user.skillsToTeach || [],
      skillsToLearn: user.skillsToLearn || [],
    });
  } catch (error) {
    console.error("Get user skills error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user skills",
    });
  }
});

// ==============================
// SEND EXCHANGE REQUEST
// ==============================

app.post("/api/users/requests", authenticateUser, async (req, res) => {
  try {
    const senderId = req.user.uid;
    const { receiverId, skillId } = req.body;

    if (!receiverId || !skillId) {
      return res.status(400).json({
        success: false,
        message: "Receiver and skill are required",
      });
    }

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a request to yourself",
      });
    }

    const senderDoc = await db.collection("users").doc(senderId).get();
    const receiverDoc = await db.collection("users").doc(receiverId).get();

    if (!senderDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Your user profile was not found",
      });
    }

    if (!receiverDoc.exists || receiverDoc.data().isActive === false) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    const sender = senderDoc.data();
    const receiver = receiverDoc.data();

    const receiverSkills = receiver.skillsToTeach || [];

    const selectedSkill = receiverSkills.find(
      (skill) => skill.id === skillId
    );

    if (!selectedSkill) {
      return res.status(400).json({
        success: false,
        message: "The selected skill is not available from this user",
      });
    }

    const existingRequests = await db
      .collection("exchangeRequests")
      .where("senderId", "==", senderId)
      .where("receiverId", "==", receiverId)
      .get();

    const duplicatePendingRequest = existingRequests.docs.some((doc) => {
      const request = doc.data();

      return request.skillId === skillId && request.status === "pending";
    });

    if (duplicatePendingRequest) {
      return res.status(409).json({
        success: false,
        message: "A pending request for this skill already exists",
      });
    }

    const requestId = crypto.randomUUID();
    const now = new Date().toISOString();

    const request = {
      id: requestId,

      senderId,
      receiverId,

      senderName: sender.name || "",
      senderRole: sender.role || "",

      receiverName: receiver.name || "",
      receiverRole: receiver.role || "",

      skillId,
      skillName: selectedSkill.name,
      skillLevel: selectedSkill.level || "",

      status: "pending",

      createdAt: now,
      updatedAt: now,
    };

    await db.collection("exchangeRequests").doc(requestId).set(request);

    // Create notification for the receiver
    await db.collection("notifications").add({
      userId: receiverId,
      type: "request",
      title: "New Skill Exchange Request",
      message: `${sender.name || "Someone"} sent you a skill exchange request.`,
      relatedId: requestId,
      read: false,
      createdAt: now,
    });

    res.status(201).json({
      success: true,
      message: "Exchange request sent successfully",
      request,
    });
  } catch (error) {
    console.error("Send exchange request error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send exchange request",
    });
  }
});

// ==============================
// GET EXCHANGE REQUESTS
// ==============================

app.get("/api/users/requests", authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;

    const snapshot = await db
      .collection("exchangeRequests")
      .get();

    const sent = [];
    const received = [];

    snapshot.docs.forEach((doc) => {
      const request = doc.data();

      if (request.senderId === uid) {
        sent.push(request);
      }

      if (request.receiverId === uid) {
        received.push(request);
      }
    });

    sent.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    received.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    res.status(200).json({
      success: true,
      sent,
      received,
    });
  } catch (error) {
    console.error("Get exchange requests error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch exchange requests",
    });
  }
});

// ==============================
// UPDATE EXCHANGE REQUEST
// ==============================

app.patch(
  "/api/users/requests/:requestId",
  authenticateUser,
  async (req, res) => {
    try {
      const { requestId } = req.params;
      const { status } = req.body;
      const uid = req.user.uid;

      if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid request status",
        });
      }

      const requestRef = db
        .collection("exchangeRequests")
        .doc(requestId);

      const requestSnapshot = await requestRef.get();

      if (!requestSnapshot.exists) {
        return res.status(404).json({
          success: false,
          message: "Exchange request not found",
        });
      }

      const request = requestSnapshot.data();

      // Only the receiver can accept or reject the request
      if (request.receiverId !== uid) {
        return res.status(403).json({
          success: false,
          message: "Only the receiver can update this request",
        });
      }

      // Request must still be pending
      if (request.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "This request has already been processed",
        });
      }

      const now = new Date().toISOString();

      await requestRef.update({
        status,
        updatedAt: now,
      });

      // Create chat conversation automatically after acceptance
      let conversation = null;

      if (status === "accepted") {
        const participantIds = [
          request.senderId,
          request.receiverId,
        ].sort();

        const conversationId = participantIds.join("_");

        const conversationRef = db
          .collection("conversations")
          .doc(conversationId);

        const conversationSnapshot = await conversationRef.get();

        if (conversationSnapshot.exists) {
          conversation = conversationSnapshot.data();
        } else {
          conversation = {
            id: conversationId,
            requestId: request.id,

            participants: participantIds,

            participantNames: {
              [request.senderId]: request.senderName,
              [request.receiverId]: request.receiverName,
            },

            skillId: request.skillId,
            skillName: request.skillName,

            lastMessage: "",

            unreadCounts: {
              [request.senderId]: 0,
              [request.receiverId]: 0,
            },

            createdAt: now,
            updatedAt: now,
          };

          await conversationRef.set(conversation);
        }
      }

      return res.status(200).json({
        success: true,
        message:
          status === "accepted"
            ? "Request accepted and conversation created"
            : "Request rejected",
        request: {
          ...request,
          status,
          updatedAt: now,
        },
        conversation,
      });
    } catch (error) {
      console.error("Update request error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update request",
      });
    }
  }
);

// Create or get an authorized chat conversation
app.post("/api/users/conversations", authenticateUser, async (req, res) => {
  try {
    const { requestId } = req.body;
    const uid = req.user.uid;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: "Request ID is required",
      });
    }

    const requestRef = db.collection("exchangeRequests").doc(requestId);
    const requestSnapshot = await requestRef.get();

    if (!requestSnapshot.exists) {
      return res.status(404).json({
        success: false,
        message: "Exchange request not found",
      });
    }

    const request = requestSnapshot.data();

    // Chat is allowed only for accepted requests
    if (request.status !== "accepted") {
      return res.status(403).json({
        success: false,
        message: "Chat is available only after the request is accepted",
      });
    }

    // Only the sender or receiver can create/access the conversation
    if (request.senderId !== uid && request.receiverId !== uid) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this conversation",
      });
    }

    const participantIds = [request.senderId, request.receiverId].sort();

    // Deterministic ID prevents duplicate conversations
    const conversationId = participantIds.join("_");

    const conversationRef = db
      .collection("conversations")
      .doc(conversationId);

    const existingConversation = await conversationRef.get();

    if (existingConversation.exists) {
      return res.status(200).json({
        success: true,
        conversation: existingConversation.data(),
      });
    }

    const now = new Date().toISOString();

    const conversation = {
      id: conversationId,
      requestId: request.id,

      participants: participantIds,

      participantNames: {
        [request.senderId]: request.senderName,
        [request.receiverId]: request.receiverName,
      },

      skillId: request.skillId,
      skillName: request.skillName,

      lastMessage: "",
      unreadCounts: {
        [request.senderId]: 0,
        [request.receiverId]: 0,
      },
      updatedAt: now,
      createdAt: now,
    };

    await conversationRef.set(conversation);

    return res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Create conversation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create conversation",
    });
  }
});

// Get conversations for the current user
app.get("/api/users/conversations", authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;

    const snapshot = await db
      .collection("conversations")
      .where("participants", "array-contains", uid)
      .get();

    const conversations = snapshot.docs
      .map((doc) => doc.data())
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime()
      );

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
});

// Get messages for an authorized conversation
app.get(
  "/api/users/conversations/:conversationId/messages",
  authenticateUser,
  async (req, res) => {
    try {
      const { conversationId } = req.params;
      const uid = req.user.uid;

      const conversationRef = db
        .collection("conversations")
        .doc(conversationId);

      const conversationSnapshot = await conversationRef.get();

      if (!conversationSnapshot.exists) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }

      const conversation = conversationSnapshot.data();

      if (!conversation.participants?.includes(uid)) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to access these messages",
        });
      }

      const messagesSnapshot = await db
        .collection("messages")
        .where("conversationId", "==", conversationId)
        .get();

      const messages = messagesSnapshot.docs
        .map((doc) => doc.data())
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
        );

      return res.status(200).json({
        success: true,
        messages,
      });
    } catch (error) {
      console.error("Get conversation messages error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch messages",
      });
    }
  }
);

// ==============================
// CREATE SESSION
// ==============================

app.post("/api/users/sessions", authenticateUser, async (req, res) => {
  try {
    const currentUid = req.user.uid;

    const {
      requestId,
      type,
      meetingLink,
      location,
      scheduledAt,
      duration,
    } = req.body;

    if (!requestId || !type || !scheduledAt || !duration) {
      return res.status(400).json({
        success: false,
        message:
          "Request, session type, scheduled time and duration are required",
      });
    }

    if (!["online", "offline"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Session type must be online or offline",
      });
    }

    if (type === "online" && !meetingLink?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Meeting link is required for online sessions",
      });
    }

    if (type === "offline" && !location?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Location is required for offline sessions",
      });
    }

    const sessionDuration = Number(duration);

    if (
      !Number.isInteger(sessionDuration) ||
      sessionDuration < 15 ||
      sessionDuration > 240
    ) {
      return res.status(400).json({
        success: false,
        message: "Duration must be between 15 and 240 minutes",
      });
    }

    const scheduledDate = new Date(scheduledAt);

    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheduled date and time",
      });
    }

    if (scheduledDate.getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Session must be scheduled for a future time",
      });
    }

    // Get the exchange request
    const requestRef = db
      .collection("exchangeRequests")
      .doc(requestId);

    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Exchange request not found",
      });
    }

    const request = requestDoc.data();

    // Session can only be created for accepted requests
    if (request.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "A session can only be created for an accepted request",
      });
    }

    // Only participants can create a session
    if (
      request.senderId !== currentUid &&
      request.receiverId !== currentUid
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this exchange request",
      });
    }

    /*
     * The receiver is the teacher because the request
     * was sent for one of the receiver's teaching skills.
     */
    const teacherId = request.receiverId;
    const learnerId = request.senderId;

    // Prevent multiple scheduled sessions for the same request
    const existingSessions = await db
      .collection("sessions")
      .where("requestId", "==", requestId)
      .get();

    const hasScheduledSession = existingSessions.docs.some(
      (doc) => doc.data().status === "scheduled"
    );

    if (hasScheduledSession) {
      return res.status(409).json({
        success: false,
        message: "A scheduled session already exists for this request",
      });
    }

    const teacherDoc = await db
      .collection("users")
      .doc(teacherId)
      .get();

    const learnerDoc = await db
      .collection("users")
      .doc(learnerId)
      .get();

    if (!teacherDoc.exists || !learnerDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Session participant profile not found",
      });
    }

    const teacher = teacherDoc.data();
    const learner = learnerDoc.data();

    const sessionId = crypto.randomUUID();
    const now = new Date().toISOString();

    const session = {
      id: sessionId,

      requestId,

      teacherId,
      learnerId,

      teacherName: teacher.name || request.receiverName || "",
      learnerName: learner.name || request.senderName || "",

      skillId: request.skillId,
      skillName: request.skillName,

      type,

      meetingLink:
        type === "online" ? meetingLink.trim() : "",

      location:
        type === "offline" ? location.trim() : "",

      scheduledAt: scheduledDate.toISOString(),

      duration: sessionDuration,

      status: "scheduled",

      createdAt: now,
      updatedAt: now,
    };

    await db
      .collection("sessions")
      .doc(sessionId)
      .set(session);

    return res.status(201).json({
      success: true,
      message: "Session created successfully",
      session,
    });
  } catch (error) {
    console.error("Create session error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create session",
    });
  }
});

// ==============================
// GET USER SESSIONS
// ==============================

app.get("/api/users/sessions", authenticateUser, async (req, res) => {
  try {
    const currentUid = req.user.uid;

    const snapshot = await db
      .collection("sessions")
      .get();

    const sessions = snapshot.docs
      .map((doc) => doc.data())
      .filter(
        (session) =>
          session.teacherId === currentUid ||
          session.learnerId === currentUid
      )
      .sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() -
          new Date(a.scheduledAt).getTime()
      );

    return res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error("Get sessions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sessions",
    });
  }
});

// ==============================
// UPDATE SESSION STATUS
// ==============================

app.patch(
  "/api/users/sessions/:sessionId",
  authenticateUser,
  async (req, res) => {
    try {
      const currentUid = req.user.uid;
      const { sessionId } = req.params;
      const { status } = req.body;

      if (!["completed", "cancelled"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid session status",
        });
      }

      const sessionRef = db
        .collection("sessions")
        .doc(sessionId);

      const sessionDoc = await sessionRef.get();

      if (!sessionDoc.exists) {
        return res.status(404).json({
          success: false,
          message: "Session not found",
        });
      }

      const session = sessionDoc.data();

      // Only participants can update a session
      if (
        session.teacherId !== currentUid &&
        session.learnerId !== currentUid
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this session",
        });
      }

      if (session.status !== "scheduled") {
        return res.status(400).json({
          success: false,
          message: "This session has already been processed",
        });
      }

      await sessionRef.update({
        status,
        updatedAt: new Date().toISOString(),
      });

      const statusMessage =
        status === "completed"
          ? "Session marked as completed"
          : "Session cancelled successfully";

      return res.status(200).json({
        success: true,
        message: statusMessage,
      });
    } catch (error) {
      console.error("Update session error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update session",
      });
    }
  }
);

// ==============================
// AI SKILL MATCHES
// ==============================

app.get("/api/users/matches", authenticateUser, async (req, res) => {
  try {
    const currentUid = req.user.uid;

    const currentUserDoc = await db
      .collection("users")
      .doc(currentUid)
      .get();

    if (!currentUserDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    const currentUser = {
      uid: currentUid,
      ...currentUserDoc.data(),
    };

    const myTeachingSkills = currentUser.skillsToTeach || [];
    const myLearningSkills = currentUser.skillsToLearn || [];

    if (
      myTeachingSkills.length === 0 &&
      myLearningSkills.length === 0
    ) {
      return res.json({
        success: true,
        matches: [],
        aiEnabled: false,
        message: "Add skills to discover potential matches",
      });
    }

    const snapshot = await db.collection("users").get();

    const candidates = snapshot.docs
      .map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }))
      .filter((user) => user.uid !== currentUid)
      .filter((user) => user.isActive !== false);

    /*
     * First perform deterministic filtering.
     * This prevents sending every Firestore user to the LLM.
     */
    const myTeachingNames = new Set(
      myTeachingSkills.map((skill) =>
        skill.name.trim().toLowerCase()
      )
    );

    const myLearningNames = new Set(
      myLearningSkills.map((skill) =>
        skill.name.trim().toLowerCase()
      )
    );

    const filteredCandidates = candidates
      .map((candidate) => {
        const candidateTeaching =
          candidate.skillsToTeach || [];

        const candidateLearning =
          candidate.skillsToLearn || [];

        const theyCanTeachMe = candidateTeaching.filter(
          (skill) =>
            myLearningNames.has(
              skill.name.trim().toLowerCase()
            )
        );

        const ICanTeachThem = candidateLearning.filter(
          (skill) =>
            myTeachingNames.has(
              skill.name.trim().toLowerCase()
            )
        );

        return {
          ...candidate,
          theyCanTeachMe,
          ICanTeachThem,
        };
      })
      .filter(
        (candidate) =>
          candidate.theyCanTeachMe.length > 0 ||
          candidate.ICanTeachThem.length > 0
      )
      .slice(0, 20);

    /*
     * No deterministic candidates means there is nothing
     * useful to send to the LLM.
     */
    if (filteredCandidates.length === 0) {
      return res.json({
        success: true,
        matches: [],
        aiEnabled: false,
        message: "No matching skills found yet",
      });
    }

    let aiResult = null;

    try {
      aiResult = await generateAIMatches({
        currentUser,
        candidates: filteredCandidates,
      });
    } catch (aiError) {
      console.error(
        "AI matching failed, using deterministic matching:",
        aiError.message
      );
    }

    /*
     * AI result available.
     */
    if (aiResult) {
      const candidateMap = new Map(
        filteredCandidates.map((candidate) => [
          candidate.uid,
          candidate,
        ])
      );

      const matches = aiResult.matches
        .filter((aiMatch) =>
          candidateMap.has(aiMatch.uid)
        )
        .map((aiMatch) => {
          const candidate = candidateMap.get(aiMatch.uid);

          return {
            uid: candidate.uid,
            name: candidate.name || "",
            role: candidate.role || "",
            photoURL: candidate.photoURL || "",
            expertiseLevel:
              candidate.expertiseLevel || "",

            youCanTeach: candidate.ICanTeachThem.map(
              (skill) => skill.name
            ),

            theyCanTeach: candidate.theyCanTeachMe.map(
              (skill) => skill.name
            ),

            matchPercentage: Math.round(aiMatch.score),

            reason: aiMatch.reason,

            aiGenerated: true,
          };
        })
        .sort(
          (a, b) =>
            b.matchPercentage - a.matchPercentage
        );

      return res.json({
        success: true,
        matches,
        aiEnabled: true,
      });
    }

    /*
     * Deterministic fallback if Gemini is unavailable.
     */
    const possibleMatches =
      myTeachingSkills.length +
      myLearningSkills.length;

    const matches = filteredCandidates
      .map((candidate) => {
        const matchingSkills =
          candidate.theyCanTeachMe.length +
          candidate.ICanTeachThem.length;

        const matchPercentage =
          possibleMatches > 0
            ? Math.round(
                (matchingSkills / possibleMatches) * 100
              )
            : 0;

        return {
          uid: candidate.uid,
          name: candidate.name || "",
          role: candidate.role || "",
          photoURL: candidate.photoURL || "",
          expertiseLevel:
            candidate.expertiseLevel || "",

          youCanTeach: candidate.ICanTeachThem.map(
            (skill) => skill.name
          ),

          theyCanTeach: candidate.theyCanTeachMe.map(
            (skill) => skill.name
          ),

          matchPercentage,

          reason:
            "This user has skills that overlap with your learning or teaching goals.",

          aiGenerated: false,
        };
      })
      .sort(
        (a, b) =>
          b.matchPercentage - a.matchPercentage
      );

    return res.json({
      success: true,
      matches,
      aiEnabled: false,
    });
  } catch (error) {
    console.error("Get matches error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate skill matches",
    });
  }
});

// ==============================
// GET USER CONVERSATIONS
// ==============================

app.get(
  "/api/users/conversations",
  authenticateUser,
  async (req, res) => {
    try {
      const currentUid = req.user.uid;

      const snapshot = await db
        .collection("conversations")
        .get();

      const conversations = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((conversation) =>
          conversation.participants?.includes(currentUid)
        )
        .sort(
          (a, b) =>
            new Date(b.updatedAt || 0).getTime() -
            new Date(a.updatedAt || 0).getTime()
        );

      return res.status(200).json({
        success: true,
        conversations,
      });
    } catch (error) {
      console.error("Get conversations error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch conversations",
      });
    }
  }
);

// ==============================
// GET CONVERSATION MESSAGES
// ==============================

app.get(
  "/api/users/conversations/:conversationId/messages",
  authenticateUser,
  async (req, res) => {
    try {
      const currentUid = req.user.uid;
      const { conversationId } = req.params;

      const conversationDoc = await db
        .collection("conversations")
        .doc(conversationId)
        .get();

      if (!conversationDoc.exists) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }

      const conversation = conversationDoc.data();

      if (!conversation.participants?.includes(currentUid)) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to access this conversation",
        });
      }

      const snapshot = await db
        .collection("messages")
        .where("conversationId", "==", conversationId)
        .get();

      const messages = snapshot.docs
        .map((doc) => doc.data())
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
        );

      return res.status(200).json({
        success: true,
        messages,
      });
    } catch (error) {
      console.error("Get conversation messages error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch messages",
      });
    }
  }
);

// Mark conversation messages as read
app.patch(
  "/api/users/conversations/:conversationId/read",
  authenticateUser,
  async (req, res) => {
    try {
      const { conversationId } = req.params;
      const uid = req.user.uid;

      const conversationRef = db
        .collection("conversations")
        .doc(conversationId);

      const conversationSnapshot = await conversationRef.get();

      if (!conversationSnapshot.exists) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }

      const conversation = conversationSnapshot.data();

      if (!conversation.participants?.includes(uid)) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this conversation",
        });
      }

      await conversationRef.update({
        [`unreadCounts.${uid}`]: 0,
      });

      return res.status(200).json({
        success: true,
        message: "Conversation marked as read",
      });
    } catch (error) {
      console.error("Mark conversation read error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to mark conversation as read",
      });
    }
  }
);

// ==========================================
// WISHLIST
// ==========================================

// Get current user's wishlist
app.get("/api/users/wishlist", authenticateUser, async (req, res) => {
  try {
    const snapshot = await db
      .collection("wishlists")
      .where("userId", "==", req.user.uid)
      .get();

    const wishlist = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ wishlist });
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({
      message: "Failed to load wishlist.",
    });
  }
});

// Add item to wishlist
app.post("/api/users/wishlist", authenticateUser, async (req, res) => {
  try {
    const { targetUserId, skillId, skillName } = req.body;

    if (!targetUserId || !skillId || !skillName) {
      return res.status(400).json({
        message: "User, skill, and skill name are required.",
      });
    }

    const existing = await db
      .collection("wishlists")
      .where("userId", "==", req.user.uid)
      .where("targetUserId", "==", targetUserId)
      .where("skillId", "==", skillId)
      .get();

    if (!existing.empty) {
      return res.status(400).json({
        message: "This skill is already in your wishlist.",
      });
    }

    const wishlistRef = db.collection("wishlists").doc();

    const wishlistItem = {
      id: wishlistRef.id,
      userId: req.user.uid,
      targetUserId,
      skillId,
      skillName,
      createdAt: new Date().toISOString(),
    };

    await wishlistRef.set(wishlistItem);

    res.status(201).json({
      message: "Added to wishlist.",
      wishlist: wishlistItem,
    });
  } catch (error) {
    console.error("Add wishlist error:", error);
    res.status(500).json({
      message: "Failed to add to wishlist.",
    });
  }
});

// Remove item from wishlist
app.delete(
  "/api/users/wishlist/:wishlistId",
  authenticateUser,
  async (req, res) => {
    try {
      const wishlistRef = db
        .collection("wishlists")
        .doc(req.params.wishlistId);

      const snapshot = await wishlistRef.get();

      if (!snapshot.exists) {
        return res.status(404).json({
          message: "Wishlist item not found.",
        });
      }

      const wishlist = snapshot.data();

      if (wishlist.userId !== req.user.uid) {
        return res.status(403).json({
          message: "You are not authorized to remove this item.",
        });
      }

      await wishlistRef.delete();

      res.json({
        message: "Removed from wishlist.",
      });
    } catch (error) {
      console.error("Remove wishlist error:", error);
      res.status(500).json({
        message: "Failed to remove wishlist item.",
      });
    }
  }
);

// ==========================================
// NOTIFICATIONS
// ==========================================

// Get current user's notifications
app.get(
  "/api/users/notifications",
  authenticateUser,
  async (req, res) => {
    try {
      const snapshot = await db
        .collection("notifications")
        .where("userId", "==", req.user.uid)
        .get();

      const notifications = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

      res.json({ notifications });
    } catch (error) {
      console.error("Get notifications error:", error);

      res.status(500).json({
        message: "Failed to load notifications.",
      });
    }
  }
);

// Get unread notification count
app.get(
  "/api/users/notifications/unread-count",
  authenticateUser,
  async (req, res) => {
    try {
      const snapshot = await db
        .collection("notifications")
        .where("userId", "==", req.user.uid)
        .where("read", "==", false)
        .get();

      res.json({
        count: snapshot.size,
      });
    } catch (error) {
      console.error(
        "Get unread notification count error:",
        error
      );

      res.status(500).json({
        message: "Failed to load unread notification count.",
      });
    }
  }
);

// Mark one notification as read
app.patch(
  "/api/users/notifications/:notificationId/read",
  authenticateUser,
  async (req, res) => {
    try {
      const notificationRef = db
        .collection("notifications")
        .doc(req.params.notificationId);

      const snapshot = await notificationRef.get();

      if (!snapshot.exists) {
        return res.status(404).json({
          message: "Notification not found.",
        });
      }

      const notification = snapshot.data();

      if (notification.userId !== req.user.uid) {
        return res.status(403).json({
          message: "You are not authorized to update this notification.",
        });
      }

      await notificationRef.update({
        read: true,
        updatedAt: new Date().toISOString(),
      });

      res.json({
        message: "Notification marked as read.",
      });
    } catch (error) {
      console.error(
        "Mark notification as read error:",
        error
      );

      res.status(500).json({
        message: "Failed to update notification.",
      });
    }
  }
);

// Mark all notifications as read
app.patch(
  "/api/users/notifications/read-all",
  authenticateUser,
  async (req, res) => {
    try {
      const snapshot = await db
        .collection("notifications")
        .where("userId", "==", req.user.uid)
        .where("read", "==", false)
        .get();

      if (snapshot.empty) {
        return res.json({
          message: "All notifications are already read.",
        });
      }

      const batch = db.batch();
      const now = new Date().toISOString();

      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          read: true,
          updatedAt: now,
        });
      });

      await batch.commit();

      res.json({
        message: "All notifications marked as read.",
      });
    } catch (error) {
      console.error(
        "Mark all notifications as read error:",
        error
      );

      res.status(500).json({
        message: "Failed to update notifications.",
      });
    }
  }
);

app.use("/api/admin", adminRoutes);
module.exports = app;