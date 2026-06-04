import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Sparkles as DreiSparkles, Html } from "@react-three/drei";
import * as THREE from "three";
import { inputState, consumeLook } from "@/lib/input-store";
import { effectiveVolume, subscribeAudio, onAudioUnlock } from "@/lib/audio-store";
import type { Gender } from "./CharacterSelect";
import {
  WORLDS,
  type Hotspot,
  type WorldTheme,
  type WorldLayout,
  type WorldSounds,
  type PositionalSound,
  type Prop,
  type ColumnProp,
  type TorchProp,
  type BoxProp,
  type CylinderProp,
  type SphereProp,
} from "@/lib/worlds";

const DEFAULT_THEME = WORLDS.egypt.theme;
const DEFAULT_LAYOUT = WORLDS.egypt.layout;
const DEFAULT_HOTSPOTS = WORLDS.egypt.hotspots;

/** Circular collider derived from a prop (used to push the player back). */
type CircleCollider = { x: number; z: number; r: number };

function collectColliders(props: Prop[]): CircleCollider[] {
  const out: CircleCollider[] = [];
  for (const p of props) {
    if (p.kind === "column") {
      out.push({ x: p.pos[0], z: p.pos[1], r: (p.radius ?? 0.55) + 0.35 });
    } else if (p.kind === "cylinder" && p.collide) {
      out.push({ x: p.pos[0], z: p.pos[2], r: p.radius + 0.3 });
    } else if (p.kind === "box" && p.collide) {
      const r = Math.max(p.size[0], p.size[2]) * 0.5 + 0.3;
      out.push({ x: p.pos[0], z: p.pos[2], r });
    }
  }
  return out;
}

function Column({ prop, theme }: { prop: ColumnProp; theme: WorldTheme }) {
  const h = prop.height ?? 5;
  const r = prop.radius ?? 0.55;
  const shaft = prop.shaftColor ?? theme.columnShaft;
  const band = prop.bandColor ?? theme.columnBand;
  const cap = prop.capColor ?? theme.columnCap;
  return (
    <group position={[prop.pos[0], 0, prop.pos[1]]}>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <cylinderGeometry args={[r, r * 1.08, h, 16]} />
        <meshStandardMaterial color={shaft} roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh position={[0, h - 0.3, 0]}>
        <cylinderGeometry args={[r * 1.12, r * 1.12, 0.35, 16]} />
        <meshStandardMaterial color={band} roughness={0.6} />
      </mesh>
      <mesh position={[0, h, 0]}>
        <cylinderGeometry args={[r * 1.28, r * 1.12, 0.25, 16]} />
        <meshStandardMaterial color={cap} roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[r * 2.5, 0.1, r * 2.5]} />
        <meshStandardMaterial color={band} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Torch({ prop, theme }: { prop: TorchProp; theme: WorldTheme }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const h = prop.height ?? 1.2;
  const flame = prop.flameColor ?? theme.torchColor;
  const light = prop.lightColor ?? theme.torchLight;
  const dist = prop.lightDistance ?? 9;
  useFrame(({ clock }) => {
    if (lightRef.current) {
      const t = clock.getElapsedTime();
      lightRef.current.intensity = 6 + Math.sin(t * 8) * 1.5 + Math.sin(t * 3.7) * 0.8;
    }
  });
  return (
    <group position={[prop.pos[0], 0, prop.pos[1]]}>
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.06, 0.08, h, 8]} />
        <meshStandardMaterial color="#1a0f07" />
      </mesh>
      <mesh position={[0, h + 0.1, 0]}>
        <coneGeometry args={[0.18, 0.45, 8]} />
        <meshBasicMaterial color={flame} toneMapped={false} />
      </mesh>
      <pointLight ref={lightRef} position={[0, h + 0.2, 0]} color={light} intensity={6} distance={dist} decay={2} />
    </group>
  );
}

function BoxPiece({ prop }: { prop: BoxProp }) {
  return (
    <mesh position={prop.pos} rotation={[0, prop.rotationY ?? 0, 0]} castShadow receiveShadow>
      <boxGeometry args={prop.size} />
      <meshStandardMaterial
        color={prop.color}
        emissive={prop.emissive ?? "#000000"}
        emissiveIntensity={prop.emissiveIntensity ?? (prop.emissive ? 1 : 0)}
        roughness={prop.roughness ?? 0.8}
        metalness={prop.metalness ?? 0.05}
        toneMapped={!prop.emissive}
      />
    </mesh>
  );
}

