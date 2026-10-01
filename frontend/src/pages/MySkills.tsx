import { useEffect, useState } from "react";
import { auth } from "../config/firebase";

interface Skill {
  id: string;
  name: string;
  type: "teach" | "learn";
  level: string;
}

function MySkills() {
  const [showForm, setShowForm] = useState(false);

  const [skillName, setSkillName] = useState("");
  const [skillType, setSkillType] =
    useState<"teach" | "learn">("teach");

  const [skillLevel, setSkillLevel] =
    useState("Beginner");

  const [editingSkillId, setEditingSkillId] =
    useState<string | null>(null);

  const [skills, setSkills] = useState<Skill[]>([]);

  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD SKILLS
  // =========================

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        console.log("No logged-in user");
        return;
      }

      const token = await user.getIdToken();

      const response = await fetch(
        "http://localhost:5000/api/users/skills",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      const teachingSkills: Skill[] =
        (data.skillsToTeach || []).map((skill: any) => ({
          ...skill,
          type: "teach",
        }));

      const learningSkills: Skill[] =
        (data.skillsToLearn || []).map((skill: any) => ({
          ...skill,
          type: "learn",
        }));

      setSkills([
        ...teachingSkills,
        ...learningSkills,
      ]);
    } catch (error) {
      console.error("Failed to load skills:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ADD / UPDATE SKILL
  // =========================

  const handleSaveSkill = async () => {
    if (skillName.trim() === "") {
      alert("Please enter a skill name.");
      return;
    }

    // Editing will be connected in the next step
    if (editingSkillId !== null) {
      alert("Skill editing will be connected next.");
      return;
    }

    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Please login first.");
        return;
      }

      const token = await user.getIdToken();

      const response = await fetch(
        "http://localhost:5000/api/users/skills",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: skillName,
            type: skillType,
            level: skillLevel,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      const newSkill: Skill = {
        id: data.skill.id,
        name: data.skill.name,
        type: skillType,
        level: data.skill.level,
      };

      setSkills((currentSkills) => [
        ...currentSkills,
        newSkill,
      ]);

      alert("Skill added successfully!");

      resetForm();
    } catch (error: any) {
      console.error("Add skill error:", error);

      alert(
        error.message || "Failed to add skill."
      );
    }
  };

  // =========================
  // EDIT SKILL
  // =========================

  const handleEditSkill = (skill: Skill) => {
    setSkillName(skill.name);
    setSkillType(skill.type);
    setSkillLevel(skill.level);

    setEditingSkillId(skill.id);

    setShowForm(true);
  };

  // =========================
  // DELETE SKILL
  // =========================

  const handleDeleteSkill = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this skill?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Please login first.");
        return;
      }

      const token = await user.getIdToken();

      const response = await fetch(
        `http://localhost:5000/api/users/skills/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setSkills((currentSkills) =>
        currentSkills.filter(
          (skill) => skill.id !== id
        )
      );

      alert("Skill deleted successfully!");
    } catch (error: any) {
      console.error("Delete skill error:", error);

      alert(
        error.message || "Failed to delete skill."
      );
    }
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setSkillName("");
    setSkillType("teach");
    setSkillLevel("Beginner");

    setEditingSkillId(null);

    setShowForm(false);
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
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
        >
          {showForm
            ? "Cancel"
            : "+ Add Skill"}
        </button>

      </div>

      {/* ADD / EDIT FORM */}

      {showForm && (

        <div className="dashboard-card skill-form-card">

          <h2>
            {editingSkillId !== null
              ? "Edit Skill"
              : "Add a Skill"}
          </h2>

          <div className="form-group">

            <label>
              Skill Name
            </label>

            <input
              type="text"
              placeholder="Example: React, Python, Photoshop"
              value={skillName}
              onChange={(e) =>
                setSkillName(e.target.value)
              }
            />

          </div>

          <div className="form-group">

            <label>
              Skill Type
            </label>

            <select
              value={skillType}
              onChange={(e) =>
                setSkillType(
                  e.target.value as
                    | "teach"
                    | "learn"
                )
              }
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

            <label>
              Skill Level
            </label>

            <select
              value={skillLevel}
              onChange={(e) =>
                setSkillLevel(e.target.value)
              }
            >

              <option>
                Beginner
              </option>

              <option>
                Intermediate
              </option>

              <option>
                Advanced
              </option>

              <option>
                Expert
              </option>

            </select>

          </div>

          <button
            className="primary-button"
            onClick={handleSaveSkill}
          >
            {editingSkillId !== null
              ? "Update Skill"
              : "Save Skill"}
          </button>

        </div>
      )}

      {/* SKILLS GRID */}

      <div className="skills-grid">

        {/* TEACHING SKILLS */}

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

              <p>
                No teaching skills added yet.
              </p>

            ) : (

              teachingSkills.map((skill) => (

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
                      className="edit-button"
                      onClick={() =>
                        handleEditSkill(skill)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDeleteSkill(
                          skill.id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>

        {/* LEARNING SKILLS */}

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

              <p>
                No learning skills added yet.
              </p>

            ) : (

              learningSkills.map((skill) => (

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
                      className="edit-button"
                      onClick={() =>
                        handleEditSkill(skill)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDeleteSkill(
                          skill.id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default MySkills;