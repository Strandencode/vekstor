export interface BRREGCompany {
  organisasjonsnummer: string;
  navn: string;
  naeringskode1?: { kode: string; beskrivelse: string };
  naeringskode2?: { kode: string; beskrivelse: string };
  forretningsadresse?: {
    poststed?: string;
    kommunenummer?: string;
    kommune?: string;
    postnummer?: string;
    adresse?: string[];
  };
  antallAnsatte?: number;
  registreringsdatoEnhetsregisteret?: string;
  stiftelsesdato?: string;
  hjemmeside?: string;
  institusjonellSektorkode?: { kode: string; beskrivelse: string };
}

export interface BRREGSearchResult {
  _embedded?: {
    enheter?: BRREGCompany[];
  };
  page?: {
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

export const NACE_GROUPS = [
  { code: "01", label: "Jordbruk og skogbruk" },
  { code: "41", label: "Bygg og anlegg" },
  { code: "43", label: "Spesialisert byggvirksomhet" },
  { code: "45", label: "Handel med motorvogner" },
  { code: "46", label: "Agentur- og engroshandel" },
  { code: "47", label: "Detaljhandel" },
  { code: "49", label: "Landtransport" },
  { code: "55", label: "Overnattingsvirksomhet" },
  { code: "56", label: "Servering" },
  { code: "62", label: "IT / programvare" },
  { code: "63", label: "Informasjonstjenester" },
  { code: "64", label: "Finansieringsvirksomhet" },
  { code: "68", label: "Eiendom" },
  { code: "69", label: "Juridisk og regnskap" },
  { code: "70", label: "Hovedkontorer og rådgivning" },
  { code: "71", label: "Arkitektur og teknisk konsulentvirksomhet" },
  { code: "72", label: "Forskning og utvikling" },
  { code: "73", label: "Reklame og markedsundersøkelse" },
  { code: "74", label: "Annen faglig og teknisk virksomhet" },
  { code: "77", label: "Utleie og leasing" },
  { code: "78", label: "Arbeidsformidling og bemanningsforetak" },
  { code: "82", label: "Kontortjenester og administrasjon" },
  { code: "85", label: "Undervisning" },
  { code: "86", label: "Helsetjenester" },
];

export async function searchBRREG(params: {
  navn?: string;
  naeringskode?: string;
  kommunenummer?: string;
  antallAnsatteFra?: number;
  antallAnsatteTil?: number;
  page?: number;
  size?: number;
}): Promise<BRREGSearchResult> {
  const url = new URL("https://data.brreg.no/enhetsregisteret/api/enheter");
  if (params.navn) url.searchParams.set("navn", params.navn);
  if (params.naeringskode) url.searchParams.set("naeringskode", params.naeringskode);
  if (params.kommunenummer) url.searchParams.set("kommunenummer", params.kommunenummer);
  if (params.antallAnsatteFra != null) url.searchParams.set("antallAnsatteFra", String(params.antallAnsatteFra));
  if (params.antallAnsatteTil != null) url.searchParams.set("antallAnsatteTil", String(params.antallAnsatteTil));
  url.searchParams.set("size", String(params.size ?? 50));
  url.searchParams.set("page", String(params.page ?? 0));

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`BRREG error: ${res.status}`);
  return res.json();
}
