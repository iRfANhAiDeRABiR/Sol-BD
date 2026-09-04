import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { Base64EncoderClient } from "@/components/tools/Base64EncoderClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Base64 Encoder/Decoder - SolutionsBD Tools",
  description: "Encode and decode Base64 text online. Free Base64 encoding and decoding tool with UTF-8 support.",
};

export default function Base64EncoderPage() {
  return (
    <ToolPageLayout toolId="base64-encoder">
      <Base64EncoderClient />
    </ToolPageLayout>
  );
}