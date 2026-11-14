import { getAdmin } from "@/lib/names/server/admin";
import { createFeedback, resendNotifier } from "@/lib/names/server/feedback";

// Node runtime; the service-role key and the Resend key never leave the server.
export const POST = createFeedback({ getAdmin, notify: resendNotifier() });
