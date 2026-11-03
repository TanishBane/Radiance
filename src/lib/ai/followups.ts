import { generateText } from "ai";
import { getModelInstance } from "./providers";
import { AVAILABLE_MODELS } from "./models";

/**
 * Generates 3 contextual follow-up questions based on the last conversation turn.
 * Solves legacy BUG-01 by properly passing the turn to the model.
 */
export async function generateFollowupQuestions(
  userTurn: string,
  assistantReply: string
): Promise<string[]> {
  try {
    const fastModel = AVAILABLE_MODELS.find((m) => m.provider === "groq") || AVAILABLE_MODELS[0];
    const model = getModelInstance(fastModel);

    const prompt =
      `CONVERSATION TURN:\n` +
      `User: "${userTurn.slice(0, 300)}"\n` +
      `Assistant: "${assistantReply.slice(0, 500)}"\n\n` +
      `Generate exactly 3 follow-up questions the user might genuinely ask NEXT on this exact topic. ` +
      `Return ONLY a valid JSON array of 3 strings: ["Question 1?", "Question 2?", "Question 3?"]`;

    const result = await generateText({
      model,
      system:
        "You generate contextually relevant next questions for a chat interface. " +
        "Return ONLY a raw JSON array of 3 strings with zero markdown, preamble, or commentary.",
      prompt,
      temperature: 0.4,
    });

    const clean = result.text.trim();
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 3).map((q) => String(q).trim());
    }
    return [];
  } catch {
    return [];
  }
}

export const generateFollowUpQuestions = (reply: string, _tone?: string, _language?: string) =>
  generateFollowupQuestions("", reply);
