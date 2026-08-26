/**
 * PROMPT 10.2 — context menu duplicate tests (run in browser console or via import).
 * Usage: import('/scripts/test-context-menu.mjs') in devtools on localhost:5173
 */
import { getBlocklyWorkspace } from "/src/blockly/blocks.js";
import {
  duplicateBlock,
  isBlockDuplicatable,
  getBlockContextMenuLabels,
  DUPLICABLE_BLOCK_TYPES,
} from "/src/blockly/contextMenu.js";
import { STARTER_GRAB_ID, STARTER_RELEASE_ID } from "/src/blockly/starterProgram.js";
import { parseWorkspace } from "/src/blockly/parser.js";

/** @param {import('blockly').Block} start */
function chainTypes(start) {
  const types = [];
  let cur = start;
  while (cur) {
    types.push(cur.type);
    cur = cur.getNextBlock();
  }
  return types;
}

/** @param {import('blockly').BlockSvg} block */
function descendantIds(block) {
  return block.getDescendants(false).map((b) => b.id);
}

/**
 * @param {import('blockly').WorkspaceSvg} ws
 * @param {string} type
 */
function findBlockByType(ws, type) {
  return ws.getAllBlocks(false).find((b) => b.type === type) ?? null;
}

export async function runContextMenuTests() {
  const ws = getBlocklyWorkspace();
  if (!ws) {
    throw new Error("Blockly workspace not initialized");
  }

  const results = {};

  // Reset workspace to starter only
  ws.getAllBlocks(false)
    .filter((b) => b.id !== STARTER_GRAB_ID && b.id !== STARTER_RELEASE_ID)
    .forEach((b) => b.dispose());

  const grab = ws.getBlockById(STARTER_GRAB_ID);
  const release = ws.getBlockById(STARTER_RELEASE_ID);
  if (!grab.nextConnection.isConnected()) {
    grab.nextConnection.connect(release.previousConnection);
  }

  const toolbox = ws.getToolbox();
  const flyout = toolbox.getFlyout();

  /** @param {string} type @param {number} cat */
  function addFromFlyout(type, cat) {
    toolbox.selectItemByPosition(cat);
    const fly = flyout.getWorkspace().getAllBlocks(false).find((b) => b.type === type);
    const nb = flyout.createBlock(fly);
    nb.initSvg();
    nb.render();
    return nb;
  }

  // --- Test A: duplicate AVANTI ---
  ws.getAllBlocks(false)
    .filter((b) => b.id !== STARTER_GRAB_ID && b.id !== STARTER_RELEASE_ID)
    .forEach((b) => b.dispose());
  grab.nextConnection.connect(release.previousConnection);

  const avanti1 = addFromFlyout("lanterna_forward", 0);
  grab.nextConnection.disconnect();
  grab.nextConnection.connect(avanti1.previousConnection);
  avanti1.nextConnection.connect(release.previousConnection);

  const avantiCopy = duplicateBlock(avanti1);
  results.testA = {
    count: ws.getAllBlocks(false).filter((b) => b.type === "lanterna_forward").length,
    distinctIds:
      avanti1.id !== avantiCopy?.id &&
      ws.getAllBlocks(false).filter((b) => b.type === "lanterna_forward").length === 2,
    duplicatable: isBlockDuplicatable(avanti1),
  };

  // --- Test B: duplicate GIRA A DESTRA standalone ---
  ws.getAllBlocks(false)
    .filter((b) => b.id !== STARTER_GRAB_ID && b.id !== STARTER_RELEASE_ID)
    .forEach((b) => b.dispose());
  grab.nextConnection.connect(release.previousConnection);

  const turn = addFromFlyout("lanterna_turn_right", 0);
  turn.moveBy(200, 120);
  const turnCopy = duplicateBlock(turn);
  results.testB = {
    distinctIds: turn.id !== turnCopy?.id,
    copyConnected: !turnCopy?.previousConnection?.isConnected() && !turnCopy?.nextConnection?.isConnected(),
  };

  // --- Test C: duplicate RIPETI with inner blocks ---
  ws.getAllBlocks(false)
    .filter((b) => b.id !== STARTER_GRAB_ID && b.id !== STARTER_RELEASE_ID)
    .forEach((b) => b.dispose());
  grab.nextConnection.connect(release.previousConnection);

  const repeat = addFromFlyout("lanterna_repeat", 1);
  const innerA = addFromFlyout("lanterna_forward", 0);
  const innerB = addFromFlyout("lanterna_turn_right", 0);
  repeat.getInput("DO").connection.connect(innerA.previousConnection);
  innerA.nextConnection.connect(innerB.previousConnection);
  repeat.moveBy(180, 80);

  const origIds = descendantIds(repeat);
  const repeatCopy = duplicateBlock(repeat);
  const copyIds = repeatCopy ? descendantIds(repeatCopy) : [];
  const copyInnerTypes = repeatCopy
    ? repeatCopy.getInputTargetBlock("DO")
      ? chainTypes(repeatCopy.getInputTargetBlock("DO"))
      : []
    : [];

  repeatCopy?.getField("TIMES")?.setValue(7);
  results.testC = {
    innerChain: copyInnerTypes,
    allNewIds: copyIds.every((id) => !origIds.includes(id)),
    timesIndependent: repeat.getFieldValue("TIMES") !== repeatCopy?.getFieldValue("TIMES"),
  };

  // --- Test D: duplicate AVANTI in chain must not copy GIRA/RILASCIA ---
  ws.getAllBlocks(false)
    .filter((b) => b.id !== STARTER_GRAB_ID && b.id !== STARTER_RELEASE_ID)
    .forEach((b) => b.dispose());
  grab.nextConnection.connect(release.previousConnection);

  const av = addFromFlyout("lanterna_forward", 0);
  const gi = addFromFlyout("lanterna_turn_left", 0);
  grab.nextConnection.connect(av.previousConnection);
  av.nextConnection.connect(gi.previousConnection);
  gi.nextConnection.connect(release.previousConnection);

  const beforeCount = ws.getAllBlocks(false).length;
  const avCopy = duplicateBlock(av);
  const afterCount = ws.getAllBlocks(false).length;
  results.testD = {
    addedBlocks: afterCount - beforeCount,
    copyNextType: avCopy?.getNextBlock()?.type ?? null,
    chainUnchanged: chainTypes(grab).join("|") === "lanterna_grab|lanterna_forward|lanterna_turn_left|lanterna_release",
  };

  // --- Test E: PRENDI/RILASCIA not duplicatable ---
  results.testE = {
    grabDuplicatable: isBlockDuplicatable(grab),
    releaseDuplicatable: isBlockDuplicatable(release),
    grabDeletable: grab.isDeletable(),
    releaseDeletable: release.isDeletable(),
  };

  // --- Test F: parser accepts duplicated block in chain ---
  ws.getAllBlocks(false)
    .filter((b) => b.id !== STARTER_GRAB_ID && b.id !== STARTER_RELEASE_ID)
    .forEach((b) => b.dispose());
  grab.nextConnection.connect(release.previousConnection);
  const av2 = addFromFlyout("lanterna_forward", 0);
  const av2copy = duplicateBlock(av2);
  grab.nextConnection.connect(av2.previousConnection);
  av2.nextConnection.connect(av2copy.previousConnection);
  av2copy.nextConnection.connect(release.previousConnection);

  const program = parseWorkspace(ws);
  const cmds = program.ok ? program.commands : [];
  results.testF = {
    pass:
      program.ok &&
      cmds.filter((c) => c.type === "forward").length === 2 &&
      new Set(cmds.map((c) => c.blockId)).size === cmds.length,
    types: cmds.map((c) => c.type),
  };

  results.testE = {
    ...results.testE,
    grabMenu: getBlockContextMenuLabels(grab),
    releaseMenu: getBlockContextMenuLabels(release),
  };

  results.duplicableTypes = [...DUPLICABLE_BLOCK_TYPES];
  return results;
}

if (import.meta.url === new URL(import.meta.url).href) {
  runContextMenuTests().then(console.log).catch(console.error);
}
