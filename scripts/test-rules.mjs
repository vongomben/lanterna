/**
 * Win condition unit tests.
 */
import { isPayloadOnGoal, checkWinCondition } from "../src/game/rules.js";
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
  isPayloadOnGoal(getState(), level01) === false,
  "not on goal at start",
);

const state = getState();
state.payload.row = level01.goal.row;
state.payload.col = level01.goal.col;
state.payload.carried = false;

assert(isPayloadOnGoal(getState(), level01) === true, "payload on goal");

state.payload.carried = true;
state.payload.row = null;
assert(isPayloadOnGoal(getState(), level01) === false, "carried not win");

state.payload.carried = false;
state.payload.row = level01.goal.row;
state.payload.col = level01.goal.col - 1;
assert(isPayloadOnGoal(getState(), level01) === false, "adjacent not win");

resetState();
assert(checkWinCondition(level01) === false, "checkWin at start");

if (process.exitCode) {
  console.error("\nSome rules tests failed.");
} else {
  console.log("\nAll rules tests passed.");
}

void setMissionCompleted;
