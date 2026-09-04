import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { MemeGeneratorClient } from "@/components/tools/MemeGeneratorClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meme Generator - SolutionsBD Tools",
  description:
    "Create funny memes with custom top and bottom text. Free online meme generator with customizable fonts and colors.",
};

export default function MemeGeneratorPage() {
  return (
    <ToolPageLayout toolId="meme-generator">
      <MemeGeneratorClient />
    </ToolPageLayout>
  );
}