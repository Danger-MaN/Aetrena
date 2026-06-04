import { useEffect, useRef } from "react";
import { inputState } from "@/lib/input-store";

type StickOpts = {
  onVector: (nx: number, ny: number) => void;
  onEnd: () => void;
};

function useJoystick(ref: React.RefObject<HTMLDivElement | null>, knobRef: React.RefObject<HTMLDivElement | null>, opts: StickOpts) {
  useEffect(() => {
    const wrap = ref.current;
    const knob = knobRef.current;
    if (!wrap || !knob) return;
    let id: number | null = null;
    let center = { x: 0, y: 0 };
    const radius = 56;

    const set = (dx: number, dy: number) => {
      const d = Math.hypot(dx, dy);
      const k = d > radius ? radius / d : 1;
      const x = dx * k;
      const y = dy * k;
      knob.style.transform = `translate(${x}px, ${y}px)`;
      opts.onVector(x / radius, y / radius);
    };
    const reset = () => {
      knob.style.transform = "translate(0,0)";
      opts.onEnd();
    };

    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      id = e.pointerId;
      const r = wrap.getBoundingClientRect();
      center = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      set(e.clientX - center.x, e.clientY - center.y);
      wrap.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      set(e.clientX - center.x, e.clientY - center.y);
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = null;
      reset();
    };

    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerup", onUp);
    wrap.addEventListener("pointercancel", onUp);
    return () => {
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerup", onUp);
      wrap.removeEventListener("pointercancel", onUp);
    };
  }, [ref, knobRef, opts]);
}

// Continuously feed look delta from the right joystick vector each frame.
function useLookFeeder(vecRef: React.MutableRefObject<{ x: number; y: number }>) {
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const v = vecRef.current;
      if (v.x !== 0 || v.y !== 0) {
        inputState.look.dx += v.x * 11;
        inputState.look.dy += v.y * 9;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [vecRef]);
}

export function TouchControls() {
  const moveWrap = useRef<HTMLDivElement>(null);
  const moveKnob = useRef<HTMLDivElement>(null);
  const lookWrap = useRef<HTMLDivElement>(null);
  const lookKnob = useRef<HTMLDivElement>(null);
  const lookVec = useRef({ x: 0, y: 0 });

  useJoystick(moveWrap, moveKnob, {
    onVector: (x, y) => {
      inputState.move.x = x;
      inputState.move.y = y;
    },
    onEnd: () => {
      inputState.move.x = 0;
      inputState.move.y = 0;
    },
  });

  useJoystick(lookWrap, lookKnob, {
    onVector: (x, y) => {
      lookVec.current.x = x;
      lookVec.current.y = y;
    },
    onEnd: () => {
      lookVec.current.x = 0;
      lookVec.current.y = 0;
    },
  });

  useLookFeeder(lookVec);

  const baseCls =
    "absolute z-30 h-32 w-32 touch-none select-none rounded-full border border-gold/30 bg-background/30 backdrop-blur-md lg:hidden";

  return (
    <>
      {/* Move joystick - bottom left */}
      <div
        ref={moveWrap}
        className={baseCls}
        style={{
          left: "calc(env(safe-area-inset-left,0px) + 16px)",
          bottom: "calc(env(safe-area-inset-bottom,0px) + 18px)",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            ref={moveKnob}
            className="h-14 w-14 rounded-full bg-gradient-to-br from-gold to-ember shadow-2xl"
          />
        </div>
      </div>

      {/* Look joystick - bottom right */}
      <div
        ref={lookWrap}
        className={baseCls}
        style={{
          right: "calc(env(safe-area-inset-right,0px) + 16px)",
          bottom: "calc(env(safe-area-inset-bottom,0px) + 18px)",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            ref={lookKnob}
            className="h-14 w-14 rounded-full bg-gradient-to-br from-ember to-gold shadow-2xl"
          />
        </div>
      </div>
    </>
  );
}
