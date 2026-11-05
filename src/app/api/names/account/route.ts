import { getAdmin } from "@/lib/names/server/admin";
import { createDeleteAccount } from "@/lib/names/server/deleteAccount";

// Node runtime (the default); the service-role key never leaves the server.
export const DELETE = createDeleteAccount({ getAdmin });
