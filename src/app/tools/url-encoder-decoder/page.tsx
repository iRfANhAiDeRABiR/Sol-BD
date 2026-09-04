import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { UrlEncoderDecoderClient } from "@/components/tools/UrlEncoderDecoderClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Encoder/Decoder - SolutionsBD Tools",
  description: "Encode and decode URLs instantly online. Free URL encoding and decoding tool for developers.",
};

export default function UrlEncoderDecoderPage() {
  return (
    <ToolPageLayout toolId="url-encoder-decoder">
      <UrlEncoderDecoderClient />
    </ToolPageLayout>
  );
}