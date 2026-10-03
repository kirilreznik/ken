import { ImageResponse } from "next/og";
import { KanMark } from "@/components/KanMark";

export async function GET(req: Request, ctx: { params: Promise<{ size: string }> }) {
  const { size: raw } = await ctx.params;
  const size = Math.min(1024, Math.max(48, parseInt(raw, 10) || 512));
  const maskable = new URL(req.url).searchParams.has("maskable");
  const mark = Math.round(size * (maskable ? 0.5 : 0.66));
  return new ImageResponse(
    (
      <div style={{ width: size, height: size, background: "#2f5d4f", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: maskable ? 0 : size * 0.22 }}>
        <KanMark size={mark} />
      </div>
    ),
    { width: size, height: size },
  );
}
