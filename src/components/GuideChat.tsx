import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Send, Volume2, VolumeX, Loader2, Sparkles, X } from "lucide-react";
import npcSenebi from "@/assets/npc-senebi.jpg";
import { speak, cancelSpeech, isSpeechSupported } from "@/lib/speech";

type Message = { role: "user" | "guide"; text: string; id: string };
type Pending = { objectId?: string; query?: string } | null;

export function GuideChat({
  world = "Hall of Pharaohs, ancient Egypt",
  persona = "senebi",
  guideLabel,
  triggeredObject,
  onConsumeTrigger,
  onClose,
}: {
  world?: string;
  persona?: string;
  guideLabel?: string;
  triggeredObject?: string | null;
  onConsumeTrigger?: () => void;
  onClose?: () => void;
}) {
  const { t, lang } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "thinking" | "speaking">("idle");
  const [muted, setMuted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("aeterna.muted") === "1";
  });
  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("aeterna.muted", muted ? "1" : "0");
    }
    if (muted) cancelSpeech();
  }, [muted]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const triggerSeen = useRef<string | null>(null);

  useEffect(() => () => cancelSpeech(), []);

  const sendToGuide = useCallback(
    async (pending: Pending) => {
      if (!pending) return;
      setStatus("thinking");
      try {
        const res = await fetch("/api/guide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lang,
            world,
            persona,
            objectId: pending.objectId,
            query: pending.query,
          }),
        });
        const data = (await res.json()) as { text?: string; error?: string };
        const text = data.text || data.error || "…";
        const id = crypto.randomUUID();
        setMessages((m) => [...m, { role: "guide", id, text }]);

        if (isSpeechSupported() && !mutedRef.current) {
          await speak(text, lang, {
            onStart: () => setStatus("speaking"),
            onEnd: () => setStatus("idle"),
            onError: () => setStatus("idle"),
          });
        } else {
          setStatus("idle");
        }
      } catch {
        setStatus("idle");
      }
    },
    [lang, world, persona],
  );

  useEffect(() => {
    if (!triggeredObject) return;
    if (triggerSeen.current === triggeredObject) return;
    triggerSeen.current = triggeredObject;
    sendToGuide({ objectId: triggeredObject });
    onConsumeTrigger?.();
  }, [triggeredObject, sendToGuide, onConsumeTrigger]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || status !== "idle") return;
    const id = crypto.randomUUID();
    setMessages((m) => [...m, { role: "user", id, text: q }]);
    setInput("");
    await sendToGuide({ query: q });
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gold/20 bg-background/70 backdrop-blur-xl">
      {/* NPC header */}
      <div className="flex items-center gap-3 border-b border-gold/15 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gold/40 sm:h-14 sm:w-14">
          <img src={npcSenebi} alt="Senebi" className="h-full w-full object-cover" />
          {status === "speaking" && (
            <div className="absolute inset-0 animate-glow-pulse rounded-full ring-2 ring-gold" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-sm text-gold sm:text-base">{guideLabel ?? t.guide}</div>
          <div className="mt-0.5 flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground sm:text-[11px]">
            {status === "thinking" && (
              <>
                <Loader2 size={11} className="animate-spin" /> {t.thinking}
              </>
            )}
            {status === "speaking" && (
              <>
                <Volume2 size={11} className="text-gold" /> {t.speaking}
              </>
            )}
            {status === "idle" && <span>● online</span>}
          </div>
        </div>
        <button
          onClick={() => setMuted((m) => !m)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/20 text-gold/70 transition hover:bg-gold/10 hover:text-gold"
          aria-label={muted ? "Unmute guide voice" : "Mute guide voice"}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        {onClose && (
          <button
            onClick={() => {
              cancelSpeech();
              onClose();
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/20 text-gold/70 transition hover:bg-gold/10 hover:text-gold"
            aria-label={t.closeGuide}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Messages / subtitles */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Sparkles size={28} className="mb-3 text-gold/60" />
            <p className="max-w-xs text-sm text-muted-foreground">{t.clickArtifact}</p>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            {m.role === "user" ? (
              <div className="max-w-[80%] rounded-2xl bg-secondary/40 px-4 py-2.5 text-sm text-secondary-foreground">
                {m.text}
              </div>
            ) : (
              <div className="max-w-full">
                <div className="text-xs uppercase tracking-widest text-gold/70 mb-1.5">
                  {(guideLabel ?? t.guide).split("·")[0].trim()}
                </div>
                <p className="text-[15px] leading-relaxed text-foreground">{m.text}</p>
              </div>
            )}
          </div>
        ))}
        {status === "thinking" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-gold delay-100" />
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-gold delay-300" />
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-gold/15 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.inputPlaceholder}
          disabled={status !== "idle"}
          className="flex-1 rounded-full border border-gold/20 bg-background/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status !== "idle" || !input.trim()}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold to-ember text-primary-foreground transition hover:scale-105 disabled:opacity-40"
          aria-label={t.send}
        >
          <Send size={16} className="rtl:-scale-x-100" />
        </button>
      </form>
    </div>
  );
}
