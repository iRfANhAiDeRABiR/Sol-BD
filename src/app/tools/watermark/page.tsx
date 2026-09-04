import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { WatermarkClient } from "@/components/tools/WatermarkClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watermark Tool - SolutionsBD Tools",
  description:
    "Add text watermarks to images with customizable position, size, color, opacity and rotation. Free online watermark tool.",
};

export default function WatermarkPage() {
  return (
    <ToolPageLayout toolId="watermark">
      <WatermarkClient />
    </ToolPageLayout>
  );
}