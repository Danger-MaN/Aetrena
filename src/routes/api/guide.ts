import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";

type Body = {
  lang?: string;
  world?: string;
  persona?: string;
  objectId?: string;
  query?: string;
};

const LANG_NAMES: Record<string, string> = {
  ar: "Arabic (فصحى مبسّطة)",
  en: "English",
  fr: "French",
  es: "Spanish",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  tr: "Turkish",
  fa: "Persian (Farsi)",
  ur: "Urdu",
  he: "Hebrew",
  hi: "Hindi",
  zh: "Mandarin Chinese (Simplified)",
  ja: "Japanese",
  ko: "Korean",
  id: "Indonesian",
  nl: "Dutch",
  pl: "Polish",
  sv: "Swedish",
};

const personas: Record<string, { name: string; role: string; tone: string }> = {
  senebi: {
    name: "Senebi",
    role: "an Egyptian royal scribe of the New Kingdom, scholar of hieroglyphs and history",
    tone: "warm, eloquent, slightly poetic, in-character; never break the fourth wall",
  },
  thalassa: {
    name: "Thalassa",
    role: "an Atlantean keeper of the deep, guardian of crystal lore and tides",
    tone: "calm, mysterious, oceanic; speaks as if currents carry her voice",
  },
  lorenzo: {
    name: "Lorenzo",
    role: "a Florentine curator and humanist of the High Renaissance, friend to painters and sculptors",
    tone: "refined, passionate, generous with anecdotes about masters and workshops",
  },
  ada: {
    name: "Ada",
    role: "a contemporary museum curator specializing in art and technology",
    tone: "sharp, curious, conversational; treats every object as a question worth asking",
  },
};

const artifacts: Record<string, string> = {
  rosetta:
    "the Rosetta Stone — a granodiorite stele bearing a decree of Ptolemy V (196 BCE) inscribed in hieroglyphic, demotic, and Greek; it became the key that unlocked all of ancient Egypt's writing.",
  pottery:
    "a painted ceramic vessel from a household of Thebes, used to store grain and olive oil; the painted bands depict the Nile flood and offerings to Hapi.",
  statue:
    "a limestone statue of the seated scribe, palm leaves of papyrus across the lap, eyes inlaid with quartz — a monument to literacy as a sacred craft.",
  ankh:
    "the Ankh — the symbol of eternal life, carried in the hand of every god in tomb paintings, signifying the breath that animates body and soul.",
  // Atlantis
  trident:
    "the Trident of the Sea King — a bronze-and-orichalcum spear said to still the tides; bearers were judged by the deep before being allowed to lift it.",
  crystal_core:
    "a resonant crystal that once powered the citadel; struck gently it hums in three tones, the same chord recorded in the city's oldest hymns.",
  tablet:
    "an Atlantean tablet of glyphs that flow like water; scholars believe each line is a tidal cycle, not a sentence.",
  coral_throne:
    "the Coral Throne, grown rather than carved, where the council of nine convened to debate the fate of the city before the sea took it.",
  // Renaissance
  vitruvian:
    "a Vitruvian sketch in red chalk, exploring the proportions of the human body as a microcosm of divine geometry.",
  david_bust:
    "a marble bust in the manner of Michelangelo's workshop — note the unfinished hair, a deliberate trace of the chisel left to honor the stone.",
  fresco:
    "a fresco panel showing the Annunciation, painted in the giornate technique; the seams between days are still visible if you look close.",
  manuscript:
    "an illuminated manuscript bound in calfskin, its initial letters gilded with leaf so thin a breath could lift it.",
  // Modern
  neon_sculpture:
    "a neon sculpture by a contemporary artist that maps the city's heartbeat in argon and mercury vapor; the colors shift with traffic data.",
  ai_portrait:
    "an AI-generated portrait whose subject does not exist; the artist trained the model on their own diary entries for a year.",
  kinetic_orb:
    "a kinetic orb that rotates only when observed — a small motion sensor in the base means it stages a quiet philosophical joke for every visitor.",
  data_totem:
    "a data totem streaming live readings from a coral reef on the other side of the world; warm colors mean the reef is well, blue means it is bleaching.",
};

export const Route = createFileRoute("/api/guide")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const body = (await request.json()) as Body;
        const langCode = (body.lang || "ar").toLowerCase();
        const langName = LANG_NAMES[langCode] ?? langCode;
        const isAr = langCode === "ar";
        const persona = personas[body.persona ?? "senebi"] ?? personas.senebi;
        const artifact = body.objectId ? artifacts[body.objectId] : null;

        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        const langInstruction = `Reply ONLY in ${langName}. Do not use any other language, no transliteration, no translation in parentheses.`;

        const system = `You are ${persona.name}, ${persona.role}. Tone: ${persona.tone}.
${langInstruction}
Setting: ${body.world ?? "the Hall of Pharaohs in ancient Egypt"}.
Constraints: 2 to 4 sentences. No lists. No markdown. Speak as if standing beside the visitor.
${artifact ? `The visitor is now looking at ${artifact} — speak about it directly.` : ""}`;

        const userMessage =
          body.query?.trim() ||
          (artifact
            ? isAr
              ? "أخبرني عن هذه القطعة."
              : "Tell me about this artifact."
            : isAr
              ? "رحّب بي في هذه القاعة."
              : "Welcome me to this hall.");

        try {
          const gateway = createLovableAiGatewayProvider(apiKey);
          const model = gateway("google/gemini-3-flash-preview");
          const { text } = await generateText({
            model,
            system,
            prompt: userMessage,
          });

          return new Response(JSON.stringify({ text: text.trim() }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          const status = (err as { status?: number })?.status;
          const msg =
            status === 429
              ? isAr
                ? "كثرة الطلبات، أمهلني لحظة."
                : "Too many requests. Please wait a moment."
              : status === 402
                ? isAr
                  ? "نفذت الأرصدة. الرجاء إضافة رصيد للاستمرار."
                  : "Credits exhausted. Please add credits to continue."
                : isAr
                  ? "تعذّر الردّ الآن."
                  : "Could not generate a response right now.";
          return new Response(JSON.stringify({ error: msg }), {
            status: status ?? 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
