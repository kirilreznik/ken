import landing from '@/lib/pregnancy-landing.mjs';

// Render a standalone document: do not mount the app's auth, medical data,
// analytics or offline providers on the public landing page.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return landing.fetch(request, {
    OPERATOR_NAME: process.env.PREGNANCY_OPERATOR_NAME,
    CONTACT_EMAIL: process.env.PREGNANCY_CONTACT_EMAIL,
    WAITLIST_WEBHOOK_URL: process.env.PREGNANCY_WAITLIST_WEBHOOK_URL,
  });
}

export const HEAD = GET;
