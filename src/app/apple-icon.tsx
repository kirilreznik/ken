import { ImageResponse } from "next/og";
import { KanMark } from "@/components/KanMark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: 180, height: 180, background: "#2f5d4f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <KanMark size={118} />
      </div>
    ),
    size,
  );
}
