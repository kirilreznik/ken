import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { CallModel, ModelReply } from "./aiDeck";
import { OUTPUT_SCHEMA } from "./aiPrompt";

export const DEFAULT_MODEL = "claude-opus-5-5";

/** US dollars per million tokens: input, output, cache write (1 h), cache read. */
const PRICES: Record<string, { input: number; output: number; write1h: number; read: number }> = {
  "claude-opus-5-5": { input: 4, output: 20, write1h: 8, read: 0.2 },
  "claude-sonnet-5-5": { input: 2, output: 10, write1h: 4, read: 0.1 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5, write1h: 0.2, read: 0.01 },
};

type Usage = {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
};

/** What a call cost, from its usage (unknown models are priced as Opus 5.5, the dearest we use). */
export function costUsd(model: string, usage: Usage): number {
  const p = PRICES[model] ?? PRICES[DEFAULT_MODEL];
  const m = 1_000_000;
  return (
    ((usage.input_tokens ?? 0) * p.input +
      (usage.output_tokens ?? 0) * p.output +
      (usage.cache_creation_input_tokens ?? 0) * p.write1h +
      (usage.cache_read_input_tokens ?? 0) * p.read) /
    m
  );
}

let client: Anthropic | null = null;

/**
 * The model call for the AI deck, or null when ANTHROPIC_API_KEY is missing. The system block
 * (instructions + catalog) is cached for an hour; effort is low (it's a ranking, not a puzzle);
 * the answer must match OUTPUT_SCHEMA; a refusal falls back server-side to a model that may
 * answer, and a final refusal reads as "unsafe".
 */
export function getModelCaller(env: Record<string, string | undefined> = process.env): CallModel | null {
  const apiKey = env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) return null;
  const model = env.NAMES_AI_MODEL?.trim() || DEFAULT_MODEL;
  client ??= new Anthropic({ apiKey, timeout: 40_000, maxRetries: 1 });
  const anthropic = client;

  return async (system: string, user: string): Promise<ModelReply> => {
    const response = await anthropic.beta.messages.create({
      model,
      max_tokens: 8000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral", ttl: "1h" } }],
      messages: [{ role: "user", content: user }],
      output_config: { effort: "low", format: { type: "json_schema", schema: OUTPUT_SCHEMA as unknown as Record<string, unknown> } },
    });
    const usd = costUsd(response.model, response.usage);
    if (response.stop_reason === "refusal") return { json: null, refused: true, usd, model: response.model };
    if (response.stop_reason === "max_tokens") throw Object.assign(new Error("max_tokens"), { status: 0 });
    let text = "";
    for (const block of response.content) if (block.type === "text") text += block.text;
    return { json: text, refused: false, usd, model: response.model };
  };
}
