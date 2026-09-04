import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { ThumbnailMakerClient } from "@/components/tools/ThumbnailMakerClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thumbnail Maker - SolutionsBD Tools",
  description:
    "Create YouTube and social media thumbnails with custom text overlays. Free online thumbnail maker with presets for YouTube, Instagram, Twitter, and Facebook.",
};

export default function ThumbnailMakerPage() {
  return (
    <ToolPageLayout toolId="thumbnail-maker">
      <ThumbnailMakerClient />
    </ToolPageLayout>
  );
}