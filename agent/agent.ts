// Runs the Company Brain on our own Qwen endpoint (LocalAI or LiteLLM-compatible), not Vercel's AI Gateway.
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { defineAgent } from "eve";

const qwen = createOpenAICompatible({
  name: "qwen",
  baseURL: process.env.LITELLM_BASE_URL!,
  apiKey: process.env.LITELLM_API_KEY,
});

export default defineAgent({
  model: qwen(process.env.QWEN_MODEL ?? "qwen3.8-4b-q4"),
  modelContextWindowTokens: 65_536,
});
