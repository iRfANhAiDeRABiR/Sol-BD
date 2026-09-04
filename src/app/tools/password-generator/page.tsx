import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { PasswordGeneratorClient } from "@/components/tools/PasswordGeneratorClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Password Generator - SolutionsBD Tools",
  description: "Generate strong, secure passwords with customizable length and character types. Free online password generator tool.",
};

export default function PasswordGeneratorPage() {
  return (
    <ToolPageLayout toolId="password-generator">
      <PasswordGeneratorClient />
    </ToolPageLayout>
  );
}