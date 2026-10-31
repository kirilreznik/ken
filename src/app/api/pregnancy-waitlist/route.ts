import landing from '@/lib/pregnancy-landing.mjs';

export async function POST(request: Request) {
  return landing.fetch(request, {
    OPERATOR_NAME: process.env.PREGNANCY_OPERATOR_NAME,
    CONTACT_EMAIL: process.env.PREGNANCY_CONTACT_EMAIL,
    WAITLIST_WEBHOOK_URL: process.env.PREGNANCY_WAITLIST_WEBHOOK_URL,
    WAITLIST_WEBHOOK_TOKEN: process.env.PREGNANCY_WAITLIST_WEBHOOK_TOKEN,
  });
}
