/**
 * Win condition unit tests.
 */
import { isContainerOnGoal, checkWinCondition } from "../src/game/rules.js";
import { getState, resetState, setMissionCompleted } from "../src/state/gameState.js";
import { level01 } from "../src/levels/level01.js";

/** @param {boolean} cond @param {string} name */
function assert(cond, name) {
  if (!cond) {
    console.error("FAIL:", name);
    process.exitCode = 1;
    return false;
  }
  console.log("OK:", name);
  return true;
}

resetState();

assert(
  isContainerOnGoal(getState(), level01) === false,
  "not on goal at start",
);

const state = getState();
state.container.row = level01.goal.row;
state.container.col = level01.goal.col;
state.container.carried = false;

assert(isContainerOnGoal(getState(), level01) === true, "container on goal");

state.container.carried = true;
state.container.row = null;
assert(isContainerOnGoal(getState(), level01) === false, "carried not win");

state.container.carried = false;
state.container.row = level01.goal.row;
state.container.col = level01.goal.col - 1;
assert(isContainerOnGoal(getState(), level01) === false, "adjacent not win");

resetState();
assert(checkWinCondition(level01) === false, "checkWin at start");

if (process.exitCode) {
  console.error("\nSome rules tests failed.");
} else {
  console.log("\nAll rules tests passed.");
}

void setMissionCompleted;
