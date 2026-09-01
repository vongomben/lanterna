/**
 * Game rules — win/goal checks (no Blockly dependency).
 */
import { getState } from "../state/gameState.js";

/**
 * @param {{ payload: { row: number | null, col: number | null, carried: boolean }, goal: { row: number, col: number } }} state
 * @param {{ goal: { row: number, col: number } }} level
 * @returns {boolean}
 */
export function isPayloadOnGoal(state, level) {
  const { payload, goal } = state;
  return (
    payload.carried === false &&
    payload.row === goal.row &&
    payload.col === goal.col
  );
}

/**
 * @param {{ goal: { row: number, col: number } }} level
 * @returns {boolean}
 */
export function checkWinCondition(level) {
  return isPayloadOnGoal(getState(), level);
}
