const express = require("express");
const { db } = require("../config/firebase");
const authenticateUser = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");

const router = express.Router();

router.get(
  "/overview",
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      const usersSnapshot = await db
        .collection("users")
        .get();

      const users = usersSnapshot.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        })
      );

      const totalUsers = users.length;

      const activeUsers = users.filter(
        (user) => user.isActive !== false
      ).length;

      const inactiveUsers = users.filter(
        (user) => user.isActive === false
      ).length;

      const totalAdmins = users.filter(
        (user) => user.role === "admin"
      ).length;

      const skillsToTeach = users.reduce(
        (total, user) =>
          total +
          (Array.isArray(user.skillsToTeach)
            ? user.skillsToTeach.length
            : 0),
        0
      );

      const skillsToLearn = users.reduce(
        (total, user) =>
          total +
          (Array.isArray(user.skillsToLearn)
            ? user.skillsToLearn.length
            : 0),
        0
      );

      res.json({
        success: true,
        overview: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          totalAdmins,
          skillsToTeach,
          skillsToLearn,
        },
      });
    } catch (error) {
      console.error(
        "Admin overview error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load admin overview.",
      });
    }
  }
);

router.get(
  "/users",
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      const usersSnapshot = await db
        .collection("users")
        .get();

      const users = usersSnapshot.docs.map(
        (doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            name: data.name || "",
            email: data.email || "",
            role: data.role || "user",
            isActive:
              data.isActive !== false,
            skillsToTeach: Array.isArray(
              data.skillsToTeach
            )
              ? data.skillsToTeach.length
              : 0,
            skillsToLearn: Array.isArray(
              data.skillsToLearn
            )
              ? data.skillsToLearn.length
              : 0,
            expertiseLevel:
              data.expertiseLevel || "",
            interests: Array.isArray(
              data.interests
            )
              ? data.interests
              : [],
            createdAt:
              data.createdAt || null,
          };
        }
      );

      res.json({
        success: true,
        users,
      });
    } catch (error) {
      console.error(
        "Admin users error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load users.",
      });
    }
  }
);

/*
 * ======================================
 * GET SINGLE USER DETAILS
 * ======================================
 */

router.get(
  "/users/:userId",
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const userRef = db
        .collection("users")
        .doc(userId);

      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      const data = userDoc.data();

      const user = {
        id: userDoc.id,
        name: data.name || "",
        email: data.email || "",
        role: data.role || "user",
        isActive:
          data.isActive !== false,
        expertiseLevel:
          data.expertiseLevel || "",
        interests: Array.isArray(
          data.interests
        )
          ? data.interests
          : [],
        skillsToTeach: Array.isArray(
          data.skillsToTeach
        )
          ? data.skillsToTeach
          : [],
        skillsToLearn: Array.isArray(
          data.skillsToLearn
        )
          ? data.skillsToLearn
          : [],
        createdAt:
          data.createdAt || null,
        photoURL:
          data.photoURL || "",
        bio:
          data.bio || "",
      };

      res.json({
        success: true,
        user,
      });
    } catch (error) {
      console.error(
        "Admin user details error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load user details.",
      });
    }
  }
);

/*
 * ======================================
 * ACTIVATE / DEACTIVATE USER
 * ======================================
 */

router.patch(
  "/users/:userId/status",
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message:
            "isActive must be a boolean value.",
        });
      }

      const userRef = db
        .collection("users")
        .doc(userId);

      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      if (userId === req.user.uid) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot change your own account status.",
        });
      }

      await userRef.update({
        isActive,
      });

      res.json({
        success: true,
        message: isActive
          ? "User activated successfully."
          : "User deactivated successfully.",
        user: {
          id: userId,
          isActive,
        },
      });
    } catch (error) {
      console.error(
        "Admin user status error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update user status.",
      });
    }
  }
);
// ==========================================
// GET ALL EXCHANGE REQUESTS
// ==========================================

