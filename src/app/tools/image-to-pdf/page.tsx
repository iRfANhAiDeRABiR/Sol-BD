import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { ImageToPdfClient } from "@/components/tools/ImageToPdfClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image to PDF - SolutionsBD Tools",
  description:
    "Convert multiple images to a single PDF document. Supports JPG, PNG, GIF, WebP with A4 or fit-to-image page sizing. Free online image to PDF converter.",
};

export default function ImageToPdfPage() {
  return (
    <ToolPageLayout toolId="image-to-pdf">
      <ImageToPdfClient />
    </ToolPageLayout>
  );
}