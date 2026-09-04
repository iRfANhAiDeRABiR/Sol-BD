import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { PdfEditorClient } from "@/components/tools/PdfEditorClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Editor - SolutionsBD Tools",
  description:
    "Edit, annotate, draw, sign, highlight, and redact PDF documents online for free. All processing happens locally in your browser.",
};

export default function PdfEditorPage() {
  return (
    <ToolPageLayout toolId="pdf-editor">
      <PdfEditorClient />
    </ToolPageLayout>
  );
}
