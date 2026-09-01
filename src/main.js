/**
 * Entry point — wires UI, KAPLAY and Blockly.
 */
import { initGame, setKeyboardEnabled, resetLevel } from "./game/game.js";
import {
  initBlockly,
  getBlocklyWorkspace,
  resizeBlocklyWorkspace,
} from "./blockly/blocks.js";
import { parseWorkspace } from "./blockly/parser.js";
import {
  runProgram,
  stopProgram,
  isProgramRunning,
  DEBUG_EXECUTOR,
} from "./blockly/executor.js";
import { isMissionCompleted } from "./state/gameState.js";
import {
  startSessionIfNeeded,
  incrementAttempts,
  completeSession,
  resetSession,
} from "./state/sessionState.js";
import { initControls, setControlsState } from "./ui/controls.js";
import { showStatus } from "./ui/messages.js";
import {
  clearAllBlockFeedback,
  createExecutorFeedbackHooks,
} from "./ui/blocklyFeedback.js";
import {
  initSuccessOverlay,
  showSuccessOverlay,
  hideSuccessOverlay,
} from "./ui/successOverlay.js";
import {
  initSessionDisplay,
  updateSessionDisplay,
} from "./ui/sessionDisplay.js";
import { initSplashScreen, isSplashActive } from "./ui/splashScreen.js";
import { scenarioConfig } from "./data/scenario-config.js";
import { applyScenarioToDom } from "./ui/applyScenario.js";

const DEBUG_PARSE = true;

/**
 * @param {{ code: string, message: string }} error
 * @returns {string}
 */
function executorErrorMessage(error) {
  switch (error.code) {
    case "MOVEMENT_BLOCKED":
      return scenarioConfig.copy.status.movementBlocked;
    case "PROGRAM_STOPPED":
      return "Programma interrotto.";
    case "PROGRAM_TOO_LONG":
      return error.message;
    case "NOTHING_TO_GRAB":
    case "ALREADY_CARRYING":
    case "NOT_CARRYING":
    case "RELEASE_BLOCKED":
    case "RELEASE_OUT_OF_BOUNDS":
      return error.message;
    default:
      return error.message;
  }
}

function applyMissionCompletedUi() {
  updateSessionDisplay();
  showSuccessOverlay();
  setControlsState({ run: false, stop: false, reset: true });
  setKeyboardEnabled(() => false);
}

function applyPlayingUi() {
  hideSuccessOverlay();
  setControlsState({ run: true, stop: true, reset: true });
  setKeyboardEnabled(() => !isProgramRunning() && !isMissionCompleted());
}

/**
 * @returns {Promise<void>}
 */
async function waitForProgramIdle() {
  while (isProgramRunning()) {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 50);
    });
  }
}

/** RESET livello — timer e tentativi invariati. */
async function handleLevelReset() {
  if (isProgramRunning()) {
    stopProgram();
    await waitForProgramIdle();
  }

  const workspace = getBlocklyWorkspace();
  if (workspace) {
    clearAllBlockFeedback(workspace);
  }

  resetLevel();
  applyPlayingUi();
  updateSessionDisplay();
  showStatus(scenarioConfig.copy.status.levelReset);
}

/** RIPROVA — nuova sessione completa. */
async function handleNewSession() {
  if (isProgramRunning()) {
    stopProgram();
    await waitForProgramIdle();
  }

  const workspace = getBlocklyWorkspace();
  if (workspace) {
    clearAllBlockFeedback(workspace);
  }

  resetSession();
  resetLevel();
  applyPlayingUi();
  updateSessionDisplay();
  showStatus(scenarioConfig.copy.status.newSession);
}

function bootstrap() {
  const scenarioId =
    import.meta.env.VITE_SCENARIO === "nautica" ? "nautica" : "lanterna";
  applyScenarioToDom(scenarioConfig);
  document.documentElement.dataset.scenarioId = scenarioId;

  const gameRoot = document.getElementById("game-root");
  const blocklyRoot = document.getElementById("blockly-root");

  initGame(gameRoot);
  initBlockly(blocklyRoot);
  initSessionDisplay();
  initSuccessOverlay(() => {
    void handleNewSession();
  });

  const keyboardAllowed = () =>
    !isSplashActive() && !isProgramRunning() && !isMissionCompleted();

  setKeyboardEnabled(keyboardAllowed);

  initSplashScreen({
    onStart: () => {
      setKeyboardEnabled(keyboardAllowed);
      resizeBlocklyWorkspace();
    },
  });

  initControls({
    onRun: async () => {
      if (isProgramRunning() || isMissionCompleted()) return;

      const workspace = getBlocklyWorkspace();
      if (!workspace) {
        console.warn(`[${scenarioConfig.meta.titolo}] Blockly workspace not ready`);
        return;
      }

      const parsed = parseWorkspace(workspace);

      if (DEBUG_PARSE) {
        console.log(`[${scenarioConfig.meta.titolo}] parseWorkspace:`, parsed);
        console.log(JSON.stringify(parsed, null, 2));
      }

      if (!parsed.ok) {
        showStatus(parsed.error.message);
        return;
      }

      startSessionIfNeeded();
      incrementAttempts();
      updateSessionDisplay();

      clearAllBlockFeedback(workspace);

      setControlsState({ run: false, stop: false, reset: false });
      setKeyboardEnabled(() => false);

      const result = await runProgram(
        parsed,
        createExecutorFeedbackHooks(workspace),
      );

      if (result.ok && result.terminal && result.event === "MISSION_COMPLETED") {
        completeSession();
        showStatus(scenarioConfig.copy.status.missionComplete);
        applyMissionCompletedUi();
        if (DEBUG_EXECUTOR) {
          console.log("[Executor] mission completed");
        }
        return;
      }

      setControlsState({ run: true, stop: true, reset: true });
      setKeyboardEnabled(
        () => !isSplashActive() && !isProgramRunning() && !isMissionCompleted(),
      );

      if (result.ok) {
        showStatus(scenarioConfig.copy.status.programComplete);
      } else {
        showStatus(executorErrorMessage(result.error));
        if (DEBUG_EXECUTOR) {
          console.warn("[Executor] finished with error:", result.error);
        }
      }
    },
    onStop: () => {
      if (!isProgramRunning() || isMissionCompleted()) return;
      stopProgram();
    },
    onReset: () => {
      void handleLevelReset();
    },
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
