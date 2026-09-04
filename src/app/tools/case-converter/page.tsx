import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { CaseConverterClient } from "@/components/tools/CaseConverterClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Converter - SolutionsBD Tools",
  description: "Convert text between uppercase, lowercase, title case, sentence case and more. Free online text case conversion tool.",
};

export default function CaseConverterPage() {
  return (
    <ToolPageLayout toolId="case-converter">
      <CaseConverterClient />
    </ToolPageLayout>
  );
}