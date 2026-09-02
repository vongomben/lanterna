/**
 * Mission starter program — PRENDI / RILASCIA endpoints in Blockly workspace.
 * Uses Blockly 11 API (newBlock, connect, setDeletable).
 */
import * as Blockly from "blockly/core";

export const STARTER_GRAB_ID = "starter_grab";
export const STARTER_RELEASE_ID = "starter_release";

const GRAB_TYPE = "lanterna_grab";
const RELEASE_TYPE = "lanterna_release";

/** @param {import("blockly").WorkspaceSvg} workspace */
export function isStarterProgramLoaded(workspace) {
  return workspace.getBlockById(STARTER_GRAB_ID) !== null;
}

/**
 * Create and connect protected grab → release chain (once per workspace init).
 * @param {import("blockly").WorkspaceSvg} workspace
 */
export function loadStarterProgram(workspace) {
  if (isStarterProgramLoaded(workspace)) {
    return;
  }

  Blockly.Events.disable();

  try {
    const grab = workspace.newBlock(GRAB_TYPE, STARTER_GRAB_ID);
    const release = workspace.newBlock(RELEASE_TYPE, STARTER_RELEASE_ID);

    grab.initSvg();
    grab.render();
    release.initSvg();
    release.render();

    grab.nextConnection.connect(release.previousConnection);

    grab.setDeletable(false);
    release.setDeletable(false);

    grab.moveBy(56, 56);

    workspace.render();
  } finally {
    Blockly.Events.enable();
  }
}

/**
 * Restore the workspace to the exact initial PRENDI → RILASCIA program.
 * Session stats and game state are intentionally left unchanged.
 * @param {import("blockly").WorkspaceSvg} workspace
 */
export function resetStarterProgram(workspace) {
  Blockly.Events.disable();
  try {
    workspace.clear();
  } finally {
    Blockly.Events.enable();
  }

  loadStarterProgram(workspace);
  workspace.getToolbox()?.clearSelection();
  workspace.clearUndo();
  Blockly.svgResize(workspace);
}
