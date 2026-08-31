/**
 * Codice Lanterna — custom Blockly block definitions (editor only).
 * No gameplay logic, no code generation, no imports from game/.
 */
import * as Blockly from "blockly/core";
import { FieldNumber } from "blockly/core";
import { toolboxDefinition } from "./toolbox.js";
import { BLOCK_COLOURS } from "./toolbox.js";
import { loadStarterProgram } from "./starterProgram.js";
import { setupBlockContextMenu } from "./contextMenu.js";

/** @type {import("blockly").WorkspaceSvg | null} */
let workspace = null;

Blockly.Blocks["lanterna_grab"] = {
  init() {
    this.appendDummyInput().appendField("PRENDI CONTAINER");
    this.setNextStatement(true, null);
    this.setColour(BLOCK_COLOURS.action);
    this.setTooltip("Afferra il container con la pinza del robot");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["lanterna_forward"] = {
  init() {
    this.appendDummyInput().appendField("▲").appendField("AVANTI");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(BLOCK_COLOURS.movement);
    this.setTooltip("Muovi il robot di una cella nella direzione della pinza");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["lanterna_turn_right"] = {
  init() {
    this.appendDummyInput().appendField("GIRA A DESTRA");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(BLOCK_COLOURS.turn);
    this.setTooltip("Ruota il robot di 90° verso destra");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["lanterna_turn_left"] = {
  init() {
    this.appendDummyInput().appendField("GIRA A SINISTRA");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(BLOCK_COLOURS.turn);
    this.setTooltip("Ruota il robot di 90° verso sinistra");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["lanterna_repeat"] = {
  init() {
    this.appendDummyInput()
      .appendField("RIPETI")
      .appendField(new FieldNumber(3, 1, 20), "TIMES")
      .appendField("VOLTE");
    this.appendStatementInput("DO");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(BLOCK_COLOURS.control);
    this.setTooltip("Ripete i blocchi interni un numero di volte");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["lanterna_release"] = {
  init() {
    this.appendDummyInput().appendField("RILASCIA CONTAINER");
    this.setPreviousStatement(true, null);
    this.setColour(BLOCK_COLOURS.action);
    this.setTooltip("Rilascia il container trasportato");
    this.setHelpUrl("");
  },
};

const lanternaTheme = Blockly.Theme.defineTheme("lanterna", {
  base: Blockly.Themes.Classic,
  fontStyle: {
    family: "system-ui, Segoe UI, Roboto, sans-serif",
    weight: "600",
    size: 13,
  },
  componentStyles: {
    workspaceBackgroundColour: "#1a2832",
    toolboxBackgroundColour: "#1e3d4f",
    toolboxForegroundColour: "#f7f9fb",
    flyoutBackgroundColour: "#142a36",
    flyoutForegroundColour: "#f7f9fb",
    scrollbarColour: "#2a5568",
    insertionMarkerColour: "#3ecfc9",
    insertionMarkerOpacity: 0.45,
  },
});

/**
 * @param {HTMLElement} container
 * @returns {import("blockly").WorkspaceSvg}
 */
export function initBlockly(container) {
  setupBlockContextMenu();

  workspace = Blockly.inject(container, {
    toolbox: toolboxDefinition,
    theme: lanternaTheme,
    renderer: "geras",
    grid: {
      spacing: 24,
      length: 3,
      colour: "#2a5568",
      snap: true,
    },
    zoom: {
      controls: true,
      wheel: true,
      pinch: true,
      startScale: 0.95,
      maxScale: 1.4,
      minScale: 0.7,
      scaleSpeed: 1.08,
    },
    trashcan: true,
    /** 0 = drop-to-delete only, no recycle-bin flyout on click (Blockly 11+) */
    maxTrashcanContents: 0,
    move: {
      scrollbars: { horizontal: true, vertical: true },
      drag: true,
      wheel: true,
    },
    sounds: false,
  });

  setupWorkspaceResize(container);
  loadStarterProgram(workspace);

  return workspace;
}

/**
 * Recalculate Blockly metrics after layout changes (splash dismiss, viewport).
 */
export function resizeBlocklyWorkspace() {
  if (workspace) {
    Blockly.svgResize(workspace);
  }
}

/**
 * @param {HTMLElement} container
 */
function setupWorkspaceResize(container) {
  const resize = () => {
    if (workspace) Blockly.svgResize(workspace);
  };

  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(resize);
    observer.observe(container);
  }

  window.addEventListener("resize", resize);
  window.matchMedia("(max-width: 768px)").addEventListener("change", resize);
  requestAnimationFrame(resize);
}

/** @returns {import("blockly").WorkspaceSvg | null} */
export function getBlocklyWorkspace() {
  return workspace;
}
