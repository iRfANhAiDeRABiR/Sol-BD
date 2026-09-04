import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { HashtagGeneratorClient } from "@/components/tools/HashtagGeneratorClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hashtag Generator - SolutionsBD Tools",
  description: "Generate relevant hashtags for social media posts instantly. Free AI-powered hashtag generator for Instagram, Twitter and more.",
};

export default function HashtagGeneratorPage() {
  return (
    <ToolPageLayout toolId="hashtag-generator">
      <HashtagGeneratorClient />
    </ToolPageLayout>
  );
}