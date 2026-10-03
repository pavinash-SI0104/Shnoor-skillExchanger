const { GoogleGenAI } = require("@google/genai");
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

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new GoogleGenAI({
    apiKey,
  });
};

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

const generateAIMatches = async ({
  currentUser,
  candidates,
}) => {
  const ai = getGeminiClient();

  if (!ai || candidates.length === 0) {
    return null;
  }

  const candidateData = candidates.map(buildCandidate);

  const currentUserData = buildCandidate({
    ...currentUser,
    uid: currentUser.uid,
  });

  const prompt = `
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
- Return valid JSON matching the requested schema.
`;

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
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
              required: ["uid", "score", "reason"],
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

module.exports = {
  generateAIMatches,
};