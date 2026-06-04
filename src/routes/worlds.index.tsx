import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { AppHeader } from "@/components/AppHeader";
import egypt from "@/assets/hero-egypt.jpg";
import atlantis from "@/assets/world-atlantis.jpg";
import renaissance from "@/assets/world-renaissance.jpg";
import modern from "@/assets/world-modern.jpg";
import { ArrowRight, Lock } from "lucide-react";

export const Route = createFileRoute("/worlds/")({
  head: () => ({
    meta: [
      { title: "Choose Your World — AETERNA" },
      { name: "description", content: "Four immersive worlds. Choose where to begin your journey." },
      { property: "og:title", content: "Choose Your World — AETERNA" },
    ],
  }),
  component: WorldsPage,
});

function WorldsPage() {
  const { t } = useI18n();
  const worlds = [
    { id: "egypt", name: t.egyptName, desc: t.egyptDesc, img: egypt, available: true, to: "/worlds/egypt" },
    { id: "atlantis", name: t.atlantisName, desc: t.atlantisDesc, img: atlantis, available: true, to: "/worlds/atlantis" },
    { id: "renaissance", name: t.renaissanceName, desc: t.renaissanceDesc, img: renaissance, available: true, to: "/worlds/renaissance" },
    { id: "modern", name: t.modernName, desc: t.modernDesc, img: modern, available: true, to: "/worlds/modern" },
  ] as const;

  return (
    <div className="relative min-h-screen bg-background">
      <AppHeader />
      <main className="px-6 pt-32 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center animate-fade-up">
            <h1 className="font-display text-4xl sm:text-6xl">
              <span className="gradient-gold-text">{t.worlds}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
              {t.worldsSubtitle}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {worlds.map((w, i) => (
              <WorldCard key={w.id} world={w} index={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function WorldCard({
  world,
  index,
}: {
  world: { id: string; name: string; desc: string; img: string; available: boolean; to?: string };
  index: number;
}) {
  const { t } = useI18n();
  const inner = (
    <div
      className="group relative h-[420px] overflow-hidden rounded-3xl border border-gold/15 bg-card animate-fade-up"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <img
        src={world.img}
        alt={world.name}
        loading="lazy"
        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ${
          world.available ? "group-hover:scale-110" : "grayscale-[60%] brightness-50"
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      {!world.available && (
        <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-background/60 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-gold backdrop-blur-md">
          <Lock size={10} /> {t.comingSoon}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 p-7">
        <div className="mb-2 text-[10px] uppercase tracking-[0.4em] text-gold/80">{world.desc}</div>
        <h3 className="font-display text-3xl text-foreground">{world.name}</h3>
        {world.available && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-gold to-ember px-5 py-2 font-display text-xs uppercase tracking-[0.3em] text-primary-foreground transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
            {t.enterWorld}
            <ArrowRight size={14} className="rtl:-scale-x-100" />
          </div>
        )}
      </div>
    </div>
  );
  return world.available && world.to ? <Link to={world.to}>{inner}</Link> : inner;
}
