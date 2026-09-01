/**
 * Blockly toolbox — categories and blocks from the active scenario.
 */
import { scenarioConfig, getActiveLevel } from "../data/scenario-config.js";

/** Blockly hue values (0–360) aligned with UI concept palette */
export const BLOCK_COLOURS = Object.freeze({
  /** AVANTI — verde */
  movement: 140,
  /** GIRA A DESTRA / SINISTRA — arancione */
  turn: 38,
  /** PRENDI / RILASCIA — viola */
  action: 285,
  /** RIPETI — ciano */
  control: 190,
});

/** Category accent colours for the toolbox tree */
export const CATEGORY_COLOURS = Object.freeze({
  movement: "#3d9a5a",
  action: "#7b5ea7",
  control: "#3ecfc9",
});

/** Public block ids → Blockly type */
export const BLOCK_TYPE_BY_ID = Object.freeze({
  move_forward: "lanterna_forward",
  turn_right: "lanterna_turn_right",
  turn_left: "lanterna_turn_left",
  repeat: "lanterna_repeat",
  grip: "lanterna_grab",
  release: "lanterna_release",
});

/**
 * Grip/release stay in the starter program, not in the flyout.
 * @param {string[]} [blocchiDisponibili]
 * @returns {Blockly.utils.toolbox.ToolboxDefinition}
 */
export function buildToolbox(blocchiDisponibili = getActiveLevel().blocchiDisponibili) {
  const copy = scenarioConfig.copy;
  const available = new Set(blocchiDisponibili ?? []);

  const movement = [];
  if (available.has("move_forward")) {
    movement.push({ kind: "block", type: BLOCK_TYPE_BY_ID.move_forward });
  }
  if (available.has("turn_right")) {
    movement.push({ kind: "block", type: BLOCK_TYPE_BY_ID.turn_right });
  }
  if (available.has("turn_left")) {
    movement.push({ kind: "block", type: BLOCK_TYPE_BY_ID.turn_left });
  }

  const control = [];
  if (available.has("repeat")) {
    control.push({ kind: "block", type: BLOCK_TYPE_BY_ID.repeat });
  }

  const contents = [];
  if (movement.length) {
    contents.push({
      kind: "category",
      name: copy.toolbox.movement,
      colour: CATEGORY_COLOURS.movement,
      contents: movement,
    });
  }
  if (control.length) {
    contents.push({
      kind: "category",
      name: copy.toolbox.control,
      colour: CATEGORY_COLOURS.control,
      contents: control,
    });
  }

  return {
    kind: "categoryToolbox",
    contents,
  };
}

/** @type {Blockly.utils.toolbox.ToolboxDefinition} */
export const toolboxDefinition = buildToolbox();
