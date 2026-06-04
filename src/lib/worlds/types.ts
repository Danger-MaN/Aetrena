// Shared types for world configurations.
//
// A world is fully described by a single file in this folder. It declares:
//   - `theme`   → colors, fog, lighting
//   - `layout`  → the shape of the world: ground, walls, props (columns, torches, boxes, etc.)
//   - `hotspots`→ interactive points the avatar can approach
//   - `sounds`  → ambient + positional audio
//
// To add a new world, copy one of the existing files (egypt.ts, atlantis.ts…),
// tweak the values, and register it in ./index.ts.

export type Hotspot = {
  id: string;
  pos: [number, number, number];
  label: string;
};

export type WorldTheme = {
  bg: string;
  fog: string;
  fogNear: number;
  fogFar: number;
  ambient: string;
  ambientIntensity: number;
  envPreset:
    | "sunset"
    | "night"
    | "dawn"
    | "warehouse"
    | "city"
    | "studio"
    | "forest"
    | "apartment"
    | "lobby"
    | "park";
  envIntensity: number;
  ground: string;
  wall: string;
  columnShaft: string;
  columnBand: string;
  columnCap: string;
  sparkleColor: string;
  torchColor: string;
  torchLight: string;
  hotspotColor: string;
  hotspotEmissive: string;
  hotspotLight: string;
};

// ---------- Layout: declarative scene description -------------------------
// Each Prop is a simple building block. Coordinates are in world units
// (1 unit ≈ 1 meter). y=0 is the ground; positive z is "behind" the camera
// start, negative z is "forward".

/** A classical pillar. Provides automatic collision. */
export type ColumnProp = {
  kind: "column";
  /** Ground-plane position [x, z]. */
  pos: [number, number];
  /** Total height (default 5). */
  height?: number;
  /** Shaft radius (default 0.55). Also used for collision radius. */
  radius?: number;
  /** Color overrides — fall back to theme values when omitted. */
  shaftColor?: string;
  bandColor?: string;
  capColor?: string;
};

/** A wall-mounted or free-standing torch with a flickering point light. */
export type TorchProp = {
  kind: "torch";
  /** Ground-plane position [x, z]. */
  pos: [number, number];
  /** Stick height (default 1.2). */
  height?: number;
  /** Color overrides — fall back to theme values when omitted. */
  flameColor?: string;
  lightColor?: string;
  /** Maximum reach of the point light (default 9). */
  lightDistance?: number;
};

/** A generic box (walls, benches, plinths…). */
export type BoxProp = {
  kind: "box";
  pos: [number, number, number];
  size: [number, number, number];
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  rotationY?: number;
  roughness?: number;
  metalness?: number;
  /** When true, the player can't walk through it (AABB collision). */
  collide?: boolean;
};

/** A generic cylinder (pillars, tubes, vases…). */
export type CylinderProp = {
  kind: "cylinder";
  pos: [number, number, number];
  radius: number;
  height: number;
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  /** Circular collision radius. Defaults to `radius` if true. */
  collide?: boolean;
};

/** A generic sphere (orbs, lamps…). */
export type SphereProp = {
  kind: "sphere";
  pos: [number, number, number];
  radius: number;
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
};

export type Prop = ColumnProp | TorchProp | BoxProp | CylinderProp | SphereProp;

export type WorldLayout = {
  /** Player movement bounds (clamps the avatar inside). */
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  /** Ground plane size in [width, depth]. */
  ground: { size: [number, number]; color?: string; roughness?: number };
  /** Optional back wall. */
  backWall?: { pos: [number, number, number]; size: [number, number]; color?: string };
  /** Every visible/decorative element of the world. */
  props: Prop[];
  /** Floating particles overlay. */
  sparkles?: { count?: number; scale?: [number, number, number]; size?: number; speed?: number; color?: string };
};

/** A positional sound that fades with distance from the listener. */
export type PositionalSound = {
  id: string;
  /** URL — typically `/sounds/<world>/<file>.mp3` served from /public. */
  src: string;
  /** World coordinates where the sound emanates. */
  pos: [number, number, number];
  /** Volume at which sound is "full". Default 1. */
  volume?: number;
  /** Distance after which the sound starts attenuating. Default 2. */
  refDistance?: number;
  /** Distance after which the sound is inaudible. Default 18. */
  maxDistance?: number;
};

export type WorldSounds = {
  /** Looping ambient bed for the whole world (not positional). */
  ambient?: string;
  /** Footstep loop played while the avatar is walking. */
  footsteps?: string;
  /** Positional sounds emitted from specific coordinates. */
  positional?: PositionalSound[];
};

export type WorldId = "egypt" | "atlantis" | "renaissance" | "modern";

export type WorldConfig = {
  id: WorldId;
  persona: string;
  guideLabel: string;
  worldDescription: string;
  theme: WorldTheme;
  layout: WorldLayout;
  hotspots: Hotspot[];
  sounds?: WorldSounds;
};