function CylinderPiece({ prop }: { prop: CylinderProp }) {
  return (
    <mesh position={prop.pos} castShadow receiveShadow>
      <cylinderGeometry args={[prop.radius, prop.radius, prop.height, 24]} />
      <meshStandardMaterial
        color={prop.color}
        emissive={prop.emissive ?? "#000000"}
        emissiveIntensity={prop.emissiveIntensity ?? (prop.emissive ? 1 : 0)}
        roughness={0.6}
      />
    </mesh>
  );
}

function SpherePiece({ prop }: { prop: SphereProp }) {
  return (
    <mesh position={prop.pos} castShadow>
      <sphereGeometry args={[prop.radius, 24, 24]} />
      <meshStandardMaterial
        color={prop.color}
        emissive={prop.emissive ?? "#000000"}
        emissiveIntensity={prop.emissiveIntensity ?? (prop.emissive ? 1.2 : 0)}
        roughness={0.3}
        toneMapped={!prop.emissive}
      />
    </mesh>
  );
}

function PropNode({ prop, theme }: { prop: Prop; theme: WorldTheme }) {
  switch (prop.kind) {
    case "column":
      return <Column prop={prop} theme={theme} />;
    case "torch":
      return <Torch prop={prop} theme={theme} />;
    case "box":
      return <BoxPiece prop={prop} />;
    case "cylinder":
      return <CylinderPiece prop={prop} />;
    case "sphere":
      return <SpherePiece prop={prop} />;
  }
}

