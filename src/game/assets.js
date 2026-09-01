/**
 * Central asset registry — loads trimmed sprites from img/generated/.
 * Originals in img/ are never used at runtime for gameplay sprites.
 */
import { scaleToCellFraction, VISUAL_SCALE } from "./grid.js";
import { usesPlaceholderVisuals } from "../data/scenario-config.js";
import manifest from "./spriteManifest.json" with { type: "json" };

const IMG = `${import.meta.env?.BASE_URL ?? "./"}img`;

/** @param {keyof typeof manifest & string} key */
function generatedPath(key) {
  const entry = manifest[key];
  if (!entry || !entry.file) throw new Error(`Missing manifest entry: ${key}`);
  return `${IMG}/${entry.file}`;
}

/** @type {Readonly<Record<string, string>>} */
export const ASSET_PATHS = Object.freeze({
  robotOpen: generatedPath("robot"),
  robotCarry: generatedPath("robotCarry"),
  payload: generatedPath("container"),
  payloadGlow: generatedPath("containerGlow"),
  payloadOpened: generatedPath("containerOpened"),
  floorClean: generatedPath("floorClean"),
  floorWorn: generatedPath("floorWorn"),
  startMarker: generatedPath("startMarker"),
  goalMarker: generatedPath("goalMarker"),
  crateWood: generatedPath("crateWood"),
  trafficCone: generatedPath("trafficCone"),
  technicalTerminal: generatedPath("technicalTerminal"),
});

const SPRITE_ENTRIES = [
  ["robot", ASSET_PATHS.robotOpen],
  ["robotCarry", ASSET_PATHS.robotCarry],
  ["payload", ASSET_PATHS.payload],
  ["payloadGlow", ASSET_PATHS.payloadGlow],
  ["payloadOpened", ASSET_PATHS.payloadOpened],
  ["floorClean", ASSET_PATHS.floorClean],
  ["floorWorn", ASSET_PATHS.floorWorn],
  ["startMarker", ASSET_PATHS.startMarker],
  ["goalMarker", ASSET_PATHS.goalMarker],
  ["crateWood", ASSET_PATHS.crateWood],
  ["trafficCone", ASSET_PATHS.trafficCone],
  ["technicalTerminal", ASSET_PATHS.technicalTerminal],
];

/** @type {Record<string, string>} */
export const PROP_SPRITE_MAP = {
  crate_wood: "crateWood",
  traffic_cone: "trafficCone",
  technical_terminal: "technicalTerminal",
};

/** Maps prop type → VISUAL_SCALE key */
export const PROP_VISUAL_SCALE = {
  crate_wood: "crate",
  traffic_cone: "cone",
  technical_terminal: "terminal",
};

/** Maps prop type → manifest sprite key */
export const PROP_MANIFEST_KEY = {
  crate_wood: "crateWood",
  traffic_cone: "trafficCone",
  technical_terminal: "technicalTerminal",
};

/**
 * @param {keyof typeof manifest & string} key
 */
export function getTrimmedSize(key) {
  const entry = manifest[key];
  if (!entry?.trimmed) {
    throw new Error(`Missing trimmed manifest entry: ${key}`);
  }
  return entry.trimmed;
}

/**
 * Scale trimmed sprite to target visible cell fraction.
 * @param {keyof typeof manifest & string} key
 * @param {number} visualFraction
 */
export function spriteScale(key, visualFraction) {
  const { width, height } = getTrimmedSize(key);
  return scaleToCellFraction(visualFraction, width, height);
}

/** Floor tiles fill the entire cell (trimmed = full canvas). */
export function floorScale() {
  return spriteScale("floorClean", 1);
}

/**
 * @param {import("kaplay").KAPLAYCtx} k
 */
export function loadGameAssets(k) {
  if (usesPlaceholderVisuals()) {
    return;
  }

  for (const [name, path] of SPRITE_ENTRIES) {
    k.loadSprite(name, path, { filter: "nearest" });
  }
}

export { manifest as SPRITE_MANIFEST, VISUAL_SCALE };
