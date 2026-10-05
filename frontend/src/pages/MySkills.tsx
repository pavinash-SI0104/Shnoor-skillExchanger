import { useEffect, useState } from "react";
import { auth } from "../config/firebase";
import api from "../api/api";

interface Skill {
  id: string;
  name: string;
  type: "teach" | "learn";
  level: string;
}

function MySkills() {
  const [skills, setSkills] = useState<Skill[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [skillName, setSkillName] = useState("");
  const [skillType, setSkillType] =
    useState<"teach" | "learn">("teach");
  const [skillLevel, setSkillLevel] =
    useState("Beginner");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState<string | null>(null);
  const [deleteId, setDeleteId] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // SHOW MORE / SHOW LESS
  // =========================

  const [showAllTeaching, setShowAllTeaching] =
    useState(false);

  const [showAllLearning, setShowAllLearning] =
    useState(false);

  // =========================
  // LOAD SKILLS
  // =========================

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      setError("");

      if (!auth.currentUser) {
        setError("Please log in to view your skills.");
        return;
      }

      const response = await api.get("/users/skills");
      const data = response.data || {};

      const teachingSkills: Skill[] = (
        data.skillsToTeach || []
      ).map((skill: any) => ({
        id: skill.id,
        name: skill.name,
        type: "teach",
        level: skill.level,
      }));

      const learningSkills: Skill[] = (
        data.skillsToLearn || []
      ).map((skill: any) => ({
        id: skill.id,
        name: skill.name,
        type: "learn",
        level: skill.level,
      }));

      setSkills([
        ...teachingSkills,
        ...learningSkills,
      ]);
    } catch (err: any) {
      console.error("Failed to load skills:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load your skills."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ADD SKILL
  // =========================

  const handleSaveSkill = async () => {
    setMessage("");
    setError("");

    const name = skillName.trim();

    if (!name) {
      setError("Please enter a skill name.");
      return;
    }

    try {
      setSaving(true);

      if (!auth.currentUser) {
        setError("Please log in first.");
        return;
      }

      const response = await api.post(
        "/users/skills",
        {
          name,
          type: skillType,
          level: skillLevel,
        }
      );

      const skill = response.data?.skill;

      if (!skill) {
        throw new Error(
          "Invalid response from server."
        );
      }

      const newSkill: Skill = {
        id: skill.id,
        name: skill.name,
        type: skillType,
        level: skill.level,
      };

      setSkills((current) => [
        ...current,
        newSkill,
      ]);

      setMessage(
        `"${newSkill.name}" added successfully.`
      );

      resetForm();
    } catch (err: any) {
      console.error("Add skill error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to add skill."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE SKILL
  // =========================

  const handleDeleteSkill = async () => {
    if (!deleteId) return;

    try {
      setDeletingId(deleteId);
      setMessage("");
      setError("");

      if (!auth.currentUser) {
        setError("Please log in first.");
        return;
      }

      const skill = skills.find(
        (item) => item.id === deleteId
      );

      await api.delete(
        `/users/skills/${deleteId}`
      );

      setSkills((current) =>
        current.filter(
          (item) => item.id !== deleteId
        )
      );

      setMessage(
        `"${skill?.name || "Skill"}" deleted successfully.`
      );

      setDeleteId(null);
    } catch (err: any) {
      console.error(
        "Delete skill error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete skill."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setSkillName("");
    setSkillType("teach");
    setSkillLevel("Beginner");
    setShowForm(false);
  };

  // =========================
  // FORM TOGGLE
  // =========================

  const toggleForm = () => {
    setMessage("");
    setError("");

    if (showForm) {
      resetForm();
      return;
    }

    setShowForm(true);
  };

  // =========================
  // FILTER SKILLS
  // =========================

  const teachingSkills = skills.filter(
    (skill) => skill.type === "teach"
  );

  const learningSkills = skills.filter(
    (skill) => skill.type === "learn"
  );

  // =========================
  // VISIBLE SKILLS
  // =========================

  const visibleTeachingSkills = showAllTeaching
    ? teachingSkills
    : teachingSkills.slice(0, 2);

  const visibleLearningSkills = showAllLearning
    ? learningSkills
    : learningSkills.slice(0, 2);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div>
        <div className="page-heading">
          <div>
            <h1>My Skills</h1>

            <p>
              Loading your skills...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div>
      {/* PAGE HEADER */}

      <div className="page-heading">
        <div>
          <h1>My Skills</h1>

          <p>
            Manage the skills you can teach
            and the skills you want to learn.
          </p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={toggleForm}
        >
          {showForm ? "Cancel" : "+ Add Skill"}
        </button>
      </div>

      {/* FEEDBACK */}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* ADD SKILL FORM */}

      {showForm && (
        <div className="dashboard-card skill-form-card">
          <h2>Add a Skill</h2>

          <div className="form-group">
            <label htmlFor="skill-name">
              Skill Name
            </label>

            <input
              id="skill-name"
              type="text"
              placeholder="Example: React, Python, Photoshop"
              value={skillName}
              onChange={(e) =>
                setSkillName(e.target.value)
              }
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="skill-type">
              Skill Type
            </label>

            <select
              id="skill-type"
              value={skillType}
              onChange={(e) =>
                setSkillType(
                  e.target.value as
                    | "teach"
                    | "learn"
                )
              }
              disabled={saving}
            >
              <option value="teach">
                I can teach
              </option>

              <option value="learn">
                I want to learn
              </option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="skill-level">
              Skill Level
            </label>

            <select
              id="skill-level"
              value={skillLevel}
              onChange={(e) =>
                setSkillLevel(e.target.value)
              }
              disabled={saving}
            >
              <option value="Beginner">
                Beginner
              </option>

              <option value="Intermediate">
                Intermediate
              </option>

              <option value="Advanced">
                Advanced
              </option>

              <option value="Expert">
                Expert
              </option>
            </select>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={handleSaveSkill}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Skill"}
          </button>
        </div>
      )}

      {/* DELETE CONFIRMATION */}

      {deleteId && (
        <div className="dashboard-card delete-confirmation">
          <h3>Delete this skill?</h3>

          <p>
            This skill will be permanently
            removed from your profile.
          </p>

          <div className="skill-actions">
            <button
              className="small-button"
              type="button"
              onClick={() => setDeleteId(null)}
              disabled={deletingId !== null}
            >
              Cancel
            </button>

            <button
              className="delete-button"
              type="button"
              onClick={handleDeleteSkill}
              disabled={deletingId !== null}
            >
              {deletingId
                ? "Deleting..."
                : "Delete Skill"}
            </button>
          </div>
        </div>
      )}

      {/* SKILLS GRID */}

      <div className="skills-grid">
        {/* TEACHING */}

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>
                Skills I Can Teach
              </h2>

              <p>
                Skills you can share with
                other users.
              </p>
            </div>
          </div>

          <div className="skill-list">
            {teachingSkills.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  ⭐
                </div>

                <strong>
                  No teaching skills yet
                </strong>

                <span>
                  Add a skill you can teach
                  to other users.
                </span>
              </div>
            ) : (
              <>
                {visibleTeachingSkills.map(
                  (skill) => (
                    <div
                      className="skill-item"
                      key={skill.id}
                    >
                      <div className="skill-icon">
                        💻
                      </div>

                      <div className="skill-info">
                        <strong>
                          {skill.name}
                        </strong>

                        <span>
                          {skill.level}
                        </span>
                      </div>

                      <div className="skill-actions">
                        <button
                          className="delete-button"
                          type="button"
                          onClick={() =>
                            setDeleteId(skill.id)
                          }
                          disabled={
                            deletingId === skill.id
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                )}

                {teachingSkills.length > 2 && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      setShowAllTeaching(
                        (current) => !current
                      )
                    }
                    style={{
                      marginTop: "15px",
                    }}
                  >
                    {showAllTeaching
                      ? "Show Less"
                      : `Show More (${
                          teachingSkills.length - 2
                        })`}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* LEARNING */}

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>
                Skills I Want to Learn
              </h2>

              <p>
                Skills you are interested
                in learning.
              </p>
            </div>
          </div>

          <div className="skill-list">
            {learningSkills.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  🎯
                </div>

                <strong>
                  No learning skills yet
                </strong>

                <span>
                  Add a skill you want to
                  learn from others.
                </span>
              </div>
            ) : (
              <>
                {visibleLearningSkills.map(
                  (skill) => (
                    <div
                      className="skill-item"
                      key={skill.id}
                    >
                      <div className="skill-icon">
                        🎯
                      </div>

                      <div className="skill-info">
                        <strong>
                          {skill.name}
                        </strong>

                        <span>
                          {skill.level}
                        </span>
                      </div>

                      <div className="skill-actions">
                        <button
                          className="delete-button"
                          type="button"
                          onClick={() =>
                            setDeleteId(skill.id)
                          }
                          disabled={
                            deletingId === skill.id
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                )}

                {learningSkills.length > 2 && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      setShowAllLearning(
                        (current) => !current
                      )
                    }
                    style={{
                      marginTop: "15px",
                    }}
                  >
                    {showAllLearning
                      ? "Show Less"
                      : `Show More (${
                          learningSkills.length - 2
                        })`}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MySkills;