import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { ProfitCalculatorClient } from "@/components/tools/ProfitCalculatorClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profit Calculator - SolutionsBD Tools",
  description: "Calculate profit, loss, margin and markup percentage. Free online business profit calculator tool.",
};

export default function ProfitCalculatorPage() {
  return (
    <ToolPageLayout toolId="profit-calculator">
      <ProfitCalculatorClient />
    </ToolPageLayout>
  );
}