router.get(
  "/requests",
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      const snapshot = await db
        .collection("exchangeRequests")
        .get();

      const requests = snapshot.docs
        .map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,

            senderId:
              data.senderId || "",

            senderName:
              data.senderName || "",

            receiverId:
              data.receiverId || "",

            receiverName:
              data.receiverName || "",

            skillId:
              data.skillId || "",

            skillName:
              data.skillName || "",

            skillLevel:
              data.skillLevel || "",

            status:
              data.status || "pending",

            createdAt:
              data.createdAt || null,

            updatedAt:
              data.updatedAt || null,
          };
        })
        .sort(
          (a, b) =>
            new Date(
              b.createdAt || 0
            ).getTime() -
            new Date(
              a.createdAt || 0
            ).getTime()
        );

      return res.status(200).json({
        success: true,
        requests,
      });
    } catch (error) {
      console.error(
        "Admin requests error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load exchange requests.",
      });
    }
  }
);
// ==========================================
// GET ALL PLATFORM MATCHES
// ==========================================

router.get(
  "/matches",
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      const snapshot = await db
        .collection("users")
        .get();

      const users = snapshot.docs
        .map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }))
        .filter(
          (user) =>
            user.isActive !== false &&
            user.role !== "admin"
        );

      const matches = [];
      const processedPairs = new Set();

      for (const userA of users) {
        const userATeaching =
          Array.isArray(userA.skillsToTeach)
            ? userA.skillsToTeach
            : [];

        const userALearning =
          Array.isArray(userA.skillsToLearn)
            ? userA.skillsToLearn
            : [];

        if (
          userATeaching.length === 0 &&
          userALearning.length === 0
        ) {
          continue;
        }

        const userATeachingNames = new Set(
          userATeaching.map((skill) =>
            String(skill.name || "")
              .trim()
              .toLowerCase()
          )
        );

        const userALearningNames = new Set(
          userALearning.map((skill) =>
            String(skill.name || "")
              .trim()
              .toLowerCase()
          )
        );

        for (const userB of users) {
          if (userA.uid === userB.uid) {
            continue;
          }

          const pairKey = [
            userA.uid,
            userB.uid,
          ]
            .sort()
            .join("_");

          if (processedPairs.has(pairKey)) {
            continue;
          }

          const userBTeaching =
            Array.isArray(userB.skillsToTeach)
              ? userB.skillsToTeach
              : [];

          const userBLearning =
            Array.isArray(userB.skillsToLearn)
              ? userB.skillsToLearn
              : [];

          const userBTeachingNames =
            new Set(
              userBTeaching.map((skill) =>
                String(skill.name || "")
                  .trim()
                  .toLowerCase()
              )
            );

          const userBLearningNames =
            new Set(
              userBLearning.map((skill) =>
                String(skill.name || "")
                  .trim()
                  .toLowerCase()
              )
            );

          /*
           * Skills user B can teach user A.
           */
          const aCanLearnFromB =
            userALearning.filter((skill) =>
              userBTeachingNames.has(
                String(skill.name || "")
                  .trim()
                  .toLowerCase()
              )
            );

          /*
           * Skills user A can teach user B.
           */
          const bCanLearnFromA =
            userBLearning.filter((skill) =>
              userATeachingNames.has(
                String(skill.name || "")
                  .trim()
                  .toLowerCase()
              )
            );

          if (
            aCanLearnFromB.length === 0 &&
            bCanLearnFromA.length === 0
          ) {
            continue;
          }

          const totalPossibleSkills =
            userATeaching.length +
            userALearning.length +
            userBTeaching.length +
            userBLearning.length;

          const matchingSkills =
            aCanLearnFromB.length +
            bCanLearnFromA.length;

          const matchPercentage =
            totalPossibleSkills > 0
              ? Math.round(
                  (matchingSkills /
                    totalPossibleSkills) *
                    100
                )
              : 0;

          matches.push({
            id: pairKey,

            userOne: {
              uid: userA.uid,
              name: userA.name || "",
              email: userA.email || "",
              photoURL:
                userA.photoURL || "",
            },

            userTwo: {
              uid: userB.uid,
              name: userB.name || "",
              email: userB.email || "",
              photoURL:
                userB.photoURL || "",
            },

            userOneCanTeach:
              bCanLearnFromA.map(
                (skill) => skill.name
              ),

            userTwoCanTeach:
              aCanLearnFromB.map(
                (skill) => skill.name
              ),

            matchPercentage,

            matchType:
              aCanLearnFromB.length > 0 &&
              bCanLearnFromA.length > 0
                ? "mutual"
                : "one-way",

            createdAt:
              userA.createdAt ||
              userB.createdAt ||
              null,
          });

          processedPairs.add(pairKey);
        }
      }

      matches.sort(
        (a, b) =>
          b.matchPercentage -
          a.matchPercentage
      );

      return res.status(200).json({
        success: true,
        matches,
        totalMatches: matches.length,
      });
    } catch (error) {
      console.error(
        "Admin matches error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load platform matches.",
      });
    }
  }
);

