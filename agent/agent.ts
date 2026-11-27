// Picks the model provider from MODEL_PROVIDER: "localai" (default) or "openrouter". Both are OpenAI-compatible endpoints.
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { defineAgent } from "eve";

const providers = {
  localai: {
    baseURL: process.env.LOCALAI_BASE_URL!,
    apiKey: process.env.LOCALAI_API_KEY,
    model: process.env.LOCALAI_MODEL ?? "qwen3.8-4b-q4",
  },
  openrouter: {
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL ?? "qwen/qwen3.6-flash",
  },
} as const;

const choice = (process.env.MODEL_PROVIDER ?? "localai") as keyof typeof providers;
const selected = providers[choice];
if (!selected) throw new Error(`MODEL_PROVIDER must be "localai" or "openrouter", got "${choice}"`);

const client = createOpenAICompatible({ name: choice, baseURL: selected.baseURL, apiKey: selected.apiKey });

export default defineAgent({
  model: client(selected.model),
  modelContextWindowTokens: 65_536,
});
