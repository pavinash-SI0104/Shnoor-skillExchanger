const { db } = require("../config/firebase");

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userDoc = await db
      .collection("users")
      .doc(req.user.uid)
      .get();

    if (!userDoc.exists) {
      return res.status(403).json({
        success: false,
        message: "User profile not found",
      });
    }

    const user = userDoc.data();

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "This account is inactive",
      });
    }

    req.admin = {
      uid: req.user.uid,
      email: req.user.email || user.email || "",
      name: user.name || "",
      role: "admin",
    };

    next();
  } catch (error) {
    console.error(
      "Admin authorization error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to verify admin access",
    });
  }
};

module.exports = requireAdmin;