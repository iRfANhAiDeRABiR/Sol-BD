import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { AgeCalculatorClient } from "@/components/tools/AgeCalculatorClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Age Calculator - SolutionsBD Tools",
  description: "Calculate exact age in years, months and days from date of birth. Free online age calculator tool.",
};

export default function AgeCalculatorPage() {
  return (
    <ToolPageLayout toolId="age-calculator">
      <AgeCalculatorClient />
    </ToolPageLayout>
  );
}