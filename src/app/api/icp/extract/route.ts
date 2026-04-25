export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getCurrentWorkspace } from "@/lib/get-workspace";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Du er en B2B-salgsekspert som hjelper norske selskaper å definere sitt ideelle kundeprofil (ICP).

Basert på informasjonen brukeren gir om sitt eget selskap, skal du foreslå konkrete, realistiske verdier for ICP-skjemaet.

Returner svar som gyldig JSON med disse feltene:
{
  "targetIndustries": "kommaseparert liste med 3-5 bransjer",
  "targetSize": "f.eks. 10–200 ansatte",
  "targetGeography": "f.eks. Oslo, Bergen, Trondheim",
  "targetRevenue": "f.eks. 5–50 MNOK",
  "problemYouSolve": "ett avsnitt om problemet du løser",
  "decisionMakerTitle": "f.eks. Daglig leder, IT-sjef",
  "decisionMakerPainPoints": "2-3 punkter adskilt med semikolon"
}

Vær spesifikk og praktisk. Unngå generiske svar.`;

export async function POST(req: NextRequest) {
  const ctx = await getCurrentWorkspace();
  if (!ctx) return Response.json({ error: "Ikke innlogget" }, { status: 401 });

  const body = await req.json();
  const { companyName, whatYouSell, currentCustomers } = body;

  if (!whatYouSell) {
    return Response.json({ error: "Mangler informasjon" }, { status: 400 });
  }

  const userMessage = `Mitt selskap: ${companyName || "Ukjent"}
Vi selger: ${whatYouSell}
Nåværende kunder: ${currentCustomers || "Ikke oppgitt"}

Foreslå ICP-verdier for oss.`;

  const stream = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
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
