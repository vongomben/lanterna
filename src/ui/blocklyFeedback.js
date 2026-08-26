/**
 * Blockly execution feedback — highlights blocks during program run.
 * Uses Blockly 11 WorkspaceSvg.highlightBlock(); no executor/Blockly coupling.
 */

export const DEBUG_BLOCKLY_FEEDBACK = false;

/** @type {string | null} */
let activeBlockId = null;

/**
 * @param {unknown} workspace
 * @returns {import("blockly").WorkspaceSvg | null}
 */
function asWorkspaceSvg(workspace) {
  if (
    workspace &&
    typeof workspace === "object" &&
    "highlightBlock" in workspace &&
    typeof workspace.highlightBlock === "function"
  ) {
    return /** @type {import("blockly").WorkspaceSvg} */ (workspace);
  }
  return null;
}

/**
 * @param {import("blockly").WorkspaceSvg} workspace
 * @param {string} blockId
 * @returns {import("blockly").BlockSvg | null}
 */
function getBlock(workspace, blockId) {
  const block = workspace.getBlockById(blockId);
  if (!block) {
    if (DEBUG_BLOCKLY_FEEDBACK) {
      console.warn("[BlocklyFeedback] block not found:", blockId);
    }
    return null;
  }
  return /** @type {import("blockly").BlockSvg} */ (block);
}

/**
 * @param {import("blockly").BlockSvg} block
 * @param {string} className
 */
function setBlockClass(block, className, enabled) {
  const root = block.getSvgRoot();
  if (!root) return;
  root.classList.toggle(className, enabled);
}

/**
 * @param {import("blockly").WorkspaceSvg} workspace
 * @param {string} blockId
 */
export function highlightBlock(workspace, blockId) {
  const ws = asWorkspaceSvg(workspace);
  if (!ws || !blockId) return;

  if (activeBlockId === blockId) return;

  clearBlockHighlight(ws);

  const block = getBlock(ws, blockId);
  if (!block) return;

  ws.highlightBlock(blockId, true);
  setBlockClass(block, "lanterna-block-active", true);
  activeBlockId = blockId;
}

/**
 * @param {import("blockly").Workspace} workspace
 */
export function clearBlockHighlight(workspace) {
  const ws = asWorkspaceSvg(workspace);
  if (!ws) return;

  ws.highlightBlock(/** @type {null} */ (null));

  for (const block of ws.getAllBlocks(false)) {
    setBlockClass(
      /** @type {import("blockly").BlockSvg} */ (block),
      "lanterna-block-active",
      false,
    );
  }

  activeBlockId = null;
}

/**
 * @param {import("blockly").Workspace} workspace
 * @param {string} blockId
 */
export function markBlockError(workspace, blockId) {
  const ws = asWorkspaceSvg(workspace);
  if (!ws || !blockId) return;

  clearBlockHighlight(ws);

  const block = getBlock(ws, blockId);
  if (!block) return;

  ws.highlightBlock(blockId, false);
  setBlockClass(block, "lanterna-block-active", false);
  setBlockClass(block, "lanterna-block-error", true);
}

/**
 * @param {import("blockly").Workspace} workspace
 */
export function clearBlockError(workspace) {
  const ws = asWorkspaceSvg(workspace);
  if (!ws) return;

  for (const block of ws.getAllBlocks(false)) {
    setBlockClass(
      /** @type {import("blockly").BlockSvg} */ (block),
      "lanterna-block-error",
      false,
    );
  }
}

/**
 * @param {import("blockly").Workspace} workspace
 */
export function clearAllBlockFeedback(workspace) {
  clearBlockHighlight(workspace);
  clearBlockError(workspace);
}

/**
 * @param {string} code
 * @returns {boolean}
 */
function shouldMarkBlockError(code) {
  return (
    code !== "PROGRAM_STOPPED" &&
    code !== "PROGRAM_TOO_LONG" &&
    code !== "ALREADY_RUNNING"
  );
}

/**
 * @param {import("blockly").Workspace} workspace
 * @returns {import("../blockly/executor.js").ExecutorHooks}
 */
export function createExecutorFeedbackHooks(workspace) {
  return {
    onCommandStart({ blockId }) {
      highlightBlock(workspace, blockId);
    },
    onProgramEnd(result) {
      clearBlockHighlight(workspace);

      if (result.ok && result.terminal) {
        clearBlockError(workspace);
        return;
      }

      if (
        !result.ok &&
        result.error?.blockId &&
        shouldMarkBlockError(result.error.code)
      ) {
        markBlockError(workspace, result.error.blockId);
      } else if (result.ok) {
        clearBlockError(workspace);
      }
    },
  };
}
