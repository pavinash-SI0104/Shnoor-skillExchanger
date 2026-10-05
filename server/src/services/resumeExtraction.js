const { GoogleGenAI } = require("@google/genai");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new GoogleGenAI({
    apiKey,
  });
};

const extractResumeText = async (file) => {
  if (!file || !file.buffer) {
    throw new Error("Resume file is required.");
  }

  const fileType = file.mimetype;

  if (fileType === "application/pdf") {
    const parser = new PDFParse({
      data: file.buffer,
    });

    const result = await parser.getText();

    await parser.destroy();

    return result.text;
  }

  if (
    fileType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });

    return result.value;
  }

  throw new Error(
    "Unsupported resume format. Please upload a PDF or DOCX file."
  );
};

const extractSkillsFromResume = async (resumeText) => {
  const ai = getGeminiClient();

  if (!ai) {
    throw new Error("Gemini API key is not configured.");
  }

  if (!resumeText || !resumeText.trim()) {
    throw new Error(
      "Could not extract text from the resume."
    );
  }

  const prompt = `
You are a resume skill extraction system for a skill-exchange platform.

Extract the technical, professional, and practical skills that the person
can reasonably be considered capable of teaching based ONLY on the resume.

RESUME:
${resumeText}

Rules:
- Return only skills explicitly supported by the resume.
- Do not invent skills.
- Do not include generic words such as "communication", "teamwork",
  "problem solving", or "leadership" unless they are clearly presented
  as a specific skill.
- Prefer useful skill names such as:
  JavaScript, React, Node.js, Python, SQL, MongoDB, Git, Docker,
  Machine Learning, Data Analysis, etc.
- Remove duplicate skills.
- Keep skill names concise.
- Return valid JSON only.

Return this structure:
{
  "skills": [
    {
      "name": "React",
      "level": "Intermediate"
    }
  ]
}

For the level, use only:
- Beginner
- Intermediate
- Advanced

If the resume does not provide enough evidence for an exact level,
use "Intermediate".
`;

  const response = await ai.models.generateContent({
    model:
      process.env.GEMINI_MODEL || "gemini-3.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          skills: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                },
                level: {
                  type: "string",
                  enum: [
                    "Beginner",
                    "Intermediate",
                    "Advanced",
                  ],
                },
              },
              required: ["name", "level"],
            },
          },
        },
        required: ["skills"],
      },
    },
  });

  const parsed = JSON.parse(response.text);

  return parsed.skills || [];
};

module.exports = {
  extractResumeText,
  extractSkillsFromResume,
};
