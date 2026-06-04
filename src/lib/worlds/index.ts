// Registry of all worlds. Each world lives in its own file in this folder.
//
// To add a new world:
//   1. Create ./<name>.ts and `export const <name>: WorldConfig = { ... }`.
//      (Copy egypt.ts as a starting point — it shows every field.)
//   2. Register it below and add the id to the `WorldId` union in types.ts.
//   3. Add a route file `src/routes/worlds.<name>.tsx` that renders
//      `<WorldExperience config={WORLDS.<name>} />`.
//
// See ./README.md for a full reference of the layout schema.

import type { WorldConfig, WorldId } from "./types";
import { egypt } from "./egypt";
import { atlantis } from "./atlantis";
import { renaissance } from "./renaissance";
import { modern } from "./modern";

export type {
  Hotspot,
  WorldTheme,
  WorldConfig,
  WorldId,
  WorldSounds,
  PositionalSound,
  WorldLayout,
  Prop,
  ColumnProp,
  TorchProp,
  BoxProp,
  CylinderProp,
  SphereProp,
} from "./types";

export const WORLDS: Record<WorldId, WorldConfig> = {
  egypt,
  atlantis,
  renaissance,
  modern,
};
