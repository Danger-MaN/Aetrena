import type { WorldConfig } from "./types";

// Contemporary museum: minimal architecture, neon strips, clean white plinths.
export const modern: WorldConfig = {
  id: "modern",
  persona: "ada",
  guideLabel: "Ada · Curator",
  worldDescription: "a contemporary museum of art and technology in the present day",
  theme: {
    bg: "#0c0d10",
    fog: "#15171c",
    fogNear: 10,
    fogFar: 32,
    ambient: "#e8f0ff",
    ambientIntensity: 0.45,
    envPreset: "city",
    envIntensity: 0.6,
    ground: "#1a1c22",
    wall: "#0f1115",
    columnShaft: "#dde2ea",
    columnBand: "#2a2e36",
    columnCap: "#9aa3b2",
    sparkleColor: "#a8c8ff",
    torchColor: "#6fa8ff",
    torchLight: "#8ab4ff",
    hotspotColor: "#9fd4ff",
    hotspotEmissive: "#3a8fe0",
    hotspotLight: "#a8c8ff",
  },
  layout: {
    bounds: { minX: -7.5, maxX: 7.5, minZ: -9, maxZ: 3.5 },
    ground: { size: [40, 40] },
    backWall: { pos: [0, 5, -10], size: [40, 12] },
    props: [
      // Minimalist white plinths for each artwork
      { kind: "box", pos: [-3.2, 0.4, -2], size: [1, 0.8, 1], color: "#f5f7fa", collide: true, roughness: 0.2 },
      { kind: "box", pos: [0, 0.3, -4.5], size: [1.2, 0.6, 1.2], color: "#f5f7fa", collide: true, roughness: 0.2 },
      { kind: "box", pos: [3.4, 0.25, -1.5], size: [1, 0.5, 1], color: "#f5f7fa", collide: true, roughness: 0.2 },
      // Floor-to-ceiling neon strips along the side walls
      { kind: "box", pos: [-7.5, 3, -4], size: [0.1, 6, 0.1], color: "#9fd4ff", emissive: "#3a8fe0", emissiveIntensity: 2 },
      { kind: "box", pos: [7.5, 3, -4], size: [0.1, 6, 0.1], color: "#9fd4ff", emissive: "#3a8fe0", emissiveIntensity: 2 },
      { kind: "box", pos: [-7.5, 3, 2], size: [0.1, 6, 0.1], color: "#9fd4ff", emissive: "#3a8fe0", emissiveIntensity: 2 },
      { kind: "box", pos: [7.5, 3, 2], size: [0.1, 6, 0.1], color: "#9fd4ff", emissive: "#3a8fe0", emissiveIntensity: 2 },
      // Ceiling spotlight rail (decorative)
      { kind: "box", pos: [0, 5.5, -4], size: [12, 0.1, 0.2], color: "#2a2e36" },
    ],
    sparkles: { count: 40, scale: [18, 10, 18], size: 1, speed: 0.1 },
  },
  hotspots: [
    { id: "neon_sculpture", pos: [-3.2, 0.8, -2], label: "Neon Sculpture" },
    { id: "ai_portrait", pos: [0, 0.6, -4.5], label: "AI Portrait" },
    { id: "kinetic_orb", pos: [3.4, 0.5, -1.5], label: "Kinetic Orb" },
    { id: "data_totem", pos: [-1.5, 2.2, -6], label: "Data Totem" },
  ],
  sounds: {
    ambient: "/sounds/modern/ambient.mp3",
    footsteps: "/sounds/modern/footsteps.mp3",
    positional: [
      { id: "hum_l", src: "/sounds/modern/neon-hum.mp3", pos: [-3.2, 1.2, -2], refDistance: 1.5, maxDistance: 8 },
      { id: "hum_r", src: "/sounds/modern/neon-hum.mp3", pos: [3.4, 1.2, -1.5], refDistance: 1.5, maxDistance: 8 },
      { id: "chatter", src: "/sounds/modern/visitors.mp3", pos: [0, 1.5, 3], refDistance: 4, maxDistance: 18, volume: 0.4 },
    ],
  },
};
