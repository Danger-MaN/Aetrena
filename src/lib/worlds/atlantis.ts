import type { WorldConfig } from "./types";

// Sunken citadel: a circular ring of coral pillars + glowing crystal orbs.
const RING: [number, number][] = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2;
  return [Math.cos(a) * 6, Math.sin(a) * 6 - 3] as [number, number];
});

export const atlantis: WorldConfig = {
  id: "atlantis",
  persona: "thalassa",
  guideLabel: "Thalassa · Keeper of the Deep",
  worldDescription: "the sunken citadel of Atlantis, a lost city beneath the sea",
  theme: {
    bg: "#02101a",
    fog: "#0a3550",
    fogNear: 6,
    fogFar: 24,
    ambient: "#a8e0ff",
    ambientIntensity: 0.35,
    envPreset: "night",
    envIntensity: 0.6,
    ground: "#1d4a5a",
    wall: "#0a2030",
    columnShaft: "#5fb8c4",
    columnBand: "#0e3a55",
    columnCap: "#a4f0e8",
    sparkleColor: "#7fe7ff",
    torchColor: "#3ad6ff",
    torchLight: "#5fd0ff",
    hotspotColor: "#7feadf",
    hotspotEmissive: "#3ad6ff",
    hotspotLight: "#7feadf",
  },
  layout: {
    bounds: { minX: -7.5, maxX: 7.5, minZ: -9, maxZ: 3.5 },
    ground: { size: [40, 40], color: "#1d4a5a" },
    backWall: { pos: [0, 5, -10], size: [40, 12], color: "#0a2030" },
    props: [
      ...RING.map(([x, z]) => ({ kind: "column" as const, pos: [x, z] as [number, number], height: 4 })),
      // Glowing crystal orbs floating around the ring
      { kind: "sphere", pos: [-4, 2.6, -3], radius: 0.45, color: "#7feadf", emissive: "#3ad6ff", emissiveIntensity: 1.4 },
      { kind: "sphere", pos: [4, 3.2, -3], radius: 0.55, color: "#a4f0e8", emissive: "#3ad6ff", emissiveIntensity: 1.6 },
      { kind: "sphere", pos: [0, 4, -7], radius: 0.7, color: "#7feadf", emissive: "#3ad6ff", emissiveIntensity: 1.8 },
      // Central altar
      { kind: "cylinder", pos: [0, 0.3, -4.5], radius: 1.2, height: 0.6, color: "#0e3a55", collide: true },
      { kind: "torch", pos: [-3, 2], flameColor: "#3ad6ff", lightColor: "#5fd0ff" },
      { kind: "torch", pos: [3, 2], flameColor: "#3ad6ff", lightColor: "#5fd0ff" },
    ],
    sparkles: { count: 200, scale: [18, 10, 18], size: 3, speed: 0.4 },
  },
  hotspots: [
    { id: "trident", pos: [-3.2, 0.8, -2], label: "Trident of the Sea King" },
    { id: "crystal_core", pos: [0, 0.6, -4.5], label: "Resonant Crystal" },
    { id: "tablet", pos: [3.4, 0.5, -1.5], label: "Atlantean Tablet" },
    { id: "coral_throne", pos: [-1.5, 2.2, -6], label: "Coral Throne" },
  ],
  sounds: {
    ambient: "/sounds/atlantis/ambient.mp3",
    footsteps: "/sounds/atlantis/footsteps.mp3",
    positional: [
      { id: "waves_front", src: "/sounds/atlantis/waves.mp3", pos: [0, 0.5, 3], refDistance: 3, maxDistance: 20 },
      { id: "bubbles_l", src: "/sounds/atlantis/bubbles.mp3", pos: [-6, 1, -3], refDistance: 2, maxDistance: 10 },
      { id: "bubbles_r", src: "/sounds/atlantis/bubbles.mp3", pos: [6, 1, -3], refDistance: 2, maxDistance: 10 },
      { id: "whale", src: "/sounds/atlantis/whale.mp3", pos: [0, 5, -10], refDistance: 8, maxDistance: 30, volume: 0.5 },
    ],
  },
};