function HotspotMesh({
  spot,
  onClick,
  active,
  theme,
}: {
  spot: Hotspot;
  onClick: (id: string) => void;
  active: boolean;
  theme: WorldTheme;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = spot.pos[1] + Math.sin(clock.getElapsedTime() * 1.5) * 0.08;
      ref.current.rotation.y = clock.getElapsedTime() * 0.4;
    }
  });
  const glow = hovered || active;
  return (
    <group position={[spot.pos[0], 0, spot.pos[2]]}>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.7, 0.3, 0.7]} />
        <meshStandardMaterial color={theme.columnBand} roughness={0.95} />
      </mesh>
      <mesh
        ref={ref}
        position={[0, spot.pos[1], 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick(spot.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        scale={glow ? 1.18 : 1}
      >
        <icosahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial
          color={theme.hotspotColor}
          emissive={theme.hotspotEmissive}
          emissiveIntensity={glow ? 1.6 : 0.7}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
      <pointLight position={[0, spot.pos[1], 0]} color={theme.hotspotLight} intensity={glow ? 3.2 : 1.6} distance={3.4} />
      {(hovered || active) && (
        <Html position={[0, spot.pos[1] + 0.85, 0]} center distanceFactor={9}>
          <div className="pointer-events-none whitespace-nowrap rounded-full border border-gold/40 bg-background/80 px-3 py-1 font-display text-xs uppercase tracking-widest text-gold backdrop-blur-md">
            {spot.label}
          </div>
        </Html>
      )}
    </group>
  );
}


// --- Avatar built from primitives so we don't ship a GLB ---
function Avatar({ gender, walking }: { gender: Gender; walking: boolean }) {
  const cloth = gender === "male" ? "#1f3a8a" : "#b3324a";
  const skin = "#d9a87a";
  const hair = "#1a0f08";
  const leftLeg = useRef<THREE.Mesh>(null);
  const rightLeg = useRef<THREE.Mesh>(null);
  const leftArm = useRef<THREE.Mesh>(null);
  const rightArm = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * (walking ? 8 : 0);
    const s = Math.sin(t) * (walking ? 0.6 : 0);
    if (leftLeg.current) leftLeg.current.rotation.x = s;
    if (rightLeg.current) rightLeg.current.rotation.x = -s;
    if (leftArm.current) leftArm.current.rotation.x = -s * 0.8;
    if (rightArm.current) rightArm.current.rotation.x = s * 0.8;
  });
  return (
    <group>
      {/* legs */}
      <mesh ref={leftLeg} position={[-0.12, 0.45, 0]} castShadow>
        <boxGeometry args={[0.18, 0.9, 0.18]} />
        <meshStandardMaterial color="#3b2a18" />
      </mesh>
      <mesh ref={rightLeg} position={[0.12, 0.45, 0]} castShadow>
        <boxGeometry args={[0.18, 0.9, 0.18]} />
        <meshStandardMaterial color="#3b2a18" />
      </mesh>
      {/* torso */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[0.55, 0.7, 0.3]} />
        <meshStandardMaterial color={cloth} />
      </mesh>
      {/* gold collar */}
      <mesh position={[0, 1.45, 0.155]}>
        <boxGeometry args={[0.5, 0.1, 0.02]} />
        <meshStandardMaterial color="#d4a24a" metalness={0.7} roughness={0.3} emissive="#7a5a1a" emissiveIntensity={0.2} />
      </mesh>
      {/* arms */}
      <mesh ref={leftArm} position={[-0.36, 1.2, 0]} castShadow>
        <boxGeometry args={[0.14, 0.7, 0.14]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      <mesh ref={rightArm} position={[0.36, 1.2, 0]} castShadow>
        <boxGeometry args={[0.14, 0.7, 0.14]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      {/* head */}
      <mesh position={[0, 1.72, 0]} castShadow>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      {/* hair */}
      {gender === "female" ? (
        <mesh position={[0, 1.65, -0.02]}>
          <sphereGeometry args={[0.22, 24, 24, 0, Math.PI * 2, 0, Math.PI / 1.4]} />
          <meshStandardMaterial color={hair} />
        </mesh>
      ) : (
        <mesh position={[0, 1.82, 0]}>
          <sphereGeometry args={[0.19, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={hair} />
        </mesh>
      )}
    </group>
  );
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function Player({
  gender,
  hotspots,
  onProximity,
  firstPerson,
  onWalkingChange,
  colliders,
  bounds,
}: {
  gender: Gender;
  hotspots: Hotspot[];
  onProximity: (id: string | null) => void;
  firstPerson: boolean;
  onWalkingChange?: (walking: boolean) => void;
  colliders: CircleCollider[];
  bounds: WorldLayout["bounds"];
}) {
  const root = useRef<THREE.Group>(null);
  const yaw = useRef(0);
  const pitch = useRef(-0.1);
  const facing = useRef(0);
  const camera = useThree((s) => s.camera);
  const [walking, setWalking] = useState(false);
  useEffect(() => { onWalkingChange?.(walking); }, [walking, onWalkingChange]);

  useFrame((_, dtRaw) => {
    if (!root.current) return;
    const dt = Math.min(dtRaw, 0.05);

    const look = consumeLook();
    yaw.current -= look.dx * 0.0035;
    pitch.current = clamp(pitch.current - look.dy * 0.0025, -0.6, 0.45);

    const keys = inputState.keys;
    const kForward =
      (keys.has("w") || keys.has("arrowup") ? 1 : 0) -
      (keys.has("s") || keys.has("arrowdown") ? 1 : 0);
    const kStrafe =
      (keys.has("d") || keys.has("arrowright") ? 1 : 0) -
      (keys.has("a") || keys.has("arrowleft") ? 1 : 0);
    const forward = kForward + -inputState.move.y;
    const strafe = kStrafe + inputState.move.x;
    const running = inputState.run || keys.has("shift");
    const speed = (running ? 5.5 : 3) * dt;

    const sinY = Math.sin(yaw.current);
    const cosY = Math.cos(yaw.current);
    let dx = -sinY * forward + cosY * strafe;
    let dz = -cosY * forward + -sinY * strafe;
    const len = Math.hypot(dx, dz);
    if (len > 1) {
      dx /= len;
      dz /= len;
    }
    dx *= speed;
    dz *= speed;

    const next = root.current.position.clone();
    next.x += dx;
    next.z += dz;

    for (const c of colliders) {
      const ddx = next.x - c.x;
      const ddz = next.z - c.z;
      const d = Math.hypot(ddx, ddz);
      if (d < c.r && d > 0.0001) {
        const push = (c.r - d) / d;
        next.x += ddx * push;
        next.z += ddz * push;
      }
    }
    next.x = clamp(next.x, bounds.minX, bounds.maxX);
    next.z = clamp(next.z, bounds.minZ, bounds.maxZ);
    root.current.position.copy(next);

    const moving = len > 0.05;
    if (moving !== walking) setWalking(moving);

    if (moving) {
      const target = Math.atan2(dx, dz);
      let diff = target - facing.current;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      facing.current += diff * Math.min(1, dt * 10);
    }
    // In first-person, body always faces camera yaw so movement feels aligned.
    root.current.rotation.y = firstPerson ? yaw.current : facing.current;

    const px = root.current.position.x;
    const pz = root.current.position.z;
    const py = root.current.position.y;
    if (firstPerson) {
      const eyeH = 1.7;
      camera.position.lerp(new THREE.Vector3(px, py + eyeH, pz), 0.35);
      const lookDist = 5;
      const tx = px - sinY * lookDist;
      const tz = pz - cosY * lookDist;
      const ty = py + eyeH + pitch.current * 2.5;
      camera.lookAt(tx, ty, tz);
    } else {
      const camDist = 3.6;
      const camHeight = 1.9 + pitch.current * 1.2;
      const camX = px + sinY * camDist;
      const camZ = pz + cosY * camDist;
      camera.position.lerp(new THREE.Vector3(camX, py + camHeight, camZ), 0.18);
      camera.lookAt(px, py + 1.4, pz);
    }

    let near: string | null = null;
    let bestD = 1.8;
    for (const s of hotspots) {
      const d = Math.hypot(root.current.position.x - s.pos[0], root.current.position.z - s.pos[2]);
      if (d < bestD) {
        bestD = d;
        near = s.id;
      }
    }
    onProximity(near);
  });

  return (
    <group ref={root} position={[0, 0, 2]}>
      {!firstPerson && <Avatar gender={gender} walking={walking} />}
    </group>
  );
}

function Hall({
  onArtifactClick,
  activeHotspot,
  theme,
  layout,
  hotspots,
}: {
  onArtifactClick: (id: string) => void;
  activeHotspot: string | null;
  theme: WorldTheme;
  layout: WorldLayout;
  hotspots: Hotspot[];
}) {
  const sparkles = layout.sparkles;
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={layout.ground.size} />
        <meshStandardMaterial
          color={layout.ground.color ?? theme.ground}
          roughness={layout.ground.roughness ?? 0.95}
        />
      </mesh>
      {layout.backWall && (
        <mesh position={layout.backWall.pos} receiveShadow>
          <planeGeometry args={layout.backWall.size} />
          <meshStandardMaterial color={layout.backWall.color ?? theme.wall} roughness={1} />
        </mesh>
      )}
      {layout.props.map((p, i) => (
        <PropNode key={`p${i}`} prop={p} theme={theme} />
      ))}
      {sparkles && (
        <DreiSparkles
          count={sparkles.count ?? 120}
          scale={sparkles.scale ?? [18, 8, 18]}
          size={sparkles.size ?? 2}
          speed={sparkles.speed ?? 0.2}
          color={sparkles.color ?? theme.sparkleColor}
        />
      )}
      {hotspots.map((s) => (
        <HotspotMesh key={s.id} spot={s} onClick={onArtifactClick} active={activeHotspot === s.id} theme={theme} />
      ))}
    </>
  );
}


// --- Audio: spatial sounds emitted from world coordinates. ---------------
function AudioListenerSetup({ onReady }: { onReady: (l: THREE.AudioListener) => void }) {
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    const listener = new THREE.AudioListener();
    camera.add(listener);
    onReady(listener);
    return () => {
      camera.remove(listener);
    };
  }, [camera, onReady]);
  return null;
}

function PositionalSoundNode({
  sound,
  listener,
}: {
  sound: PositionalSound;
  listener: THREE.AudioListener;
}) {
  const audio = useMemo(() => {
    const a = new THREE.PositionalAudio(listener);
    a.setRefDistance(sound.refDistance ?? 2);
    a.setMaxDistance(sound.maxDistance ?? 18);
    a.setRolloffFactor(1.6);
    a.setLoop(true);
    a.setVolume((sound.volume ?? 1) * effectiveVolume());
    return a;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listener, sound.id]);

  useEffect(() => {
    let alive = true;
    let unsubUnlock: (() => void) | null = null;
    const tryPlay = () => {
      const ctx = THREE.AudioContext.getContext() as unknown as AudioContext;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      try { if (!audio.isPlaying) audio.play(); } catch { /* ignore */ }
    };
    const loader = new THREE.AudioLoader();
    loader.load(
      sound.src,
      (buffer) => {
        if (!alive) return;
        audio.setBuffer(buffer);
        tryPlay();
        unsubUnlock = onAudioUnlock(tryPlay);
      },
      undefined,
      () => { /* missing file — stay silent */ },
    );
    const unsub = subscribeAudio((s) => {
      audio.setVolume((sound.volume ?? 1) * (s.muted ? 0 : s.master));
    });
    return () => {
      alive = false;
      unsub();
      unsubUnlock?.();
      try { audio.stop(); } catch { /* ignore */ }
    };
  }, [audio, sound.src, sound.volume]);

  return <primitive object={audio} position={sound.pos} />;
}

function SpatialSoundscape({ sounds }: { sounds?: WorldSounds }) {
  const [listener, setListener] = useState<THREE.AudioListener | null>(null);
  return (
    <>
      <AudioListenerSetup onReady={setListener} />
      {listener && sounds?.positional?.map((s) => (
        <PositionalSoundNode key={s.id} sound={s} listener={listener} />
      ))}
    </>
  );
}

/** Plays a non-positional ambient/footstep loop with master volume control. */
function useLoopAudio(src: string | undefined, opts: { active: boolean; baseVolume?: number }) {
  const { active, baseVolume = 1 } = opts;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (!src) return;
    const a = new Audio(src);
    a.loop = true;
    a.preload = "auto";
    a.volume = baseVolume * effectiveVolume();
    audioRef.current = a;
    const unsub = subscribeAudio((s) => {
      a.volume = baseVolume * (s.muted ? 0 : s.master);
    });
    return () => {
      unsub();
      try { a.pause(); } catch { /* ignore */ }
      a.src = "";
      audioRef.current = null;
    };
  }, [src, baseVolume]);
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (active) {
      const play = () => a.play().catch(() => {});
      play();
      const unsub = onAudioUnlock(play);
      return () => unsub();
    } else {
      a.pause();
    }
  }, [active]);
}

