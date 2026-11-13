import type { Conversation } from "@/lib/types/chat";

export interface SuggestionItem {
  id: string;
  label: string;
  prompt: string;
}

export interface SuggestionColumn {
  id: string;
  title: string;
  headerThemeRole: "accentB" | "gradient" | "accentC";
  items: SuggestionItem[];
}

export const WELCOME_SUGGESTIONS_STORAGE_KEY = "radiance_welcome_suggestion_ids";

const INTERESTS = [
  { id: "technology", label: "software and technology", terms: ["react", "typescript", "javascript", "python", "coding", "programming", "software", "website", "app", "api", "database"] },
  { id: "travel", label: "travel and destinations", terms: ["travel", "trip", "vacation", "itinerary", "getaway", "hotel", "destination"] },
  { id: "cooking", label: "cooking and food", terms: ["cooking", "cook", "recipe", "recipes", "meal", "food", "baking", "cuisine"] },
  { id: "books", label: "books and reading", terms: ["book", "books", "novel", "reading", "literature", "character"] },
  { id: "gardening", label: "gardening and plants", terms: ["plant", "plants", "gardening", "garden", "houseplant", "flowers"] },
  { id: "writing", label: "writing and storytelling", terms: ["writing", "write", "story", "email", "essay", "copywriting"] },
  { id: "games", label: "games and play", terms: ["gaming", "game", "games", "boardgame", "videogame"] },
  { id: "career", label: "work and career growth", terms: ["career", "job", "interview", "resume", "workplace", "negotiation"] },
  { id: "design", label: "design and visual ideas", terms: ["design", "visual", "typography", "graphic", "illustration", "interface"] },
] as const;

type Interest = (typeof INTERESTS)[number] | { id: "general"; label: "something new"; terms: readonly string[] };

const GENERAL_INTEREST: Interest = { id: "general", label: "something new", terms: [] };

const PROMPT_TEMPLATES = {
  understand: [
    { id: "foundations", label: "the foundations of {topic}", prompt: "Explain the foundations of {topic} with one clear, practical example." },
    { id: "misconceptions", label: "common misconceptions about {topic}", prompt: "What are common misconceptions about {topic}, and what is more accurate?" },
    { id: "deep-dive", label: "a deeper look at {topic}", prompt: "Give me a thoughtful introduction to {topic}, from the basics to the key details." },
    { id: "compare", label: "how parts of {topic} compare", prompt: "Compare the main approaches to {topic} and explain when each is useful." },
    { id: "questions", label: "questions worth asking about {topic}", prompt: "What are three useful questions to ask when learning about {topic}?" },
    { id: "real-world", label: "{topic} in everyday use", prompt: "Show how {topic} works in a realistic everyday situation." },
  ],
  create: [
    { id: "starter-plan", label: "a practical {topic} plan", prompt: "Make me a simple, step-by-step plan to get started with {topic}." },
    { id: "project", label: "a small {topic} project", prompt: "Suggest a small project involving {topic} that I can finish in a weekend." },
    { id: "checklist", label: "a {topic} checklist", prompt: "Create a concise checklist to help me make progress with {topic}." },
    { id: "routine", label: "a routine for {topic}", prompt: "Design a realistic weekly routine for practicing or exploring {topic}." },
    { id: "personal-guide", label: "a guide tailored to my {topic} goals", prompt: "Help me turn an interest in {topic} into a clear personal learning guide." },
    { id: "challenge", label: "a hands-on {topic} challenge", prompt: "Give me a hands-on challenge involving {topic}, with hints and a way to review my result." },
  ],
  explore: [
    { id: "new-directions", label: "new directions in {topic}", prompt: "What are some interesting directions to explore next in {topic}?" },
    { id: "connections", label: "unexpected connections to {topic}", prompt: "Connect {topic} to another field in a surprising but useful way." },
    { id: "real-world-uses", label: "real-world uses for {topic}", prompt: "Share a few lesser-known real-world uses of {topic}." },
    { id: "recent-ideas", label: "ideas changing {topic}", prompt: "What new ideas or approaches are changing how people think about {topic}?" },
    { id: "perspectives", label: "different perspectives on {topic}", prompt: "Show me three different perspectives on {topic} and what each helps explain." },
    { id: "next-steps", label: "where to go next with {topic}", prompt: "Recommend a few worthwhile next steps for someone curious about {topic}." },
  ],
} as const;

const COLUMN_META = [
  { id: "understand", title: "Understand", headerThemeRole: "accentB" },
  { id: "create", title: "Create", headerThemeRole: "gradient" },
  { id: "explore", title: "Explore", headerThemeRole: "accentC" },
] as const;

function rankInterests(conversations: Conversation[]): Interest[] {
  const scores = new Map<string, { interest: Interest; score: number; lastSeen: number }>();
  const messages = conversations.flatMap((conversation) => conversation.messages)
    .filter((message) => message.role === "user")
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 100);

  messages.forEach((message, index) => {
    const text = message.content.toLocaleLowerCase();
    for (const interest of INTERESTS) {
      const matches = interest.terms.filter((term) =>
        new RegExp(`(^|[^\\p{L}\\p{N}])${term}($|[^\\p{L}\\p{N}])`, "u").test(text)
      ).length;
      if (!matches) continue;
      const current = scores.get(interest.id) || { interest, score: 0, lastSeen: index };
      current.score += matches / (1 + index * 0.04);
      current.lastSeen = Math.min(current.lastSeen, index);
      scores.set(interest.id, current);
    }
  });

  return [...scores.values()]
    .sort((a, b) => b.score - a.score || a.lastSeen - b.lastSeen)
    .map(({ interest }) => interest);
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const pick = Math.min(index, Math.max(0, Math.floor(random() * (index + 1))));
    [result[index], result[pick]] = [result[pick], result[index]];
  }
  return result;
}

export function createWelcomeSuggestions(
  conversations: Conversation[],
  previousIds: string[] = [],
  random: () => number = Math.random
): SuggestionColumn[] {
  const rankedInterests = rankInterests(conversations);
  const seen = new Set(previousIds);

  return COLUMN_META.map((column, columnIndex) => {
    const interest = rankedInterests[columnIndex] || rankedInterests[0] || GENERAL_INTEREST;
    const templates = PROMPT_TEMPLATES[column.id as keyof typeof PROMPT_TEMPLATES];
    const candidates = templates.filter((template) => !seen.has(`${column.id}:${interest.id}:${template.id}`));
    const selected = shuffle(candidates.length >= 3 ? candidates : templates, random).slice(0, 3);

    return {
      ...column,
      items: selected.map((template) => {
        const topic = interest.label;
        return {
          id: `${column.id}:${interest.id}:${template.id}`,
          label: template.label.replaceAll("{topic}", topic),
          prompt: template.prompt.replaceAll("{topic}", topic),
        };
      }),
    };
  });
}

export const SUGGESTION_COLUMNS = createWelcomeSuggestions([], [], () => 0);
