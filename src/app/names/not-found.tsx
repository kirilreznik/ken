import type { Metadata } from "next";
import AuthLayout from "@/components/names/auth/AuthLayout";
import Wordmark from "@/components/names/auth/Wordmark";
import { Button } from "@/components/names/ui";

export const metadata: Metadata = {
  title: "העמוד לא נמצא",
};

/** An unknown /names address: the auth frame (photo, wordmark, glass panel) with one way back. */
export default function NamesNotFound() {
  return (
    <AuthLayout title="העמוד לא נמצא" lead="אולי הקישור השתנה." hero={<Wordmark />}>
      <Button href="/names">לבחירת שם</Button>
    </AuthLayout>
  );
}
