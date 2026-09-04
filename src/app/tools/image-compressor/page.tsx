import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { ImageCompressorClient } from "@/components/tools/ImageCompressorClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Compressor - SolutionsBD Tools",
  description:
    "Compress images to reduce file size while maintaining quality. Supports JPG, PNG, WebP. Free online image compression tool.",
};

export default function ImageCompressorPage() {
  return (
    <ToolPageLayout toolId="image-compressor">
      <ImageCompressorClient />
    </ToolPageLayout>
  );
}