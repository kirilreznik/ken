import { getAdmin } from "@/lib/names/server/admin";
import { getCatalog } from "@/lib/names/server/aiCatalog";
import { createAiDeck, createAiQuota } from "@/lib/names/server/aiDeck";
import { getModelCaller } from "@/lib/names/server/aiModel";

// Node runtime; ANTHROPIC_API_KEY and the service-role key never leave the server.
export const maxDuration = 60;

export const POST = createAiDeck({
  getAdmin,
  getCatalog,
  callModel: getModelCaller(),
  enabled: () => process.env.NAMES_AI_ENABLED === "true",
});

const enabled = () => process.env.NAMES_AI_ENABLED === "true";

export const GET = createAiQuota({ getAdmin, enabled });
