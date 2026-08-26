/**
 * Codice Lanterna — Blockly toolbox (mission blocks only).
 */

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

/** @type {Blockly.utils.toolbox.ToolboxDefinition} */
export const toolboxDefinition = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: "MOVIMENTO",
      colour: CATEGORY_COLOURS.movement,
      contents: [
        { kind: "block", type: "lanterna_forward" },
        { kind: "block", type: "lanterna_turn_right" },
        { kind: "block", type: "lanterna_turn_left" },
      ],
    },
    {
      kind: "category",
      name: "CONTROLLO",
      colour: CATEGORY_COLOURS.control,
      contents: [{ kind: "block", type: "lanterna_repeat" }],
    },
  ],
};
