import type { WorldConfig } from "./types";

// Ancient Egyptian hall: two rows of papyrus columns with corner torches.
const COLUMN_GRID: [number, number][] = [
  ...[-6, -3, 0, 3, 6].map((x) => [x, -7] as [number, number]),
  ...[-6, -3, 0, 3, 6].map((x) => [x, -1] as [number, number]),
];

export const egypt: WorldConfig = {
  id: "egypt",
  persona: "senebi",
  guideLabel: "Senebi · Royal Scribe",
  worldDescription: "the Hall of Pharaohs in ancient Egypt, 1300 BCE",
  theme: {
    bg: "#0a0604",
    fog: "#1a0f07",
    fogNear: 8,
    fogFar: 28,
    ambient: "#ffd9a8",
    ambientIntensity: 0.22,
    envPreset: "sunset",
    envIntensity: 0.35,
    ground: "#7a5e3e",
    wall: "#3d2a18",
    columnShaft: "#c69b67",
    columnBand: "#1f3a8a",
    columnCap: "#d4a24a",
    sparkleColor: "#ffcc88",
    torchColor: "#ff7b1a",
    torchLight: "#ffaa55",
    hotspotColor: "#e0a850",
    hotspotEmissive: "#ff9933",
    hotspotLight: "#ffb866",
  },
  layout: {
    bounds: { minX: -7.5, maxX: 7.5, minZ: -8.5, maxZ: 3.5 },
    ground: { size: [40, 40] },
    backWall: { pos: [0, 5, -10], size: [40, 12] },
    props: [
      ...COLUMN_GRID.map(([x, z]) => ({ kind: "column" as const, pos: [x, z] as [number, number] })),
      { kind: "torch", pos: [-5, 1] },
      { kind: "torch", pos: [5, 1] },
      { kind: "torch", pos: [-5, -5] },
      { kind: "torch", pos: [5, -5] },
    ],
    sparkles: { count: 120, scale: [18, 8, 18], size: 2, speed: 0.2 },
  },
  hotspots: [
    { id: "rosetta", pos: [-3.2, 0.8, -2], label: "Rosetta Stone" },
    { id: "statue", pos: [0, 0.6, -4.5], label: "Scribe Statue" },
    { id: "pottery", pos: [3.4, 0.5, -1.5], label: "Painted Vessel" },
    { id: "ankh", pos: [-1.5, 2.2, -6], label: "Ankh" },
  ],
  sounds: {
    ambient: "/sounds/egypt/ambient.mp3",
    footsteps: "/sounds/egypt/footsteps.mp3",
    positional: [
      { id: "torch_l_front", src: "/sounds/egypt/torch.mp3", pos: [-5, 1.4, 1], refDistance: 1.5, maxDistance: 8 },
      { id: "torch_r_front", src: "/sounds/egypt/torch.mp3", pos: [5, 1.4, 1], refDistance: 1.5, maxDistance: 8 },
      { id: "torch_l_back", src: "/sounds/egypt/torch.mp3", pos: [-5, 1.4, -5], refDistance: 1.5, maxDistance: 8 },
      { id: "torch_r_back", src: "/sounds/egypt/torch.mp3", pos: [5, 1.4, -5], refDistance: 1.5, maxDistance: 8 },
      { id: "wind", src: "/sounds/egypt/wind.mp3", pos: [0, 4, -10], refDistance: 6, maxDistance: 30, volume: 0.6 },
    ],
  },
};
