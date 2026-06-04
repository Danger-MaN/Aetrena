# Worlds

Every world is described by a **single file** in this folder. The file
exports a `WorldConfig` object that fully defines the world: its colors,
its 3D layout, its hotspots and its sounds.

```
src/lib/worlds/
├── types.ts        ← schema (read this once)
├── index.ts        ← registry of all worlds
├── egypt.ts        ← example world
├── atlantis.ts
├── renaissance.ts
└── modern.ts
```

## Add a new world in 3 steps

1. **Copy a file.** Duplicate `egypt.ts` → `mars.ts` and rename the export.
2. **Register it.** In `index.ts`, import it and add it to `WORLDS`.
   Add the new id to the `WorldId` union in `types.ts`.
3. **Add a route.** Create `src/routes/worlds.mars.tsx` that renders
   `<WorldExperience config={WORLDS.mars} />`.

That's it. No 3D code to edit.

## Edit an existing world

Open its file and tweak any of these sections. Changes hot-reload.

### `theme` — colors & lighting
Background, fog, environment preset, base column/torch/hotspot colors.

### `layout` — the actual shape of the world
```ts
layout: {
  bounds: { minX: -7.5, maxX: 7.5, minZ: -8.5, maxZ: 3.5 },
  ground: { size: [40, 40] },
  backWall: { pos: [0, 5, -10], size: [40, 12] },  // optional
  props: [
    { kind: "column", pos: [-3, -2] },
    { kind: "torch",  pos: [5, 1] },
    { kind: "box",    pos: [0, 0.4, -4], size: [1.2, 0.8, 1.2], color: "#fff", collide: true },
    { kind: "cylinder", pos: [0, 0.3, -1], radius: 0.6, height: 0.6, color: "#888" },
    { kind: "sphere", pos: [0, 3, -5], radius: 0.5, color: "#fff", emissive: "#3ad6ff" },
  ],
  sparkles: { count: 120 },  // optional
}
```

**Prop kinds:**

| kind        | required fields                              | notes                                  |
|-------------|----------------------------------------------|----------------------------------------|
| `column`    | `pos:[x,z]`                                  | auto-collides; uses theme colors       |
| `torch`     | `pos:[x,z]`                                  | flickering point light + flame         |
| `box`       | `pos:[x,y,z]`, `size:[w,h,d]`, `color`       | `collide:true` blocks the player       |
| `cylinder`  | `pos:[x,y,z]`, `radius`, `height`, `color`   | `collide:true` blocks the player       |
| `sphere`    | `pos:[x,y,z]`, `radius`, `color`             | use `emissive` for glowing orbs        |

Coordinates are in meters. `y=0` is the floor, `+z` is toward the camera
start, `-z` is into the scene.

### `hotspots` — interactive points
Each hotspot becomes a clickable artifact and triggers the guide chat.

### `sounds` — ambient bed + footsteps + positional 3D audio
Place audio files in `public/sounds/<world-id>/` and reference them here.
