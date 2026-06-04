import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

// Supported guide languages (BCP-47). UI strings exist only for `ar` and `en`;
// other languages fall back to English for UI but use their native code for the
// AI guide replies and browser speech synthesis.
export type Lang = string;

export const SUPPORTED_LANGUAGES: { code: string; native: string; english: string; rtl?: boolean }[] = [
  { code: "ar", native: "العربية", english: "Arabic", rtl: true },
  { code: "en", native: "English", english: "English" },
  { code: "fr", native: "Français", english: "French" },
  { code: "es", native: "Español", english: "Spanish" },
  { code: "de", native: "Deutsch", english: "German" },
  { code: "it", native: "Italiano", english: "Italian" },
  { code: "pt", native: "Português", english: "Portuguese" },
  { code: "ru", native: "Русский", english: "Russian" },
  { code: "tr", native: "Türkçe", english: "Turkish" },
  { code: "fa", native: "فارسی", english: "Persian", rtl: true },
  { code: "ur", native: "اردو", english: "Urdu", rtl: true },
  { code: "he", native: "עברית", english: "Hebrew", rtl: true },
  { code: "hi", native: "हिन्दी", english: "Hindi" },
  { code: "zh", native: "中文", english: "Chinese" },
  { code: "ja", native: "日本語", english: "Japanese" },
  { code: "ko", native: "한국어", english: "Korean" },
  { code: "id", native: "Bahasa Indonesia", english: "Indonesian" },
  { code: "nl", native: "Nederlands", english: "Dutch" },
  { code: "pl", native: "Polski", english: "Polish" },
  { code: "sv", native: "Svenska", english: "Swedish" },
];

const RTL_SET = new Set(SUPPORTED_LANGUAGES.filter((l) => l.rtl).map((l) => l.code));

export function isRTL(code: string) {
  return RTL_SET.has(code);
}

export function languageEnglishName(code: string) {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.english ?? code;
}

type Strings = {
  brand: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  enter: string;
  back: string;
  worlds: string;
  worldsSubtitle: string;
  comingSoon: string;
  enterWorld: string;
  guide: string;
  askGuide: string;
  thinking: string;
  speaking: string;
  inputPlaceholder: string;
  send: string;
  clickArtifact: string;
  egyptName: string;
  egyptDesc: string;
  atlantisName: string;
  atlantisDesc: string;
  renaissanceName: string;
  renaissanceDesc: string;
  modernName: string;
  modernDesc: string;
  features: { title: string; items: { t: string; d: string }[] };
  startTour: string;
  hallOfPharaohs: string;
  openGuide: string;
  closeGuide: string;
  language: string;
  chooseCharacter: string;
  chooseCharacterSub: string;
  male: string;
  female: string;
  enterWorldBtn: string;
  controlsHintDesktop: string;
  controlsHintMobile: string;
  interact: string;
};

const en: Strings = {
  brand: "AETERNA",
  tagline: "Worlds Reimagined",
  heroTitle: "Walk Through Time",
  heroSubtitle:
    "Step inside lost civilizations. Speak with their guardians. Touch their stories — guided by an intelligent companion in your own language.",
  enter: "Enter the Worlds",
  back: "Back",
  worlds: "Choose Your World",
  worldsSubtitle: "Four realms await. Each with its own guide, history, and atmosphere.",
  comingSoon: "Coming Soon",
  enterWorld: "Enter",
  guide: "Senebi · Royal Scribe",
  askGuide: "Ask the guide",
  thinking: "Thinking…",
  speaking: "Speaking…",
  inputPlaceholder: "Ask anything about this hall…",
  send: "Send",
  clickArtifact: "Click any glowing artifact to learn its story",
  egyptName: "Ancient Egypt",
  egyptDesc: "The Hall of Pharaohs · 1300 BCE",
  atlantisName: "Atlantis",
  atlantisDesc: "Sunken city of the deep · Lost Era",
  renaissanceName: "Renaissance",
  renaissanceDesc: "Florentine art gallery · 1500 CE",
  modernName: "Modern",
  modernDesc: "Contemporary museum · Today",
  features: {
    title: "An Immersive Civilization",
    items: [
      { t: "Intelligent Guides", d: "AI companions speak each world's truth — unscripted, in character, in your language." },
      { t: "Built-in Voice", d: "Natural narration powered by your browser — no external API required." },
      { t: "Living Worlds", d: "Sound, light, and atmosphere react to your presence in real time." },
    ],
  },
  startTour: "Begin the Tour",
  hallOfPharaohs: "Hall of Pharaohs",
  openGuide: "Open Guide",
  closeGuide: "Close",
  language: "Language",
  chooseCharacter: "Choose your traveler",
  chooseCharacterSub: "Walk through history in your own skin.",
  male: "Male",
  female: "Female",
  enterWorldBtn: "Enter the world",
  controlsHintDesktop: "WASD / Arrows to move · Mouse to look · Shift to run · E to interact",
  controlsHintMobile: "Left stick: move · Right pad: look · Tap artifact to interact",
  interact: "Interact",
};

