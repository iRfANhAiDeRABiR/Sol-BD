import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { ImageConverterClient } from "@/components/tools/ImageConverterClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Converter - SolutionsBD Tools",
  description:
    "Convert images between JPG, PNG, and WebP formats instantly. Free online image format converter tool.",
};

export default function ImageConverterPage() {
  return (
    <ToolPageLayout toolId="image-converter">
      <ImageConverterClient />
    </ToolPageLayout>
  );
}