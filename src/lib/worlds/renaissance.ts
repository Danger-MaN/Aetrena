import type { WorldConfig } from "./types";

// Florentine gallery: tall marble columns along the side walls, plinths
// down the middle holding artworks.
export const renaissance: WorldConfig = {
  id: "renaissance",
  persona: "lorenzo",
  guideLabel: "Lorenzo · Florentine Curator",
  worldDescription: "a Florentine art gallery during the High Renaissance, around 1500 CE",
  theme: {
    bg: "#1a1208",
    fog: "#2a1f10",
    fogNear: 9,
    fogFar: 30,
    ambient: "#fff0c8",
    ambientIntensity: 0.38,
    envPreset: "warehouse",
    envIntensity: 0.55,
    ground: "#6e4a26",
    wall: "#2a1810",
    columnShaft: "#e8dcc4",
    columnBand: "#7a5a2e",
    columnCap: "#c9a44a",
    sparkleColor: "#ffe4a0",
    torchColor: "#ffb24a",
    torchLight: "#ffd08a",
    hotspotColor: "#f0c878",
    hotspotEmissive: "#d49040",
    hotspotLight: "#ffd28a",
  },
  layout: {
    bounds: { minX: -6.5, maxX: 6.5, minZ: -9, maxZ: 3.5 },
    ground: { size: [40, 40] },
    backWall: { pos: [0, 5, -10], size: [40, 12] },
    props: [
      // Tall marble columns along both side walls
      ...[-7, -2.5, 2.5, 7].flatMap((x) => [
        { kind: "column" as const, pos: [-7, x] as [number, number], height: 6 },
        { kind: "column" as const, pos: [7, x] as [number, number], height: 6 },
      ]),
      // Plinths down the center holding the hotspots
      { kind: "box", pos: [-3.2, 0.4, -2], size: [1.2, 0.8, 1.2], color: "#e8dcc4", collide: true, roughness: 0.4 },
      { kind: "box", pos: [0, 0.3, -4.5], size: [1.4, 0.6, 1.4], color: "#e8dcc4", collide: true, roughness: 0.4 },
      { kind: "box", pos: [3.4, 0.25, -1.5], size: [1.2, 0.5, 1.2], color: "#e8dcc4", collide: true, roughness: 0.4 },
      // Hanging chandelier
      { kind: "sphere", pos: [0, 4.5, -2], radius: 0.4, color: "#ffd08a", emissive: "#ffb24a", emissiveIntensity: 1.2 },
      { kind: "torch", pos: [-6, 0] },
      { kind: "torch", pos: [6, 0] },
      { kind: "torch", pos: [-6, -7] },
      { kind: "torch", pos: [6, -7] },
    ],
    sparkles: { count: 60, scale: [16, 6, 16], size: 1.5, speed: 0.15 },
  },
  hotspots: [
    { id: "vitruvian", pos: [-3.2, 0.8, -2], label: "Vitruvian Sketch" },
    { id: "david_bust", pos: [0, 0.6, -4.5], label: "Marble Bust" },
    { id: "fresco", pos: [3.4, 0.5, -1.5], label: "Fresco Panel" },
    { id: "manuscript", pos: [-1.5, 2.2, -6], label: "Illuminated Manuscript" },
  ],
  sounds: {
    ambient: "/sounds/renaissance/ambient.mp3",
    footsteps: "/sounds/renaissance/footsteps.mp3",
    positional: [
      { id: "choir", src: "/sounds/renaissance/choir.mp3", pos: [0, 4, -8], refDistance: 5, maxDistance: 22, volume: 0.55 },
      { id: "fountain", src: "/sounds/renaissance/fountain.mp3", pos: [-4, 0.5, 0], refDistance: 2, maxDistance: 10 },
      { id: "crowd", src: "/sounds/renaissance/crowd.mp3", pos: [4, 1, 2], refDistance: 3, maxDistance: 14, volume: 0.45 },
    ],
  },
};
