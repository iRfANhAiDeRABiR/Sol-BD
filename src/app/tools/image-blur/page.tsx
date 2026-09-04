import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { ImageBlurClient } from "@/components/tools/ImageBlurClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Blur Tool - SolutionsBD Tools",
  description:
    "Apply blur effects to images with adjustable strength. Free online image blur tool with presets.",
};

export default function ImageBlurPage() {
  return (
    <ToolPageLayout toolId="image-blur">
      <ImageBlurClient />
    </ToolPageLayout>
  );
}