const ar: Strings = {
  brand: "أَتِرنا",
  tagline: "عوالم تُبعَث من جديد",
  heroTitle: "اِمشِ عبر الزمن",
  heroSubtitle:
    "اُدخل إلى حضارات ضائعة. تحدّث مع حُرّاسها. اِلمس قصصها — يُرافقك دليل ذكي يخاطبك بلغتك.",
  enter: "اِدخل العوالم",
  back: "رجوع",
  worlds: "اختر عالَمك",
  worldsSubtitle: "أربعة عوالم تنتظرك، لكلٍّ منها مرشدها وتاريخها وأجواؤها.",
  comingSoon: "قريباً",
  enterWorld: "اِدخل",
  guide: "سِنِبي · كاتب فرعوني",
  askGuide: "اسأل المرشد",
  thinking: "يفكّر…",
  speaking: "يتحدّث…",
  inputPlaceholder: "اسأل عن هذه القاعة…",
  send: "أرسل",
  clickArtifact: "اِنقُر على أي قطعة متوهّجة لتعرف قصتها",
  egyptName: "مصر القديمة",
  egyptDesc: "قاعة الفراعنة · 1300 ق.م",
  atlantisName: "أتلانتس",
  atlantisDesc: "مدينة الأعماق الغارقة · زمن مفقود",
  renaissanceName: "النهضة",
  renaissanceDesc: "صالة فنون فلورنسية · 1500 م",
  modernName: "حديث",
  modernDesc: "متحف معاصر · اليوم",
  features: {
    title: "حضارة غامرة بكل حواسك",
    items: [
      { t: "مرشدون أذكياء", d: "رفاق ذكاء اصطناعي يروون لك قصة كل عالَم — بشخصياتهم، بلغتك، بلا نصوص محفوظة." },
      { t: "صوت مدمج", d: "سرد طبيعي مدعوم من المتصفح — بدون أي خدمة خارجية." },
      { t: "عوالم حيّة", d: "الصوت والضوء والأجواء تتفاعل معك في اللحظة." },
    ],
  },
  startTour: "ابدأ الجولة",
  hallOfPharaohs: "قاعة الفراعنة",
  openGuide: "افتح المرشد",
  closeGuide: "إغلاق",
  language: "اللغة",
  chooseCharacter: "اختر شخصيتك",
  chooseCharacterSub: "اِمشِ عبر التاريخ بشخصيتك أنت.",
  male: "ذكر",
  female: "أنثى",
  enterWorldBtn: "ادخل العالم",
  controlsHintDesktop: "WASD أو الأسهم للحركة · الفأرة للنظر · Shift للجري · E للتفاعل",
  controlsHintMobile: "العصا اليسرى: حركة · اللوحة اليمنى: نظر · المس القطعة للتفاعل",
  interact: "تفاعل",
};

const dict: Record<string, Strings> = { en, ar };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Strings; dir: "ltr" | "rtl" };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("aeterna-lang") : null;
    if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) setLangState(stored);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL(lang) ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("aeterna-lang", l);
  };

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t: dict[lang] ?? dict.en,
      dir: isRTL(lang) ? "rtl" : "ltr",
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
