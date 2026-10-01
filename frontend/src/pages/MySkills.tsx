import { useState } from "react";

interface Skill {
  id: number;
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
    useState<number | null>(null);

  const [skills, setSkills] = useState<Skill[]>([
    {
      id: 1,
      name: "Python",
      type: "teach",
      level: "Advanced"
    },
    {
      id: 2,
      name: "React",
      type: "teach",
      level: "Intermediate"
    },
    {
      id: 3,
      name: "SQL",
      type: "teach",
      level: "Intermediate"
    },
    {
      id: 4,
      name: "UI/UX Design",
      type: "learn",
      level: "Beginner"
    },
    {
      id: 5,
      name: "Machine Learning",
      type: "learn",
      level: "Beginner"
    }
  ]);


  // =========================
  // ADD / UPDATE SKILL
  // =========================

  const handleSaveSkill = () => {

    if (skillName.trim() === "") {
      alert("Please enter a skill name.");
      return;
    }

    // EDIT EXISTING SKILL
    if (editingSkillId !== null) {

      setSkills(
        skills.map((skill) =>
          skill.id === editingSkillId
            ? {
                ...skill,
                name: skillName,
                type: skillType,
                level: skillLevel
              }
            : skill
        )
      );

      alert("Skill updated successfully!");

    }

    // ADD NEW SKILL
    else {

      const newSkill: Skill = {
        id: Date.now(),
        name: skillName,
        type: skillType,
        level: skillLevel
      };

      setSkills([...skills, newSkill]);

      alert("Skill added successfully!");
    }

    resetForm();
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

  const handleDeleteSkill = (id: number) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this skill?"
    );

    if (!confirmDelete) {
      return;
    }

    setSkills(
      skills.filter((skill) => skill.id !== id)
    );

    alert("Skill deleted successfully!");
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


  const teachingSkills = skills.filter(
    (skill) => skill.type === "teach"
  );

  const learningSkills = skills.filter(
    (skill) => skill.type === "learn"
  );


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
          {showForm ? "Cancel" : "+ Add Skill"}
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
                  e.target.value as "teach" | "learn"
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

              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
              <option>Expert</option>

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
                Skills you can share with other users.
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
                        handleDeleteSkill(skill.id)
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
                Skills you are interested in learning.
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
                        handleDeleteSkill(skill.id)
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