// Holt einen Auftrag über seine Auftrags-ID aus HubSpot. Nur lesend, nur für die Agentur.
// Der Schlüssel liegt als Secret HUBSPOT_TOKEN in Supabase und verlässt diese Funktion nie.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEAL_PROPS = [
  "dealname", "dealstage", "pipeline", "auftrags_id", "starthafen", "zielhafen", "wann",
  "bootstyp", "bootsname", "bootskennzeichen", "baujahr", "lange", "breite", "tiefgang",
  "entfernung", "segeltage", "tage_hafentage", "ein__ausklarieren", "tage_gesamt", "min_einsatztage", "max_einsatztage", "keine_mwst",
  "tagessatz_skipper", "skipper_bekommt__netto__pro_tag", "heuer_netto", "heuer_brutto", "logistikpauschale_netto", "bearbeitungspauschale",
  "bordkasse", "reisekosten", "verpflegungskosten", "angebot_netto", "angebot_uberfuhrung_brutto", "anzahlung", "restzahlung",
];
const CONTACT_PROPS = ["firstname", "lastname", "email", "phone", "mobilephone", "address", "zip", "city", "country"];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const text = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const num = (v: unknown) => {
  if (v == null || v === "") return null;
  const n = Number(String(v).replace(/[^\d,.-]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

async function hubspot(path: string, token: string, init?: RequestInit) {
  const r = await fetch("https://api.hubapi.com" + path, {
    ...init,
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
  });
  const body = await r.json().catch(() => null);
  return { ok: r.ok, status: r.status, body };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Nur POST." }, 405);

  // Wer fragt? Nur ein angemeldetes Agentur-Konto darf abrufen.
  const auth = req.headers.get("Authorization") ?? "";
  const base = Deno.env.get("SUPABASE_URL")!;
  const apikey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const who = await fetch(base + "/auth/v1/user", { headers: { Authorization: auth, apikey } });
  if (!who.ok) return json({ error: "Bitte neu anmelden." }, 401);
  const user = await who.json();
  const prof = await fetch(`${base}/rest/v1/profiles?select=role&id=eq.${user.id}`, { headers: { Authorization: auth, apikey } });
  const rows = prof.ok ? await prof.json() : [];
  if (rows?.[0]?.role !== "agentur") return json({ error: "Nur die Agentur kann Aufträge aus HubSpot holen." }, 403);

  const token = Deno.env.get("HUBSPOT_TOKEN");
  if (!token) return json({ error: "Der HubSpot-Schlüssel ist in Supabase nicht hinterlegt." }, 500);

  const input = await req.json().catch(() => ({}));
  const orderNo = String(input?.auftrags_id ?? "").trim();
  if (!/^\d{1,12}$/.test(orderNo)) return json({ error: "Bitte die Auftrags-ID als Zahl eingeben." }, 400);

  const search = await hubspot("/crm/v3/objects/deals/search", token, {
    method: "POST",
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: "auftrags_id", operator: "EQ", value: orderNo }] }],
      properties: DEAL_PROPS,
      limit: 5,
    }),
  });
  if (!search.ok) {
    console.error("HubSpot-Suche fehlgeschlagen", search.status, search.body?.category, search.body?.message);
    const why = search.status === 401 ? "HubSpot lehnt den Schlüssel ab." : search.status === 403 ? "Dem Schlüssel fehlt das Leserecht für Deals." : "HubSpot hat nicht geantwortet (Fehler " + search.status + ").";
    return json({ error: why }, 502);
  }
  const found = search.body?.results ?? [];
  if (found.length === 0) return json({ error: `Zur Auftrags-ID ${orderNo} gibt es in HubSpot keinen Deal.` }, 404);
  if (found.length > 1) return json({ error: `Die Auftrags-ID ${orderNo} ist in HubSpot ${found.length}-mal vergeben. Bitte dort bereinigen.` }, 409);

  const deal = found[0];
  const p = deal.properties ?? {};

  // Am Deal hängen oft mehrere Kontakte (Eigner, Skipper, Crew). Die Agentur wählt in der App, wer der Eigner ist.
  const contacts: Record<string, unknown>[] = [];
  let contactNote: string | null = null;
  const assoc = await hubspot(`/crm/v4/objects/deals/${deal.id}/associations/contacts`, token);
  if (!assoc.ok) {
    console.error("Kontakt-Verknüpfung fehlgeschlagen", assoc.status, assoc.body?.message);
    contactNote = "Die Kontakte zum Deal konnten nicht gelesen werden.";
  } else {
    const links = (assoc.body?.results ?? []).slice(0, 10) as { toObjectId: number; associationTypes?: { label?: string | null }[] }[];
    if (links.length === 0) contactNote = "Am Deal hängt kein Kontakt.";
    for (const link of links) {
      const c = await hubspot(`/crm/v3/objects/contacts/${link.toObjectId}?properties=${CONTACT_PROPS.join(",")}`, token);
      if (!c.ok) { contactNote = "Ein Kontakt zum Deal konnte nicht gelesen werden."; continue; }
      const q = c.body?.properties ?? {};
      contacts.push({
        id: String(link.toObjectId),
        label: (link.associationTypes ?? []).map((t) => t.label).filter(Boolean).join(", ") || null,
        name: [text(q.firstname), text(q.lastname)].filter(Boolean).join(" ") || null,
        email: text(q.email),
        phone: text(q.phone) ?? text(q.mobilephone),
        address: [text(q.address), [text(q.zip), text(q.city)].filter(Boolean).join(" ") || null, text(q.country)].filter(Boolean).join(", ") || null,
      });
    }
  }

  return json({
    deal_id: String(deal.id),
    order_no: orderNo,
    stage: text(p.dealstage),
    pipeline: text(p.pipeline),
    route: { from: text(p.starthafen), to: text(p.zielhafen), when: text(p.wann) },
    boat: {
      type: text(p.bootstyp), name: text(p.bootsname), registration_no: text(p.bootskennzeichen),
      year_built: num(p.baujahr), length_m: num(p.lange), beam_m: num(p.breite), draft_m: num(p.tiefgang),
    },
    contacts,
    contacts_note: contactNote,
    terms: {
      entfernung_sm: num(p.entfernung), segeltage: num(p.segeltage), hafentage: num(p.tage_hafentage), klarieren: num(p.ein__ausklarieren),
      tage_gesamt: num(p.tage_gesamt), min_tage: num(p.min_einsatztage), max_tage: num(p.max_einsatztage), tage_ohne_mwst: num(p.keine_mwst),
      tagessatz_kunde: num(p.tagessatz_skipper), tagessatz_skipper: num(p.skipper_bekommt__netto__pro_tag),
      honorar_netto: num(p.heuer_netto), honorar_brutto: num(p.heuer_brutto),
      logistikpauschale: num(p.logistikpauschale_netto), adminpauschale: num(p.bearbeitungspauschale),
      bordkasse: num(p.bordkasse), reisekosten: num(p.reisekosten), verpflegung: num(p.verpflegungskosten),
      angebot_netto: num(p.angebot_netto), angebot_brutto: num(p.angebot_uberfuhrung_brutto),
      anzahlung: num(p.anzahlung), restzahlung: num(p.restzahlung),
    },
  });
});
