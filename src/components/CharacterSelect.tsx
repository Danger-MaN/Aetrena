import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, ArrowRight } from "lucide-react";

export type Gender = "male" | "female";

export function CharacterSelect({ onSelect }: { onSelect: (g: Gender) => void }) {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background/95 px-5 py-8 backdrop-blur-xl">
      <Link
        to="/worlds"
        className="absolute top-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-background/60 px-3 py-2 text-[11px] uppercase tracking-widest text-gold backdrop-blur-md transition hover:bg-gold/10 ltr:left-4 rtl:right-4 sm:px-4 sm:text-xs"
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
      >
        <ArrowLeft size={14} className="rtl:-scale-x-100" />
        <span>{t.back}</span>
      </Link>
      <div className="mb-8 text-center animate-fade-up">
        <div className="mb-3 text-[11px] uppercase tracking-[0.4em] text-gold/80">
          {t.hallOfPharaohs}
        </div>
        <h1 className="font-display text-3xl sm:text-5xl">
          <span className="gradient-gold-text">{t.chooseCharacter}</span>
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          {t.chooseCharacterSub}
        </p>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-2 gap-4 sm:gap-6">
        {(["male", "female"] as const).map((g, i) => (
          <button
            key={g}
            onClick={() => onSelect(g)}
            className="group relative flex flex-col items-center overflow-hidden rounded-3xl border border-gold/20 bg-card/60 p-5 pb-6 backdrop-blur-md transition hover:-translate-y-1 hover:border-gold/60 hover:bg-gold/5 animate-fade-up"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-radial-glow opacity-0 transition group-hover:opacity-100" />
            <div className="relative mb-4 flex h-40 w-full items-end justify-center sm:h-56">
              <AvatarPreview gender={g} />
            </div>
            <div className="relative font-display text-xl text-foreground sm:text-2xl">
              {g === "male" ? t.male : t.female}
            </div>
            <div className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-gold to-ember px-5 py-2 font-display text-[11px] uppercase tracking-[0.3em] text-primary-foreground transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
              {t.enterWorldBtn}
              <ArrowRight size={14} className="rtl:-scale-x-100" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Pure-SVG silhouette so we don't need any model files.
function AvatarPreview({ gender }: { gender: Gender }) {
  const skin = "#d9a87a";
  const cloth = gender === "male" ? "#1f3a8a" : "#b3324a";
  const hair = "#1a0f08";
  return (
    <svg viewBox="0 0 100 140" className="h-full w-auto drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]">
      {/* hair back */}
      {gender === "female" && (
        <path d="M28 30 Q28 70 38 90 L62 90 Q72 70 72 30 Z" fill={hair} />
      )}
      {/* head */}
      <circle cx="50" cy="32" r="14" fill={skin} />
      {/* hair top */}
      <path
        d={
          gender === "male"
            ? "M36 28 Q50 12 64 28 Q60 22 50 22 Q40 22 36 28 Z"
            : "M34 30 Q50 8 66 30 Q66 22 50 18 Q34 22 34 30 Z"
        }
        fill={hair}
      />
      {/* neck */}
      <rect x="46" y="44" width="8" height="6" fill={skin} />
      {/* torso */}
      <path d="M30 52 Q50 48 70 52 L66 92 L34 92 Z" fill={cloth} />
      {/* gold collar */}
      <path d="M38 52 Q50 56 62 52 L60 58 Q50 62 40 58 Z" fill="#d4a24a" />
      {/* arms */}
      <rect x="22" y="54" width="9" height="34" rx="4" fill={skin} />
      <rect x="69" y="54" width="9" height="34" rx="4" fill={skin} />
      {/* legs */}
      <rect x="36" y="92" width="12" height="38" rx="3" fill="#3b2a18" />
      <rect x="52" y="92" width="12" height="38" rx="3" fill="#3b2a18" />
      {/* feet */}
      <rect x="34" y="128" width="16" height="5" rx="2" fill="#1a1108" />
      <rect x="50" y="128" width="16" height="5" rx="2" fill="#1a1108" />
    </svg>
  );
}
