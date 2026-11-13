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
  { id: "technology", label: "tech", terms: ["react", "typescript", "javascript", "python", "coding", "programming", "software", "website", "app", "api", "database"] },
  { id: "travel", label: "travel", terms: ["travel", "trip", "vacation", "itinerary", "getaway", "hotel", "destination"] },
  { id: "cooking", label: "cooking", terms: ["cooking", "cook", "recipe", "recipes", "meal", "food", "baking", "cuisine"] },
  { id: "books", label: "books", terms: ["book", "books", "novel", "reading", "literature", "character"] },
  { id: "gardening", label: "plants", terms: ["plant", "plants", "gardening", "garden", "houseplant", "flowers"] },
  { id: "writing", label: "writing", terms: ["writing", "write", "story", "email", "essay", "copywriting"] },
  { id: "games", label: "games", terms: ["gaming", "game", "games", "boardgame", "videogame"] },
  { id: "career", label: "career", terms: ["career", "job", "interview", "resume", "workplace", "negotiation"] },
  { id: "design", label: "design", terms: ["design", "visual", "typography", "graphic", "illustration", "interface"] },
] as const;

type Interest = (typeof INTERESTS)[number] | { id: "general"; label: "something new"; terms: readonly string[] };

const GENERAL_INTEREST: Interest = { id: "general", label: "something new", terms: [] };

const PROMPT_TEMPLATES = {
  understand: [
    { id: "foundations", label: "{topic} basics", prompt: "Explain {topic} basics with a practical example." },
    { id: "misconceptions", label: "{topic} myths", prompt: "What are common {topic} myths, and what is true?" },
    { id: "deep-dive", label: "A closer look at {topic}", prompt: "Give me a quick introduction to {topic} and its key ideas." },
    { id: "compare", label: "Compare {topic} approaches", prompt: "Compare useful approaches to {topic}." },
    { id: "questions", label: "Questions about {topic}", prompt: "What should I ask when learning about {topic}?" },
    { id: "real-world", label: "{topic} in practice", prompt: "Show {topic} in a practical everyday example." },
  ],
  create: [
    { id: "starter-plan", label: "{topic} starter plan", prompt: "Make a simple step-by-step plan for {topic}." },
    { id: "project", label: "A {topic} mini project", prompt: "Suggest a small {topic} project I can finish this weekend." },
    { id: "checklist", label: "{topic} checklist", prompt: "Create a short checklist for making progress with {topic}." },
    { id: "routine", label: "{topic} weekly routine", prompt: "Suggest a realistic weekly routine for {topic}." },
    { id: "personal-guide", label: "{topic} learning guide", prompt: "Create a learning guide for my {topic} goals." },
    { id: "challenge", label: "{topic} challenge", prompt: "Give me a hands-on {topic} challenge." },
  ],
  explore: [
    { id: "new-directions", label: "New {topic} ideas", prompt: "What interesting directions could I explore in {topic}?" },
    { id: "connections", label: "{topic} connections", prompt: "Connect {topic} with another useful field." },
    { id: "real-world-uses", label: "{topic} in the real world", prompt: "Share a few surprising real-world uses of {topic}." },
    { id: "recent-ideas", label: "What’s new in {topic}", prompt: "What new ideas are changing how people think about {topic}?" },
    { id: "perspectives", label: "{topic} perspectives", prompt: "Show me three perspectives on {topic}." },
    { id: "next-steps", label: "{topic} next steps", prompt: "Recommend a few useful next steps for exploring {topic}." },
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
