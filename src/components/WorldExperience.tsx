import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { GuideChat } from "@/components/GuideChat";
import { EgyptScene } from "@/components/EgyptScene";
import { CharacterSelect, type Gender } from "@/components/CharacterSelect";
import { TouchControls } from "@/components/TouchControls";
import { ArrowLeft, MessageCircle, User, Eye, Maximize, Minimize, Volume2, VolumeX } from "lucide-react";
import { getAudio, setAudio, subscribeAudio, type AudioState } from "@/lib/audio-store";
import type { WorldConfig } from "@/lib/worlds";


export function WorldExperience({ config }: { config: WorldConfig }) {
  const { t } = useI18n();
  const [gender, setGender] = useState<Gender | null>(null);
  const [trigger, setTrigger] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [firstPerson, setFirstPerson] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("aeterna.fpv") === "1";
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("aeterna.fpv", firstPerson ? "1" : "0");
    }
  }, [firstPerson]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.({ navigationUI: "hide" });
        // Explicitly unlock orientation so the user can rotate freely (portrait or landscape).
        try {
          const orientation = screen.orientation as ScreenOrientation & { unlock?: () => void };
          orientation?.unlock?.();
        } catch { /* not supported */ }
      } else {
        await document.exitFullscreen?.();
      }
    } catch { /* user denied or unsupported */ }
  };

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.cssText;
    const prevBody = body.style.cssText;
    html.style.cssText += "overflow:hidden;overscroll-behavior:none;height:100%;";
    body.style.cssText += "overflow:hidden;overscroll-behavior:none;height:100%;touch-action:none;";
    return () => {
      html.style.cssText = prevHtml;
      body.style.cssText = prevBody;
    };
  }, []);

  useEffect(() => {
    if (trigger) setGuideOpen(true);
  }, [trigger]);

  return (
    <div className="fixed inset-0 w-full overflow-hidden bg-background" style={{ height: "100dvh" }}>
      {!gender && <CharacterSelect onSelect={setGender} />}

      {gender && (
        <>
          <div className="absolute inset-0">
            <EgyptScene
              gender={gender}
              theme={config.theme}
              layout={config.layout}
              hotspots={config.hotspots}
              firstPerson={firstPerson}
              sounds={config.sounds}
              onArtifactClick={(id) => setTrigger(id)}
            />
            <div className="pointer-events-none absolute inset-0 vignette" />
          </div>

          <header
            className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 px-3 sm:px-5"
            style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
          >
            <Link
              to="/worlds"
              className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-gold/30 bg-background/60 px-3 py-2 text-[11px] uppercase tracking-widest text-gold backdrop-blur-md transition hover:bg-gold/10 sm:px-4 sm:text-xs"
            >
              <ArrowLeft size={14} className="rtl:-scale-x-100" />
              <span className="hidden xs:inline sm:inline">{t.back}</span>
            </Link>

            {!guideOpen && (
              <button
                onClick={() => setGuideOpen(true)}
                className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-gold to-ember px-4 py-2 font-display text-[11px] uppercase tracking-[0.25em] text-primary-foreground shadow-2xl shadow-black/50 sm:px-5 sm:py-2.5 sm:text-xs"
                aria-label={t.openGuide}
              >
                <MessageCircle size={14} />
                {t.openGuide}
              </button>
            )}

            <div className="pointer-events-auto flex items-center gap-2">
              <button
                onClick={() => setFirstPerson((v) => !v)}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-gold/30 bg-background/60 px-3 text-[10px] uppercase tracking-widest text-gold backdrop-blur-md transition hover:bg-gold/10"
                aria-label={firstPerson ? "Switch to third-person camera" : "Switch to first-person camera"}
                title={firstPerson ? "First-person" : "Third-person"}
              >
                {firstPerson ? <Eye size={14} /> : <User size={14} />}
                <span className="hidden sm:inline">{firstPerson ? "FPV" : "TPV"}</span>
              </button>
              <VolumeControl />
              <button
                onClick={toggleFullscreen}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-background/60 text-gold backdrop-blur-md transition hover:bg-gold/10"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
              </button>
              <LanguageSwitcher minimal />
            </div>
          </header>

          <TouchControls />

          <div
            className={`absolute z-40 transition-transform duration-500 ease-out
              inset-x-0 bottom-0 h-[78dvh] max-h-[78dvh]
              lg:inset-y-0 lg:bottom-auto lg:h-auto lg:max-h-none
              lg:w-[420px] lg:p-4 lg:pt-24
              lg:ltr:right-0 lg:rtl:left-0
              ${guideOpen ? "translate-y-0 lg:translate-x-0" : "translate-y-full lg:ltr:translate-x-full lg:rtl:-translate-x-full"}
            `}
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            <div className="h-full w-full px-3 pb-3 pt-2 lg:p-0">
              <GuideChat
                world={config.worldDescription}
                persona={config.persona}
                guideLabel={config.guideLabel}
                triggeredObject={trigger}
                onConsumeTrigger={() => setTrigger(null)}
                onClose={() => setGuideOpen(false)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function VolumeControl() {
  const [audio, setLocalAudio] = useState<AudioState>(() => getAudio());
  const [open, setOpen] = useState(false);
  useEffect(() => subscribeAudio(setLocalAudio), []);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest?.("[data-volume-control]")) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const muted = audio.muted || audio.master === 0;

  return (
    <div data-volume-control className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-background/60 text-gold backdrop-blur-md transition hover:bg-gold/10"
        aria-label={muted ? "Audio muted" : "Audio settings"}
        title={muted ? "Audio muted" : `Volume ${Math.round(audio.master * 100)}%`}
      >
        {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 flex w-56 items-center gap-3 rounded-2xl border border-gold/30 bg-background/90 px-3 py-2.5 backdrop-blur-xl rtl:right-auto rtl:left-0">
          <button
            onClick={() => setAudio({ muted: !audio.muted })}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-gold transition hover:bg-gold/10"
            aria-label={audio.muted ? "Unmute" : "Mute"}
          >
            {audio.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={audio.master}
            onChange={(e) => setAudio({ master: parseFloat(e.target.value), muted: false })}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-gold/20 accent-gold"
            aria-label="Master volume"
          />
          <span className="w-8 text-end font-display text-[10px] uppercase tracking-widest text-gold/80">
            {Math.round((audio.muted ? 0 : audio.master) * 100)}
          </span>
        </div>
      )}
    </div>
  );
}
