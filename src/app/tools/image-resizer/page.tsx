import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { ImageResizerClient } from "@/components/tools/ImageResizerClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Resizer - SolutionsBD Tools",
  description:
    "Resize images to custom dimensions with aspect ratio lock. Supports JPG, PNG, WebP. Free online image resizer tool.",
};

export default function ImageResizerPage() {
  return (
    <ToolPageLayout toolId="image-resizer">
      <ImageResizerClient />
    </ToolPageLayout>
  );
}