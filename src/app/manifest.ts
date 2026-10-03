import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "קן — ההריון שלכם",
    short_name: "קן",
    description: "ההריון שלכם, במקום אחד",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    dir: "rtl",
    lang: "he",
    background_color: "#f5f1eb",
    theme_color: "#f5f1eb",
    // Android: "Share → קן" (handled by the service worker, then /share).
    share_target: {
      action: "/share-target",
      method: "POST",
      enctype: "multipart/form-data",
      params: { title: "title", text: "text", url: "url", files: [{ name: "file", accept: ["image/*"] }] },
    },
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512?maskable=1", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
