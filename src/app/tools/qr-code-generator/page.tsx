import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { QrCodeGeneratorClient } from "@/components/tools/QrCodeGeneratorClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Code Generator - SolutionsBD Tools",
  description: "Create customizable QR codes for URLs, text and more. Free online QR code generator with color and size options.",
};

export default function QrCodeGeneratorPage() {
  return (
    <ToolPageLayout toolId="qr-code-generator">
      <QrCodeGeneratorClient />
    </ToolPageLayout>
  );
}