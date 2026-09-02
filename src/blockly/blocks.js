/**
 * Custom Blockly block definitions (editor only).
 * Labels come from the active scenario config.
 */
import * as Blockly from "blockly/core";
import { FieldNumber } from "blockly/core";
import { buildToolbox, BLOCK_COLOURS } from "./toolbox.js";
import {
  loadStarterProgram,
  resetStarterProgram,
} from "./starterProgram.js";
import { setupBlockContextMenu } from "./contextMenu.js";
import { scenarioConfig } from "../data/scenario-config.js";

/** @type {import("blockly").WorkspaceSvg | null} */
let workspace = null;

/** @type {(() => void) | undefined} */
let programResetHook;

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
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia(MOBILE_QUERY).matches
  );
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
  const useTouchLayout = isMobileLayout();
  return Blockly.inject(container, {
    toolbox: buildToolbox(),
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
  setupTrashReset(container, workspace);
  setupWorkspaceResize(container);
  requestAnimationFrame(() => {
    if (workspace) Blockly.svgResize(workspace);
  });
}

/**
 * @param {HTMLElement} container
 * @param {{ onProgramReset?: () => void }} [options]
 * @returns {import("blockly").WorkspaceSvg}
 */
export function initBlockly(container, { onProgramReset } = {}) {
  programResetHook = onProgramReset;
  setupBlockContextMenu();

  workspace = injectWorkspace(container);
  setupWorkspaceResize(container);
  loadStarterProgram(workspace);
  setupTrashReset(container, workspace);

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
 * Turn Blockly's trash icon into an explicit reset-to-starter action.
 * A click is distinct from dropping a block onto the trash.
 * @param {HTMLElement} container
 * @param {import("blockly").WorkspaceSvg} ws
 */
function setupTrashReset(container, ws) {
  const nativeTrash = container.querySelector(".blocklyTrash");
  nativeTrash?.setAttribute("aria-hidden", "true");

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
    programResetHook?.();
  });

  container.append(resetButton);
}

/**
 * @param {HTMLElement} container
 */
function setupWorkspaceResize(container) {
  const resize = () => {
    const injectionDiv = container.querySelector(":scope > .injectionDiv");
    if (injectionDiv instanceof HTMLElement) {
      injectionDiv.style.width = `${container.clientWidth}px`;
      injectionDiv.style.height = `${container.clientHeight}px`;
    }
    if (workspace) Blockly.svgResize(workspace);
  };

  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(resize);
    observer.observe(container);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", resize);
  window.matchMedia(MOBILE_QUERY).addEventListener("change", resize);

  requestAnimationFrame(() => {
    resize();
    requestAnimationFrame(resize);
  });
}

/** @returns {import("blockly").WorkspaceSvg | null} */
export function getBlocklyWorkspace() {
  return workspace;
}
