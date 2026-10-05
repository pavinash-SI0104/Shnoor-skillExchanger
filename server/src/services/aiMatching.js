const { GoogleGenAI } = require("@google/genai");
const Groq = require("groq-sdk");
const { z } = require("zod");

const aiMatchSchema = z.object({
  matches: z.array(
    z.object({
      uid: z.string(),
      score: z.number().min(0).max(100),
      reason: z.string().min(1).max(300),
    })
  ),
});

/*
 * ==========================================
 * PROVIDER CLIENTS
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
 * PROVIDER CONFIGURATION
 * ==========================================
 */

const primaryProvider =
  (process.env.MATCH_PRIMARY_PROVIDER || "gemini").toLowerCase();

const fallbackProvider =
  (process.env.MATCH_FALLBACK_PROVIDER || "groq").toLowerCase();

/*
 * ==========================================
 * CANDIDATE FORMAT
 * ==========================================
 */

const buildCandidate = (user) => ({
  uid: user.uid,
  name: user.name || "",
  role: user.role || "",
  expertiseLevel: user.expertiseLevel || "",
  bio: user.bio || "",
  skillsToTeach: (user.skillsToTeach || []).map((skill) => ({
    name: skill.name,
    level: skill.level || "",
  })),
  skillsToLearn: (user.skillsToLearn || []).map((skill) => ({
    name: skill.name,
    level: skill.level || "",
  })),
});

/*
 * ==========================================
 * MATCHING PROMPT
 * ==========================================
 */

const buildPrompt = ({
  currentUserData,
  candidateData,
}) => `
You are the matching engine for a skill-exchange platform.

The goal is to identify users who can form useful two-way skill exchanges.

CURRENT USER:
${JSON.stringify(currentUserData, null, 2)}

CANDIDATE USERS:
${JSON.stringify(candidateData, null, 2)}

Evaluate every candidate using ONLY the information provided.

Consider:
1. Whether the candidate teaches skills the current user wants to learn.
2. Whether the current user teaches skills the candidate wants to learn.
3. Related or complementary skills, even when the names are not identical.
4. Skill levels and expertise levels when relevant.
5. Profile context and interests when they provide useful matching evidence.

Rules:
- Never invent a user.
- Never invent a skill.
- Every returned uid MUST belong to the supplied candidate list.
- Return only candidates with meaningful skill-exchange potential.
- Score each returned candidate from 0 to 100.
- Give a short factual reason for the score.
- Do not mention information that was not supplied.
- Return valid JSON only.

Required JSON structure:
{
  "matches": [
    {
      "uid": "candidate-user-id",
      "score": 85,
      "reason": "Short factual explanation."
    }
  ]
}
`;

/*
 * ==========================================
 * GEMINI MATCHING
 * ==========================================
 */

const generateWithGemini = async (prompt) => {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model:
      process.env.GEMINI_MODEL || "gemini-3.8-flash",

    contents: prompt,

    config: {
      responseMimeType: "application/json",

      responseSchema: {
        type: "object",

        properties: {
          matches: {
            type: "array",

            items: {
              type: "object",

              properties: {
                uid: {
                  type: "string",
                },

                score: {
                  type: "number",
                },

                reason: {
                  type: "string",
                },
              },

              required: [
                "uid",
                "score",
                "reason",
              ],
            },
          },
        },

        required: ["matches"],
      },
    },
  });

  const parsed = JSON.parse(response.text);

  return aiMatchSchema.parse(parsed);
};

/*
 * ==========================================
 * GROQ MATCHING
 * ==========================================
 */

const generateWithGroq = async (prompt) => {
  const groq = getGroqClient();

  const response =
    await groq.chat.completions.create({
      model:
        process.env.GROQ_MODEL ||
        "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content:
            "You are a precise skill-exchange matching engine. Return valid JSON only.",
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

  return aiMatchSchema.parse(parsed);
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
 * PROVIDER EXECUTION
 * ==========================================
 */

const runProvider = async (
  provider,
  prompt
) => {
  if (provider === "gemini") {
    return generateWithGemini(prompt);
  }

  if (provider === "groq") {
    return generateWithGroq(prompt);
  }

  throw new Error(
    `Unsupported AI provider: ${provider}`
  );
};

/*
 * ==========================================
 * MAIN AI MATCHING SERVICE
 * ==========================================
 */

const generateAIMatches = async ({
  currentUser,
  candidates,
}) => {
  if (!candidates || candidates.length === 0) {
    return {
      matches: [],
    };
  }

  const candidateData =
    candidates.map(buildCandidate);

  const currentUserData = buildCandidate({
    ...currentUser,
    uid: currentUser.uid,
  });

  const prompt = buildPrompt({
    currentUserData,
    candidateData,
  });

  /*
   * ----------------------------------------
   * PRIMARY PROVIDER
   * ----------------------------------------
   */

  try {
    const startTime = Date.now();

    const result = await runProvider(
      primaryProvider,
      prompt
    );

    const latency = Date.now() - startTime;

    console.log(
      `AI Matching Provider: ${primaryProvider} | ` +
      `Latency: ${latency} ms | ` +
      `Fallback: false`
    );

    return result;
  } catch (primaryError) {
    console.error(
      `Primary AI provider ${primaryProvider} failed:`,
      primaryError.message
    );

    /*
     * If the error isn't a temporary/provider
     * availability problem, don't silently hide it.
     */

    if (!shouldFallback(primaryError)) {
      throw primaryError;
    }
  }

  /*
   * ----------------------------------------
   * FALLBACK PROVIDER
   * ----------------------------------------
   */

  try {
    const startTime = Date.now();

    const result = await runProvider(
      fallbackProvider,
      prompt
    );

    const latency = Date.now() - startTime;

    console.log(
      `AI Matching Provider: ${fallbackProvider} | ` +
      `Latency: ${latency} ms | ` +
      `Fallback: true`
    );

    return result;
  } catch (fallbackError) {
    console.error(
      `Fallback AI provider ${fallbackProvider} failed:`,
      fallbackError.message
    );

    throw new Error(
      "All AI matching providers are unavailable."
    );
  }
};

module.exports = {
  generateAIMatches,
};