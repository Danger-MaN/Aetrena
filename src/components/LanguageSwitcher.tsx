import { useEffect, useRef, useState } from "react";
import { useI18n, SUPPORTED_LANGUAGES } from "@/lib/i18n";
import { Globe, Check, ChevronDown } from "lucide-react";

export function LanguageSwitcher({ minimal = false }: { minimal?: boolean }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === lang) ?? SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const trigger = minimal ? (
    <button
      onClick={() => setOpen((o) => !o)}
      className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-background/40 px-3 py-1.5 text-xs uppercase tracking-widest text-gold backdrop-blur-md transition hover:border-gold hover:bg-gold/10"
      aria-label="Language"
    >
      <Globe size={14} />
      <span className="font-display">{current.code.toUpperCase()}</span>
      <ChevronDown size={12} className={`transition ${open ? "rotate-180" : ""}`} />
    </button>
  ) : (
    <button
      onClick={() => setOpen((o) => !o)}
      className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-background/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-gold backdrop-blur-md hover:border-gold/50"
    >
      <Globe size={14} />
      <span>{current.native}</span>
      <ChevronDown size={12} className={`transition ${open ? "rotate-180" : ""}`} />
    </button>
  );

  return (
    <div ref={wrapRef} className="relative inline-block">
      {trigger}
      {open && (
        <div
          className="absolute z-50 mt-2 max-h-72 w-56 overflow-y-auto rounded-2xl border border-gold/30 bg-popover/95 p-1.5 shadow-2xl backdrop-blur-xl ltr:right-0 rtl:left-0 animate-fade-in"
          role="listbox"
        >
          {SUPPORTED_LANGUAGES.map((l) => {
            const active = l.code === lang;
            return (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition ${
                  active
                    ? "bg-gradient-to-br from-gold/20 to-ember/20 text-gold"
                    : "text-foreground/80 hover:bg-gold/10 hover:text-gold"
                }`}
                dir={l.rtl ? "rtl" : "ltr"}
              >
                <span className="flex flex-col items-start leading-tight">
                  <span className="font-medium">{l.native}</span>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {l.english}
                  </span>
                </span>
                {active && <Check size={14} className="text-gold" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
