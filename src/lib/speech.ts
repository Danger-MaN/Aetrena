// Browser-native Text-to-Speech — no external API required.
// Uses the Web Speech API (window.speechSynthesis) which ships in every
// modern browser and supports dozens of languages out of the box.

let cachedVoices: SpeechSynthesisVoice[] | null = null;

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve([]);
      return;
    }
    const existing = window.speechSynthesis.getVoices();
    if (existing.length) {
      cachedVoices = existing;
      resolve(existing);
      return;
    }
    const onVoices = () => {
      const v = window.speechSynthesis.getVoices();
      cachedVoices = v;
      window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
      resolve(v);
    };
    window.speechSynthesis.addEventListener("voiceschanged", onVoices);
    // Safety timeout
    setTimeout(() => {
      const v = window.speechSynthesis.getVoices();
      cachedVoices = v;
      resolve(v);
    }, 1500);
  });
}

function pickVoice(voices: SpeechSynthesisVoice[], lang: string) {
  const lower = lang.toLowerCase();
  // Exact match first (e.g. "ar-EG"), then language prefix match (e.g. "ar")
  return (
    voices.find((v) => v.lang.toLowerCase() === lower) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(lower + "-")) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(lower)) ??
    null
  );
}

export function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function cancelSpeech() {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}

export async function speak(
  text: string,
  lang: string,
  callbacks?: { onStart?: () => void; onEnd?: () => void; onError?: () => void },
): Promise<void> {
  if (!isSpeechSupported() || !text.trim()) {
    callbacks?.onEnd?.();
    return;
  }
  const voices = cachedVoices ?? (await loadVoices());
  const utter = new SpeechSynthesisUtterance(text);
  const voice = pickVoice(voices, lang);
  if (voice) utter.voice = voice;
  utter.lang = voice?.lang ?? lang;
  utter.rate = 0.95;
  utter.pitch = 1;
  utter.volume = 1;
  utter.onstart = () => callbacks?.onStart?.();
  utter.onend = () => callbacks?.onEnd?.();
  utter.onerror = () => callbacks?.onError?.();

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}
