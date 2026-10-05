const { GoogleGenAI } = require("@google/genai");
const Groq = require("groq-sdk");
const { PDFParse } = require("pdf-parse");

const mammoth = require("mammoth");

/*
 * ==========================================
 * AI PROVIDERS
 * ==========================================
 */

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  return new GoogleGenAI({
    apiKey,
  });
};

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("Groq API key is not configured.");
  }

  return new Groq({
    apiKey,
  });
};

/*
 * ==========================================
 * RESUME TEXT EXTRACTION
 * ==========================================
 */

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

/*
 * ==========================================
 * RESUME AI PROMPT
 * ==========================================
 */

const buildResumePrompt = (resumeText) => `
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

/*
 * ==========================================
 * VALIDATE EXTRACTED SKILLS
 * ==========================================
 */

const validateSkills = (parsed) => {
  if (!parsed || !Array.isArray(parsed.skills)) {
    throw new Error(
      "AI returned an invalid resume skill response."
    );
  }

  return parsed.skills;
};

/*
 * ==========================================
 * GEMINI EXTRACTION
 * ==========================================
 */

const extractWithGemini = async (prompt) => {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model:
      process.env.GEMINI_RESUME_MODEL ||
      "gemini-3.5-flash-lite",

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

              required: [
                "name",
                "level",
              ],
            },
          },
        },

        required: ["skills"],
      },
    },
  });

  const parsed = JSON.parse(response.text);

  return validateSkills(parsed);
};

/*
 * ==========================================
 * GROQ EXTRACTION
 * ==========================================
 */

const extractWithGroq = async (prompt) => {
  const groq = getGroqClient();

  const response =
    await groq.chat.completions.create({
      model:
        process.env.GROQ_RESUME_MODEL ||
        process.env.GROQ_MODEL ||
        "openai/gpt-oss-120b",

      messages: [
        {
          role: "system",
          content:
            "You are a precise resume skill extraction system. Return valid JSON only.",
        },

        {
          role: "user",
          content: prompt,
        },
      ],

      response_format: {
        type: "json_object",
      },

      temperature: 0.2,
    });

  const content =
    response.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error(
      "Groq returned an empty response."
    );
  }

  const parsed = JSON.parse(content);

  return validateSkills(parsed);
};

/*
 * ==========================================
 * FALLBACK CONDITIONS
 * ==========================================
 */

const shouldFallback = (error) => {
  const errorText =
    String(error?.message || error).toLowerCase();

  const fallbackErrors = [
    "401",
    "403",
    "429",
    "resource_exhausted",
    "rate limit",
    "quota",
    "timeout",
    "503",
    "service unavailable",
    "temporarily unavailable",
    "unavailable",
    "unauthenticated",
    "high demand",
  ];

  return fallbackErrors.some((item) =>
    errorText.includes(item)
  );
};

/*
 * ==========================================
 * AI RESUME SKILL EXTRACTION
 * ==========================================
 */

const extractSkillsFromResume = async (resumeText) => {
  if (!resumeText || !resumeText.trim()) {
    throw new Error(
      "Could not extract text from the resume."
    );
  }

  const prompt = buildResumePrompt(resumeText);

  /*
   * ----------------------------------------
   * PRIMARY: GEMINI
   * ----------------------------------------
   */

  try {
    const startTime = Date.now();

    const skills = await extractWithGemini(
      prompt
    );

    const latency = Date.now() - startTime;

    console.log(
      `Resume AI Provider: Gemini | ` +
      `Latency: ${latency} ms | ` +
      `Fallback: false`
    );

    return skills;
  } catch (primaryError) {
    console.error(
      "Primary resume AI provider Gemini failed:",
      primaryError.message
    );

    if (!shouldFallback(primaryError)) {
      throw primaryError;
    }
  }

  /*
   * ----------------------------------------
   * FALLBACK: GROQ
   * ----------------------------------------
   */

  try {
    const startTime = Date.now();

    const skills = await extractWithGroq(
      prompt
    );

    const latency = Date.now() - startTime;

    console.log(
      `Resume AI Provider: Groq | ` +
      `Latency: ${latency} ms | ` +
      `Fallback: true`
    );

    return skills;
  } catch (fallbackError) {
    console.error(
      "Fallback resume AI provider Groq failed:",
      fallbackError.message
    );

    throw new Error(
      "All AI resume processing providers are unavailable."
    );
  }
};

module.exports = {
  extractResumeText,
  extractSkillsFromResume,
};