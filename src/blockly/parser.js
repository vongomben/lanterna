/**
 * Blockly workspace → Codice Lanterna program AST (JSON).
 * No JavaScript generation, no game/ imports.
 */

/** @typedef {{ type: "grab", blockId: string }} GrabCommand */
/** @typedef {{ type: "forward", blockId: string }} ForwardCommand */
/** @typedef {{ type: "turnRight", blockId: string }} TurnRightCommand */
/** @typedef {{ type: "turnLeft", blockId: string }} TurnLeftCommand */
/** @typedef {{ type: "release", blockId: string }} ReleaseCommand */
/** @typedef {{ type: "repeat", times: number, blockId: string, commands: ProgramCommand[] }} RepeatCommand */

/** @typedef {GrabCommand | ForwardCommand | TurnRightCommand | TurnLeftCommand | ReleaseCommand | RepeatCommand} ProgramCommand */

/**
 * @typedef {Object} Program
 * @property {1} version
 * @property {ProgramCommand[]} commands
 */

/**
 * @typedef {Object} ParseSuccess
 * @property {true} ok
 * @property {1} version
 * @property {ProgramCommand[]} commands
 */

/**
 * @typedef {Object} ParseError
 * @property {false} ok
 * @property {{ code: string, message: string, blockId?: string, blockType?: string }} error
 */

/** @typedef {ParseSuccess | ParseError} ParseResult */

/** @type {Record<string, string>} */
const BLOCK_TYPE_MAP = {
  lanterna_grab: "grab",
  lanterna_forward: "forward",
  lanterna_turn_right: "turnRight",
  lanterna_turn_left: "turnLeft",
  lanterna_release: "release",
};

const REPEAT_MIN = 1;
const REPEAT_MAX = 20;

/**
 * @param {string} code
 * @param {string} message
 * @param {{ blockId?: string, blockType?: string }} [extra]
 * @returns {ParseError}
 */
function parseError(code, message, extra = {}) {
  return {
    ok: false,
    error: { code, message, ...extra },
  };
}

/**
 * @param {import("blockly").Block} block
 * @returns {ParseResult | { ok: true, command: ProgramCommand }}
 */
function parseBlock(block) {
  const blockId = block.id;
  const blockType = block.type;

  if (blockType === "lanterna_repeat") {
    const timesRaw = block.getFieldValue("TIMES");
    const times = Number(timesRaw);

    if (!Number.isFinite(times) || !Number.isInteger(times)) {
      return parseError(
        "INVALID_REPEAT_TIMES",
        "RIPETI deve usare un numero intero.",
        { blockId, blockType },
      );
    }

    if (times < REPEAT_MIN || times > REPEAT_MAX) {
      return parseError(
        "INVALID_REPEAT_TIMES",
        `RIPETI deve essere tra ${REPEAT_MIN} e ${REPEAT_MAX}.`,
        { blockId, blockType },
      );
    }

    const firstInner = block.getInputTargetBlock("DO");
    const innerResult = parseChain(firstInner);

    if (!innerResult.ok) {
      return innerResult;
    }

    return {
      ok: true,
      command: {
        type: "repeat",
        times,
        blockId,
        commands: innerResult.commands,
      },
    };
  }

  const commandType = BLOCK_TYPE_MAP[blockType];

  if (!commandType) {
    return parseError(
      "UNSUPPORTED_BLOCK",
      `Blocco non supportato: ${blockType}`,
      { blockId, blockType },
    );
  }

  return {
    ok: true,
    command: /** @type {ProgramCommand} */ ({ type: commandType, blockId }),
  };
}

/**
 * Walk a vertical chain via nextConnection (next block link).
 * @param {import("blockly").Block | null} firstBlock
 * @returns {ParseSuccess | ParseError}
 */
function parseChain(firstBlock) {
  /** @type {ProgramCommand[]} */
  const commands = [];
  let block = firstBlock;

  while (block) {
    const parsed = parseBlock(block);
    if (!parsed.ok) {
      return parsed;
    }
    commands.push(parsed.command);
    block = block.getNextBlock();
  }

  return { ok: true, commands };
}

/**
 * @param {import("blockly").Workspace} workspace
 * @returns {ParseResult}
 */
export function parseWorkspace(workspace) {
  const topBlocks = workspace.getTopBlocks(true);

  if (topBlocks.length === 0) {
    return parseError(
      "EMPTY_PROGRAM",
      "Aggiungi almeno un blocco al programma.",
    );
  }

  if (topBlocks.length > 1) {
    return parseError(
      "MULTIPLE_TOP_LEVEL_STACKS",
      "Collega tutti i blocchi in un unico programma.",
    );
  }

  const chainResult = parseChain(topBlocks[0]);

  if (!chainResult.ok) {
    return chainResult;
  }

  return {
    ok: true,
    version: 1,
    commands: chainResult.commands,
  };
}

/**
 * Test helper — parse a mock block chain without a full Blockly workspace.
 * @param {import("blockly").Block | MockBlock} firstBlock
 * @returns {ParseResult}
 */
export function parseBlockChain(firstBlock) {
  const chainResult = parseChain(/** @type {import("blockly").Block} */ (firstBlock));
  if (!chainResult.ok) {
    return chainResult;
  }
  return { ok: true, version: 1, commands: chainResult.commands };
}

/** @typedef {Object} MockBlock
 * @property {string} id
 * @property {string} type
 * @property {() => MockBlock | null} getNextBlock
 * @property {(name: string) => MockBlock | null} getInputTargetBlock
 * @property {(name: string) => string | number} getFieldValue
 */

/**
 * @param {Array<{ id: string, type: string, times?: number, inner?: unknown[] }>} specs
 * @returns {MockBlock | null}
 */
export function buildMockChain(specs) {
  /** @type {MockBlock[]} */
  const blocks = specs.map((spec, index) => {
    /** @type {MockBlock} */
    const block = {
      id: spec.id,
      type: spec.type,
      getNextBlock: () => blocks[index + 1] ?? null,
      getInputTargetBlock: (name) => {
        if (name === "DO" && spec.inner) {
          return buildMockChain(
            /** @type {Array<{ id: string, type: string, times?: number, inner?: unknown[] }>} */ (
              spec.inner
            ),
          );
        }
        return null;
      },
      getFieldValue: (name) => {
        if (name === "TIMES") {
          return spec.times ?? 3;
        }
        return "";
      },
    };
    return block;
  });

  return blocks[0] ?? null;
}
