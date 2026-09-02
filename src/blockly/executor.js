/**
 * Program JSON → sequential game commands.
 * No KAPLAY, collision, or Blockly workspace logic.
 */
import { commands } from "../game/commands.js";
import { scenarioConfig } from "../data/scenario-config.js";

/** @typedef {import("./parser.js").ProgramCommand} ProgramCommand */

/**
 * @typedef {Object} Program
 * @property {1} version
 * @property {ProgramCommand[]} commands
 */

/**
 * @typedef {Object} ExecutorSuccess
 * @property {true} ok
 * @property {boolean} [terminal]
 * @property {string} [event]
 */

/**
 * @typedef {Object} ExecutorError
 * @property {false} ok
 * @property {{ code: string, message: string, blockId?: string }} error
 */

/** @typedef {ExecutorSuccess | ExecutorError} ExecutorResult */

/**
 * @typedef {Object} CommandEvent
 * @property {string} type
 * @property {string} blockId
 */

/**
 * @typedef {Object} CommandEndEvent
 * @property {string} type
 * @property {string} blockId
 * @property {{ ok: boolean, error?: { code: string, message: string } }} result
 */

/**
 * @typedef {Object} ExecutorHooks
 * @property {(event: CommandEvent) => void} [onCommandStart]
 * @property {(event: CommandEndEvent) => void} [onCommandEnd]
 * @property {(result: ExecutorResult) => void} [onProgramEnd]
 * @property {(error: { code: string, message: string, blockId?: string }) => void} [onError]
 */

export const DEBUG_EXECUTOR = import.meta.env?.DEV ?? false;
export const MAX_EXECUTED_STEPS = 500;

/** @type {boolean} */
let running = false;

/** @type {boolean} */
let stopRequested = false;

/** @type {number} */
let executedSteps = 0;

/**
 * @param {...unknown} args
 */
function debugLog(...args) {
  if (DEBUG_EXECUTOR) {
    console.log("[Executor]", ...args);
  }
}

/** Do not let UI feedback hooks corrupt executor state. */
function callHook(hook, payload) {
  if (!hook) return;
  try {
    hook(payload);
  } catch (error) {
    console.error("[Executor] feedback hook failed:", error);
  }
}

/**
 * @param {unknown} cause
 * @param {string} [blockId]
 */
function unexpectedError(cause, blockId) {
  if (DEBUG_EXECUTOR) {
    console.error("[Executor] unexpected error:", cause);
  }
  return {
    code: "INTERNAL_ERROR",
    message: "Si è verificato un errore imprevisto. Riprova.",
    ...(blockId ? { blockId } : {}),
  };
}

export function isProgramRunning() {
  return running;
}

export function stopProgram() {
  if (running) {
    stopRequested = true;
    debugLog("stop requested");
  }
}

/**
 * @returns {ExecutorError | null}
 */
function checkStopRequested() {
  if (stopRequested) {
    return {
      ok: false,
      error: {
        code: "PROGRAM_STOPPED",
        message: "Programma interrotto.",
      },
    };
  }
  return null;
}

/**
 * @returns {ExecutorError | null}
 */
function checkStepLimit() {
  if (executedSteps >= MAX_EXECUTED_STEPS) {
    return {
      ok: false,
      error: {
        code: "PROGRAM_TOO_LONG",
        message: "Il programma esegue troppi comandi.",
      },
    };
  }
  return null;
}

/**
 * @param {{ code: string, message: string, blockId?: string }} error
 * @param {ExecutorHooks} hooks
 * @returns {ExecutorError}
 */
function failWith(error, hooks) {
  const result = { ok: false, error };
  callHook(hooks.onError, error);
  return result;
}

/**
 * @param {ProgramCommand} command
 * @param {ExecutorHooks} hooks
 * @returns {Promise<ExecutorResult>}
 */
