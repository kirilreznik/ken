import Image from "next/image";

/** The Nest wordmark above an auth panel (welcome, sign-in, onboarding, join, 404, offline). */
export default function Wordmark() {
  return <Image src="/names/brand/nest-wordmark.svg" alt="Nest" width={85} height={32} priority unoptimized className="self-center" />;
}