// ==========================================
// GET ALL SESSIONS - ADMIN
// ==========================================

router.get(
  "/sessions",
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      const snapshot = await db
        .collection("sessions")
        .get();

      const sessions = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
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
      console.error(
        "Admin get sessions error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch sessions",
      });
    }
  }
);
// ==========================================
// GET ADMIN REPORTS
// ==========================================

router.get(
  "/reports",
  authenticateUser,
  requireAdmin,
  async (req, res) => {
    try {
      /*
       * ======================================
       * USERS
       * ======================================
       */

      const usersSnapshot = await db
        .collection("users")
        .get();

      const users = usersSnapshot.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        })
      );

      const totalUsers = users.length;

      const activeUsers = users.filter(
        (user) => user.isActive !== false
      ).length;

      const inactiveUsers = users.filter(
        (user) => user.isActive === false
      ).length;

      const totalAdmins = users.filter(
        (user) => user.role === "admin"
      ).length;

      /*
       * ======================================
       * REQUESTS
       * ======================================
       */

      const requestsSnapshot = await db
        .collection("exchangeRequests")
        .get();

      const requests =
        requestsSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

      const requestStats = {
        total: requests.length,
        pending: 0,
        accepted: 0,
        rejected: 0,
        cancelled: 0,
      };

      const skillRequestCounts = {};

      requests.forEach((request) => {
        const status =
          String(
            request.status || "pending"
          ).toLowerCase();

        if (
          Object.prototype.hasOwnProperty.call(
            requestStats,
            status
          )
        ) {
          requestStats[status]++;
        }

        const skillName =
          String(
            request.skillName || "Unknown"
          ).trim();

        if (skillName) {
          skillRequestCounts[skillName] =
            (skillRequestCounts[skillName] || 0) +
            1;
        }
      });

      /*
       * ======================================
       * MOST REQUESTED SKILLS
       * ======================================
       */

      const mostRequestedSkills =
        Object.entries(
          skillRequestCounts
        )
          .map(
            ([skill, count]) => ({
              skill,
              count,
            })
          )
          .sort(
            (a, b) =>
              b.count - a.count
          )
          .slice(0, 10);

      /*
       * ======================================
       * MATCHES
       * ======================================
       *
       * Use the same deterministic matching
       * logic as the admin matches endpoint.
       */

      const activeNonAdminUsers =
        users.filter(
          (user) =>
            user.isActive !== false &&
            user.role !== "admin"
        );

      const matches = [];
      const processedPairs = new Set();

      for (
        const userA of activeNonAdminUsers
      ) {
        const userATeaching =
          Array.isArray(
            userA.skillsToTeach
          )
            ? userA.skillsToTeach
            : [];

        const userALearning =
          Array.isArray(
            userA.skillsToLearn
          )
            ? userA.skillsToLearn
            : [];

        const userATeachingNames =
          new Set(
            userATeaching.map(
              (skill) =>
                String(
                  skill.name || ""
                )
                  .trim()
                  .toLowerCase()
            )
          );

        const userALearningNames =
          new Set(
            userALearning.map(
              (skill) =>
                String(
                  skill.name || ""
                )
                  .trim()
                  .toLowerCase()
            )
          );

        for (
          const userB of activeNonAdminUsers
        ) {
          if (
            userA.uid === userB.uid
          ) {
            continue;
          }

          const pairKey = [
            userA.uid,
            userB.uid,
          ]
            .sort()
            .join("_");

          if (
            processedPairs.has(pairKey)
          ) {
            continue;
          }

          const userBTeaching =
            Array.isArray(
              userB.skillsToTeach
            )
              ? userB.skillsToTeach
              : [];

          const userBLearning =
            Array.isArray(
              userB.skillsToLearn
            )
              ? userB.skillsToLearn
              : [];

          const userBTeachingNames =
            new Set(
              userBTeaching.map(
                (skill) =>
                  String(
                    skill.name || ""
                  )
                    .trim()
                    .toLowerCase()
              )
            );

          const aCanLearnFromB =
            userALearning.filter(
              (skill) =>
                userBTeachingNames.has(
                  String(
                    skill.name || ""
                  )
                    .trim()
                    .toLowerCase()
                )
            );

          const bCanLearnFromA =
            userBLearning.filter(
              (skill) =>
                userATeachingNames.has(
                  String(
                    skill.name || ""
                  )
                    .trim()
                    .toLowerCase()
                )
            );

          if (
            aCanLearnFromB.length === 0 &&
            bCanLearnFromA.length === 0
          ) {
            continue;
          }

          matches.push({
            type:
              aCanLearnFromB.length > 0 &&
              bCanLearnFromA.length > 0
                ? "mutual"
                : "one-way",
          });

          processedPairs.add(
            pairKey
          );
        }
      }

      const totalMatches =
        matches.length;

      const mutualMatches =
        matches.filter(
          (match) =>
            match.type === "mutual"
        ).length;

      const oneWayMatches =
        matches.filter(
          (match) =>
            match.type === "one-way"
        ).length;

      /*
       * ======================================
       * SESSIONS
       * ======================================
       */

      const sessionsSnapshot =
        await db
          .collection("sessions")
          .get();

      const sessions =
        sessionsSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

      const sessionStats = {
        total: sessions.length,
        scheduled: 0,
        completed: 0,
        cancelled: 0,
        online: 0,
        offline: 0,
      };

      sessions.forEach(
        (session) => {
          const status =
            String(
              session.status ||
                "scheduled"
            ).toLowerCase();

          const type =
            String(
              session.type || ""
            ).toLowerCase();

          if (
            Object.prototype.hasOwnProperty.call(
              sessionStats,
              status
            )
          ) {
            sessionStats[status]++;
          }

          if (
            type === "online"
          ) {
            sessionStats.online++;
          }

          if (
            type === "offline"
          ) {
            sessionStats.offline++;
          }
        }
      );

      /*
       * ======================================
       * RESPONSE
       * ======================================
       */

      return res.status(200).json({
        success: true,

        reports: {
          users: {
            total: totalUsers,
            active: activeUsers,
            inactive: inactiveUsers,
            admins: totalAdmins,
          },

          requests: requestStats,

          matches: {
            total: totalMatches,
            mutual: mutualMatches,
            oneWay: oneWayMatches,
          },

          sessions: sessionStats,

          mostRequestedSkills,
        },
      });
    } catch (error) {
      console.error(
        "Admin reports error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to generate admin reports.",
      });
    }
  }
);
module.exports = router;