async function executeCommand(command, hooks) {
  if (command.type === "repeat") {
    for (let i = 0; i < command.times; i++) {
      debugLog(`repeat ${i + 1}/${command.times}`);

      const stopBefore = checkStopRequested();
      if (stopBefore) {
        return failWith(stopBefore.error, hooks);
      }

      const bodyResult = await executeCommandList(command.commands, hooks);
      if (!bodyResult.ok) {
        return bodyResult;
      }
      if (bodyResult.terminal) {
        return bodyResult;
      }
    }
    return { ok: true };
  }

  const limitError = checkStepLimit();
  if (limitError) {
    return failWith(limitError.error, hooks);
  }

  const stopBefore = checkStopRequested();
  if (stopBefore) {
    return failWith(stopBefore.error, hooks);
  }

  executedSteps += 1;

  callHook(hooks.onCommandStart, {
    type: command.type,
    blockId: command.blockId,
  });
  debugLog(command.type);

  /** @type {{ ok: boolean, error?: { code: string, message: string } }} */
  let cmdResult;

  try {
    switch (command.type) {
      case "forward":
        cmdResult = await commands.forward();
        break;
      case "turnLeft":
        cmdResult = await commands.turnLeft();
        break;
      case "turnRight":
        cmdResult = await commands.turnRight();
        break;
      case "grab":
        cmdResult = await commands.grab();
        break;
      case "release":
        cmdResult = await commands.release();
        break;
      default:
        cmdResult = {
          ok: false,
          error: {
            code: "UNSUPPORTED_COMMAND",
            message: `Comando non supportato: ${command.type}`,
          },
        };
    }
  } catch (cause) {
    const error = unexpectedError(cause, command.blockId);
    callHook(hooks.onCommandEnd, {
      type: command.type,
      blockId: command.blockId,
      result: { ok: false, error },
    });
    return failWith(error, hooks);
  }

  callHook(hooks.onCommandEnd, {
    type: command.type,
    blockId: command.blockId,
    result: cmdResult,
  });

  if (!cmdResult.ok) {
    const error = {
      code: cmdResult.error?.code ?? "COMMAND_FAILED",
      message:
        cmdResult.error?.code === "MOVEMENT_BLOCKED"
          ? scenarioConfig.copy.errors.obstacle
          : (cmdResult.error?.message ?? "Comando fallito."),
      blockId: command.blockId,
    };
    return failWith(error, hooks);
  }

  if (cmdResult.terminal) {
    debugLog("terminal:", cmdResult.event);
    return {
      ok: true,
      terminal: true,
      event: cmdResult.event ?? "TERMINAL",
    };
  }

  const stopAfter = checkStopRequested();
  if (stopAfter) {
    return failWith(stopAfter.error, hooks);
  }

  return { ok: true };
}

/**
 * @param {ProgramCommand[]} commandList
 * @param {ExecutorHooks} hooks
 * @returns {Promise<ExecutorResult>}
 */
async function executeCommandList(commandList, hooks) {
  for (const command of commandList) {
    const result = await executeCommand(command, hooks);
    if (!result.ok) {
      return result;
    }
    if (result.terminal) {
      return result;
    }
  }
  return { ok: true };
}

/**
 * @param {Program} program
 * @param {ExecutorHooks} [hooks]
 * @returns {Promise<ExecutorResult>}
 */
export async function runProgram(program, hooks = {}) {
  if (running) {
    return {
      ok: false,
      error: {
        code: "ALREADY_RUNNING",
        message: "Un programma è già in esecuzione.",
      },
    };
  }

  running = true;
  stopRequested = false;
  executedSteps = 0;

  /** @type {ExecutorResult} */
  let result = { ok: true };

  try {
    result = await executeCommandList(program.commands, hooks);
  } catch (cause) {
    result = { ok: false, error: unexpectedError(cause) };
    callHook(hooks.onError, result.error);
  } finally {
    running = false;
    stopRequested = false;
    callHook(hooks.onProgramEnd, result);
  }

  return result;
}
