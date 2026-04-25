export const dynamic = "force-dynamic";
export const maxDuration = 15;

import { NextRequest } from "next/server";
import { getCurrentWorkspace } from "@/lib/get-workspace";
import { incrementUsage } from "@/lib/usage";

const SUBPAGES = ["/kontakt", "/contact", "/om-oss", "/about", "/about-us", "/kontaktoss"];
const MAX_BYTES = 500_000;
const TIMEOUT_MS = 4500;

export async function GET(req: NextRequest) {
  const ctx = await getCurrentWorkspace();
  if (!ctx) return Response.json({ error: "Ikke innlogget" }, { status: 401 });

  const website = req.nextUrl.searchParams.get("website");
  if (!website) return Response.json({ error: "website parameter required" }, { status: 400 });

  let normalized = website.trim();
  if (!/^https?:\/\//i.test(normalized)) normalized = "https://" + normalized;

  let baseUrl: URL;
  try {
    baseUrl = new URL(normalized);
  } catch {
    return Response.json({ error: "invalid website URL" }, { status: 400 });
  }

  try {
    const result = await scrapeSite(baseUrl);
    await incrementUsage(ctx.workspace.id, "enrichments");
    return Response.json(result);
  } catch (err) {
    return Response.json({
      website: baseUrl.toString(),
      emails: [],
      phones: [],
      error: err instanceof Error ? err.message : "scrape failed",
    });
  }
}

async function scrapeSite(baseUrl: URL) {
  const emails = new Set<string>();
  const phones = new Set<string>();
  const pagesChecked: string[] = [];

  const urls = [baseUrl.origin + baseUrl.pathname, ...SUBPAGES.map((s) => baseUrl.origin + s)];
  const seen = new Set<string>();

  for (const url of urls) {
    if (seen.has(url)) continue;
    seen.add(url);
    const result = await fetchPage(url);
    if (result.ok && result.html) {
      pagesChecked.push(url);
      extractContacts(result.html, emails, phones, baseUrl.hostname);
      if (emails.size >= 3 && phones.size >= 2 && pagesChecked.length >= 2) break;
    }
  }

  return {
    website: baseUrl.toString(),
    emails: Array.from(emails),
    phones: Array.from(phones),
    pagesChecked,
  };
}

async function fetchPage(url: string): Promise<{ ok: boolean; html?: string }> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const resp = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VekstorBot/1.0)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "nb,en;q=0.8",
      },
      signal: controller.signal,
    });
    clearTimeout(t);

    if (!resp.ok) return { ok: false };
    const ct = resp.headers.get("content-type") ?? "";
    if (!ct.includes("text/html") && !ct.includes("xml")) return { ok: false };

    const reader = resp.body?.getReader();
    if (!reader) {
      const html = await resp.text();
      return { ok: true, html: html.slice(0, MAX_BYTES) };
    }
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (total < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.byteLength;
    }
    try { reader.cancel(); } catch {}
    const html = new TextDecoder("utf-8", { fatal: false }).decode(concatChunks(chunks));
    return { ok: true, html };
  } catch {
    return { ok: false };
  }
}

function concatChunks(chunks: Uint8Array[]) {
  let len = 0;
  for (const c of chunks) len += c.byteLength;
  const out = new Uint8Array(len);
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.byteLength; }
  return out;
}

function extractContacts(html: string, emails: Set<string>, phones: Set<string>, hostname: string) {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");

  const mailtoRe = /mailto:([^"'?\s<>]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = mailtoRe.exec(cleaned)) !== null) addEmail(m[1], emails, hostname);

  const emailRe = /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g;
  while ((m = emailRe.exec(cleaned)) !== null) addEmail(m[0], emails, hostname);

  const telRe = /tel:([+\d\s\-().]+)/gi;
  while ((m = telRe.exec(cleaned)) !== null) {
    const num = normalizePhone(m[1]);
    if (num) phones.add(num);
  }

  const textPhoneRe = /(?:\+?\s?47[\s-]?)?(?:\d[\s\-.()]?){7,11}\d/g;
  while ((m = textPhoneRe.exec(cleaned)) !== null) {
    const num = normalizePhone(m[0]);
    if (num) phones.add(num);
  }
}

function addEmail(raw: string, emails: Set<string>, _hostname: string) {
  if (!raw) return;
  let email = raw.trim().toLowerCase().replace(/^mailto:/, "");
  email = email.split("?")[0].split("#")[0].trim();
  if (!/^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/.test(email)) return;
  if (email.length > 80) return;
  const junk = [
    /@(example|domain|yourdomain|test|localhost)\./,
    /@(sentry\.io|wixpress|jquery|w3\.org|schema\.org|googletagmanager)/,
    /\.(png|jpg|jpeg|gif|svg|webp|css|js|woff2?|ttf|ico)$/,
    /^(sentry|wixpress|no-reply|noreply|donotreply)@/,
  ];
  if (junk.some((re) => re.test(email))) return;
  emails.add(email);
}

function normalizePhone(raw: string): string | null {
  if (!raw) return null;
  let num = raw.replace(/[^\d+]/g, "");
  if (num.startsWith("+47")) num = num.slice(3);
  if (num.length === 8 && /^[2-9]/.test(num)) {
    return num.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4");
  }
  if (num.length >= 10 && num.length <= 13) return num;
  return null;
}
