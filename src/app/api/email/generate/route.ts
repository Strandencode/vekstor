export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getCurrentWorkspace } from "@/lib/get-workspace";
import { incrementUsage } from "@/lib/usage";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Du er en B2B-salgsekspert som skriver kalde e-poster på norsk for norske selskaper.

Skriv en personalisert kald e-post basert på senderens ICP-profil og mottakerens bedriftsinformasjon.

E-posten skal:
- Være kort og konsis (maks 150 ord i brødteksten)
- Ha en personlig åpningslinje basert på mottakers bransje/lokasjon
- Tydelig kommunisere verdiforslag uten å selge hardt
- Avslutte med en enkel CTA (f.eks. be om et kort møte)
- Bruke norsk bokmål

Returner kun JSON med feltene:
{
  "subject": "E-postemne",
  "body": "Brødtekst med linjeskift som \\n"
}`;

export async function POST(req: NextRequest) {
  const ctx = await getCurrentWorkspace();
  if (!ctx) return Response.json({ error: "Ikke innlogget" }, { status: 401 });

  const body = await req.json();
  const { lead, icp } = body;

  if (!lead || !icp) {
    return Response.json({ error: "Mangler lead eller ICP-data" }, { status: 400 });
  }

  const userMessage = `Sender (min info):
- Selskap: ${icp.companyName || "Ukjent"}
- Vi selger: ${icp.whatYouSell || ""}
- Problem vi løser: ${icp.problemYouSolve || ""}
- Sendt av: ${icp.senderName || ""}

Mottaker:
- Selskap: ${lead.name || ""}
- Bransje: ${lead.industry || "Ukjent"}
- Lokasjon: ${lead.municipality || ""}
- Kontakt: ${lead.contactName || "kontaktperson"}

Skriv e-posten.`;

  const stream = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
    stream: true,
  });

  await incrementUsage(ctx.workspace.id, "emailsSent");

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
