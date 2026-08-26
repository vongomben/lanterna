/**
 * Session state unit tests.
 */
import {
  startSessionIfNeeded,
  incrementAttempts,
  completeSession,
  resetSession,
  getElapsedMs,
  getAttempts,
  formatElapsedTime,
  isTimerRunning,
  isSessionCompleted,
} from "../src/state/sessionState.js";

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

resetSession();

assert(getAttempts() === 0, "initial attempts 0");
assert(getElapsedMs() === 0, "initial elapsed 0");
assert(isTimerRunning() === false, "timer not running initially");

startSessionIfNeeded();
incrementAttempts();
assert(getAttempts() === 1, "first attempt");
assert(isTimerRunning() === true, "timer running after start");

const t1 = getElapsedMs();
await new Promise((r) => setTimeout(r, 30));
const t2 = getElapsedMs();
assert(t2 >= t1, "elapsed increases");

completeSession();
const frozen = getElapsedMs();
assert(isSessionCompleted() === true, "session completed");
assert(isTimerRunning() === false, "timer stopped on complete");

await new Promise((r) => setTimeout(r, 30));
assert(getElapsedMs() === frozen, "elapsed frozen after complete");

resetSession();
assert(getAttempts() === 0, "reset attempts");
assert(getElapsedMs() === 0, "reset elapsed");
assert(isSessionCompleted() === false, "reset status");

assert(formatElapsedTime(0) === "00:00", "format zero");
assert(formatElapsedTime(157000) === "02:37", "format mm:ss");
assert(formatElapsedTime(523000) === "08:43", "format 8:43");

if (process.exitCode) {
  console.error("\nSome session tests failed.");
} else {
  console.log("\nAll session tests passed.");
}
