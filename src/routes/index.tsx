import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { AppHeader } from "@/components/AppHeader";
import heroEgypt from "@/assets/hero-egypt.jpg";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AETERNA — Walk Through Time" },
      {
        name: "description",
        content:
          "Step inside lost civilizations. Speak with their guardians. An immersive multilingual exploration of ancient worlds with an intelligent AI guide.",
      },
      { property: "og:title", content: "AETERNA — Walk Through Time" },
      {
        property: "og:description",
        content: "Immersive 3D worlds, intelligent AI guides, cinematic narration in your language.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useI18n();
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <AppHeader />

      {/* HERO */}
      <section className="relative flex min-h-screen items-center justify-center">
        <div className="absolute inset-0">
          <img
            src={heroEgypt}
            alt=""
            className="h-full w-full object-cover animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/30 to-background" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-gold/30 bg-background/40 px-4 py-1.5 text-[11px] uppercase tracking-[0.4em] text-gold backdrop-blur-md animate-fade-in">
            <span className="inline-block h-1 w-1 rounded-full bg-gold animate-glow-pulse" />
            {t.tagline}
          </div>
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-foreground sm:text-7xl md:text-8xl animate-fade-up">
            <span className="gradient-gold-text glow-gold-text">{t.heroTitle}</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg animate-fade-up delay-300">
            {t.heroSubtitle}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-up delay-500">
            <Link
              to="/worlds"
              className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-br from-gold to-ember px-8 py-3.5 font-display text-sm uppercase tracking-[0.3em] text-primary-foreground shadow-[0_20px_60px_-15px_oklch(0.78_0.14_78_/_0.6)] transition hover:scale-[1.03] hover:shadow-[0_30px_80px_-15px_oklch(0.85_0.18_80_/_0.8)]"
            >
              {t.enter}
              <ArrowRight size={16} className="transition group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
            </Link>
          </div>
        </div>

        {/* scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-in delay-1000">
          <div className="h-12 w-px bg-gradient-to-b from-transparent via-gold/60 to-transparent" />
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative px-6 py-32">
        <div className="mx-auto max-w-6xl">
          <h2 className="mx-auto max-w-2xl text-center font-display text-3xl leading-tight text-foreground sm:text-5xl">
            <span className="gradient-gold-text">{t.features.title}</span>
          </h2>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {t.features.items.map((it, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-gold/15 bg-card p-8 backdrop-blur-md transition hover:border-gold/40"
              >
                <div className="absolute inset-0 bg-gradient-radial-glow opacity-0 transition group-hover:opacity-100" />
                <div className="relative">
                  <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 font-display text-sm text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mb-3 font-display text-xl text-foreground">{it.t}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{it.d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-20 text-center">
            <Link
              to="/worlds"
              className="inline-flex items-center gap-3 rounded-full border border-gold/40 bg-background/40 px-7 py-3 font-display text-xs uppercase tracking-[0.3em] text-gold backdrop-blur-md transition hover:bg-gold/10"
            >
              {t.startTour}
              <ArrowRight size={14} className="rtl:-scale-x-100" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
