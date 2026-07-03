/**
 * Raw resource definitions.
 *
 * Every raw material that can appear in a crafting cost or the
 * optimizer's inventory is declared here so the rest of the app
 * can iterate over a single canonical list.
 */

export type ResourceId =
  | "sulfur"
  | "charcoal"
  | "metalFragments"
  | "lowGradeFuel"
  | "cloth"
  | "techTrash"
  | "metalPipe"
  | "rope"
  | "emptyPropaneTank";

export interface ResourceDef {
  id: ResourceId;
  name: string;
  /** Icon file name inside /public/icons (without extension). */
  icon: string;
  /** Whether the optimizer exposes an inventory input for it. */
  optimizerInput: boolean;
}

export const RESOURCES: readonly ResourceDef[] = [
  { id: "sulfur", name: "Sulfur", icon: "sulfur", optimizerInput: true },
  { id: "charcoal", name: "Charcoal", icon: "charcoal", optimizerInput: true },
  { id: "metalFragments", name: "Metal Fragments", icon: "metal-fragments", optimizerInput: true },
  { id: "lowGradeFuel", name: "Low Grade Fuel", icon: "low-grade-fuel", optimizerInput: true },
  { id: "cloth", name: "Cloth", icon: "cloth", optimizerInput: true },
  { id: "techTrash", name: "Tech Trash", icon: "tech-trash", optimizerInput: true },
  { id: "metalPipe", name: "Metal Pipe", icon: "metal-pipe", optimizerInput: true },
  { id: "rope", name: "Rope", icon: "rope", optimizerInput: true },
  { id: "emptyPropaneTank", name: "Empty Propane Tank", icon: "propane-tank", optimizerInput: true },
] as const;

/** A bag of raw resources, e.g. a crafting cost or a player inventory. */
export type ResourceBag = Partial<Record<ResourceId, number>>;

/** Add `b` into `a` (mutating helper used by the calculators). */
export function addBag(a: Record<ResourceId, number>, b: ResourceBag, times = 1): void {
  for (const [key, value] of Object.entries(b) as [ResourceId, number][]) {
    a[key] = (a[key] ?? 0) + value * times;
  }
}

export function emptyBag(): Record<ResourceId, number> {
  return {
    sulfur: 0,
    charcoal: 0,
    metalFragments: 0,
    lowGradeFuel: 0,
    cloth: 0,
    techTrash: 0,
    metalPipe: 0,
    rope: 0,
    emptyPropaneTank: 0,
  };
}