export function EgyptScene({
  onArtifactClick,
  gender,
  theme = DEFAULT_THEME,
  layout = DEFAULT_LAYOUT,
  hotspots = DEFAULT_HOTSPOTS,
  firstPerson = false,
  sounds,
}: {
  onArtifactClick: (id: string) => void;
  gender: Gender;
  theme?: WorldTheme;
  layout?: WorldLayout;
  hotspots?: Hotspot[];
  firstPerson?: boolean;
  sounds?: WorldSounds;
}) {
  const [nearHotspot, setNearHotspot] = useState<string | null>(null);
  const [walking, setWalking] = useState(false);
  const canvasWrap = useRef<HTMLDivElement | null>(null);
  const lookDragging = useRef(false);
  const colliders = useMemo(() => collectColliders(layout.props), [layout.props]);

  // Ambient bed loops the whole time the scene is mounted.
  useLoopAudio(sounds?.ambient, { active: true, baseVolume: 0.7 });
  // Footsteps loop only while the avatar is moving.
  useLoopAudio(sounds?.footsteps, { active: walking, baseVolume: 0.9 });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      inputState.keys.add(e.key.toLowerCase());
      if (e.key === "Shift") inputState.run = true;
      if (e.key.toLowerCase() === "e" && nearHotspot) {
        onArtifactClick(nearHotspot);
      }
    };
    const up = (e: KeyboardEvent) => {
      inputState.keys.delete(e.key.toLowerCase());
      if (e.key === "Shift") inputState.run = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      inputState.keys.clear();
      inputState.run = false;
    };
  }, [nearHotspot, onArtifactClick]);

  useEffect(() => {
    const el = canvasWrap.current;
    if (!el) return;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      lookDragging.current = true;
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!lookDragging.current || e.pointerType !== "mouse") return;
      inputState.look.dx += e.movementX;
      inputState.look.dy += e.movementY;
    };
    const onUp = () => {
      lookDragging.current = false;
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div ref={canvasWrap} className="absolute inset-0 touch-none">
      <Canvas shadows camera={{ position: [0, 2.2, 6], fov: 60 }} gl={{ antialias: true }} dpr={[1, 2]}>
        <color attach="background" args={[theme.bg]} />
        <fog attach="fog" args={[theme.fog, theme.fogNear, theme.fogFar]} />
        <ambientLight intensity={theme.ambientIntensity} color={theme.ambient} />
        <directionalLight position={[0, 10, 4]} intensity={0.6} color={theme.ambient} castShadow />
        <Suspense fallback={null}>
          <Environment preset={theme.envPreset} background={false} environmentIntensity={theme.envIntensity} />
          <Hall onArtifactClick={onArtifactClick} activeHotspot={nearHotspot} theme={theme} layout={layout} hotspots={hotspots} />
          <Player
            gender={gender}
            hotspots={hotspots}
            onProximity={setNearHotspot}
            firstPerson={firstPerson}
            onWalkingChange={setWalking}
            colliders={colliders}
            bounds={layout.bounds}
          />
          <SpatialSoundscape sounds={sounds} />
        </Suspense>
      </Canvas>
    </div>
  );
}


