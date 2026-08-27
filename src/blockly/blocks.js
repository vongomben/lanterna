/**
 * Codice Lanterna — custom Blockly block definitions (editor only).
 * No gameplay logic, no code generation, no imports from game/.
 */
import * as Blockly from "blockly/core";
import { FieldNumber } from "blockly/core";
import { toolboxDefinition } from "./toolbox.js";
import { BLOCK_COLOURS } from "./toolbox.js";
import {
  loadStarterProgram,
  resetStarterProgram,
} from "./starterProgram.js";
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
 * @param {{ onProgramReset?: () => void }} [options]
 * @returns {import("blockly").WorkspaceSvg}
 */
export function initBlockly(container, { onProgramReset } = {}) {
  setupBlockContextMenu();

  const useTouchLayout =
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 768px)").matches;

  workspace = Blockly.inject(container, {
    toolbox: toolboxDefinition,
    theme: lanternaTheme,
    renderer: "geras",
    horizontalLayout: useTouchLayout,
    toolboxPosition: "start",
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
      startScale: useTouchLayout ? 0.82 : 0.95,
      maxScale: 1.4,
      minScale: useTouchLayout ? 0.6 : 0.7,
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

  setupWorkspaceResize(container, workspace);
  loadStarterProgram(workspace);
  setupTrashReset(container, workspace, onProgramReset);

  return workspace;
}

/**
 * Turn Blockly's trash icon into an explicit reset-to-starter action.
 * A click is distinct from dropping a block onto the trash.
 * @param {HTMLElement} container
 * @param {import("blockly").WorkspaceSvg} ws
 * @param {(() => void) | undefined} onProgramReset
 */
function setupTrashReset(container, ws, onProgramReset) {
  const nativeTrash = container.querySelector(".blocklyTrash");
  nativeTrash?.setAttribute("aria-hidden", "true");

  // Prevent duplicate controls if Blockly is initialized again (e.g. HMR).
  container.querySelectorAll(".blockly-reset-program").forEach((button) => {
    button.remove();
  });

  const resetButton = document.createElement("button");
  resetButton.type = "button";
  resetButton.className = "blockly-reset-program";
  resetButton.setAttribute("aria-label", "Ripristina il programma iniziale");
  resetButton.title = "Ripristina il programma iniziale";

  resetButton.addEventListener("click", () => {
    resetStarterProgram(ws);
    onProgramReset?.();
  });

  container.append(resetButton);
}

/**
 * @param {HTMLElement} container
 * @param {import("blockly").WorkspaceSvg} ws
 */
function setupWorkspaceResize(container, ws) {
  const resize = () => {
    const injectionDiv = container.querySelector(":scope > .injectionDiv");
    if (injectionDiv instanceof HTMLElement) {
      injectionDiv.style.width = `${container.clientWidth}px`;
      injectionDiv.style.height = `${container.clientHeight}px`;
    }
    Blockly.svgResize(ws);
  };

  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(resize);
    observer.observe(container);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", resize);

  // Mobile browsers can finalize flex/grid dimensions over multiple frames.
  requestAnimationFrame(() => {
    resize();
    requestAnimationFrame(resize);
  });
}

/** @returns {import("blockly").WorkspaceSvg | null} */
export function getBlocklyWorkspace() {
  return workspace;
}
