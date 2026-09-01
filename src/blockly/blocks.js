/**
 * Custom Blockly block definitions (editor only).
 * Labels come from the active scenario config.
 */
import * as Blockly from "blockly/core";
import { FieldNumber } from "blockly/core";
import { buildToolbox, BLOCK_COLOURS } from "./toolbox.js";
import { loadStarterProgram } from "./starterProgram.js";
import { setupBlockContextMenu } from "./contextMenu.js";
import { scenarioConfig } from "../data/scenario-config.js";

/** @type {import("blockly").WorkspaceSvg | null} */
let workspace = null;

function registerBlocks() {
  const { blocks } = scenarioConfig.copy;

  Blockly.Blocks["lanterna_grab"] = {
    init() {
      this.appendDummyInput().appendField(blocks.grab);
      this.setNextStatement(true, null);
      this.setColour(BLOCK_COLOURS.action);
      this.setTooltip(blocks.grabTooltip);
      this.setHelpUrl("");
    },
  };

  Blockly.Blocks["lanterna_forward"] = {
    init() {
      this.appendDummyInput().appendField("▲").appendField(blocks.forward);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(BLOCK_COLOURS.movement);
      this.setTooltip(blocks.forwardTooltip);
      this.setHelpUrl("");
    },
  };

  Blockly.Blocks["lanterna_turn_right"] = {
    init() {
      this.appendDummyInput().appendField(blocks.turnRight);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(BLOCK_COLOURS.turn);
      this.setTooltip(blocks.turnRightTooltip);
      this.setHelpUrl("");
    },
  };

  Blockly.Blocks["lanterna_turn_left"] = {
    init() {
      this.appendDummyInput().appendField(blocks.turnLeft);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(BLOCK_COLOURS.turn);
      this.setTooltip(blocks.turnLeftTooltip);
      this.setHelpUrl("");
    },
  };

  Blockly.Blocks["lanterna_repeat"] = {
    init() {
      this.appendDummyInput()
        .appendField(blocks.repeat)
        .appendField(new FieldNumber(3, 1, 20), "TIMES")
        .appendField(blocks.times);
      this.appendStatementInput("DO");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(BLOCK_COLOURS.control);
      this.setTooltip(blocks.repeatTooltip);
      this.setHelpUrl("");
    },
  };

  Blockly.Blocks["lanterna_release"] = {
    init() {
      this.appendDummyInput().appendField(blocks.release);
      this.setPreviousStatement(true, null);
      this.setColour(BLOCK_COLOURS.action);
      this.setTooltip(blocks.releaseTooltip);
      this.setHelpUrl("");
    },
  };
}

registerBlocks();

const MOBILE_QUERY = "(max-width: 768px)";

function isMobileLayout() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

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
function injectWorkspace(container) {
  return Blockly.inject(container, {
    toolbox: buildToolbox(),
    theme: lanternaTheme,
    renderer: "geras",
    horizontalLayout: isMobileLayout(),
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
}

/**
 * @param {HTMLElement} container
 */
function reinjectForViewport(container) {
  if (!workspace) return;

  const state = Blockly.serialization.workspaces.save(workspace);
  workspace.dispose();
  workspace = injectWorkspace(container);
  Blockly.serialization.workspaces.load(state, workspace);
  requestAnimationFrame(() => {
    if (workspace) Blockly.svgResize(workspace);
  });
}

/**
 * @param {HTMLElement} container
 * @returns {import("blockly").WorkspaceSvg}
 */
export function initBlockly(container) {
  setupBlockContextMenu();

  workspace = injectWorkspace(container);
  setupWorkspaceResize(container);
  loadStarterProgram(workspace);

  window.matchMedia(MOBILE_QUERY).addEventListener("change", () => {
    reinjectForViewport(container);
  });

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
