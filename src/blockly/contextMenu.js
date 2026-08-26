/**
 * Blockly block context menu — Scratch-style "Duplica" for mission blocks.
 * Uses Blockly 11 ContextMenuRegistry + clipboard/serialization APIs.
 */
import * as Blockly from "blockly/core";
import { clipboard, ContextMenuRegistry } from "blockly/core";

/** @type {Set<string>} */
export const DUPLICABLE_BLOCK_TYPES = new Set([
  "lanterna_forward",
  "lanterna_turn_right",
  "lanterna_turn_left",
  "lanterna_repeat",
]);

const DUPLICATE_OFFSET_PX = 24;

/** Default block menu entries hidden for a simpler mission editor. */
const HIDDEN_BLOCK_MENU_IDS = [
  "blockComment",
  "blockInline",
  "blockCollapseExpand",
  "blockDisable",
  "blockHelp",
];

/** @type {boolean} */
let configured = false;

/**
 * Configure block context menu once (ContextMenuRegistry is a singleton).
 */
export function setupBlockContextMenu() {
  if (configured) {
    return;
  }
  configured = true;

  Blockly.Msg.DUPLICATE_BLOCK = "Duplica";
  Blockly.Msg.DELETE_BLOCK = "Elimina";
  Blockly.Msg.DELETE_X_BLOCKS = "Elimina %1 blocchi";

  for (const id of HIDDEN_BLOCK_MENU_IDS) {
    try {
      ContextMenuRegistry.registry.unregister(id);
    } catch {
      // Item may already be absent.
    }
  }

  try {
    ContextMenuRegistry.registry.unregister("blockDuplicate");
  } catch {
    // Item may already be absent.
  }

  ContextMenuRegistry.registry.register({
    id: "blockDuplicate",
    scopeType: ContextMenuRegistry.ScopeType.BLOCK,
    weight: 1,
    displayText: "Duplica",
    preconditionFn(scope) {
      const block = scope.block;
      if (!block || block.isInFlyout) {
        return "hidden";
      }
      if (!DUPLICABLE_BLOCK_TYPES.has(block.type)) {
        return "hidden";
      }
      if (!block.isMovable() || !block.isDuplicatable()) {
        return "disabled";
      }
      return "enabled";
    },
    callback(scope) {
      duplicateBlock(scope.block);
    },
  });
}

/**
 * Duplicate a block via official serialization/copy APIs.
 * Copies statement-input children (e.g. RIPETI body) but not the next chain.
 * @param {import("blockly").BlockSvg | undefined} block
 */
export function duplicateBlock(block) {
  if (!block) {
    return null;
  }

  const copyData = block.toCopyData();
  if (!copyData) {
    return null;
  }

  const origin = block.getRelativeToSurfaceXY();
  const target = new Blockly.utils.Coordinate(
    origin.x + DUPLICATE_OFFSET_PX,
    origin.y + DUPLICATE_OFFSET_PX,
  );

  return clipboard.paste(copyData, block.workspace, target);
}

/**
 * @param {import("blockly").BlockSvg} block
 * @returns {boolean}
 */
export function isBlockDuplicatable(block) {
  return (
    !block.isInFlyout &&
    DUPLICABLE_BLOCK_TYPES.has(block.type) &&
    block.isMovable() &&
    block.isDuplicatable()
  );
}

/** Reset singleton guard (tests only). */
export function resetBlockContextMenuForTests() {
  configured = false;
}

/**
 * @param {import("blockly").BlockSvg} block
 * @returns {string[]}
 */
export function getBlockContextMenuLabels(block) {
  return ContextMenuRegistry.registry
    .getContextMenuOptions(ContextMenuRegistry.ScopeType.BLOCK, { block })
    .map((option) =>
      typeof option.text === "string" ? option.text : String(option.text),
    );
}
