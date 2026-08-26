/**
 * Session state — timer and attempts (separate from level/gameState).
 */

/** @typedef {"ready"|"running"|"completed"} SessionStatus */

/**
 * @typedef {Object} SessionState
 * @property {SessionStatus} status
 * @property {number} attempts
 * @property {number | null} startedAt
 * @property {number | null} frozenElapsedMs
 */

/** @returns {SessionState} */
function createInitialSession() {
  return {
    status: "ready",
    attempts: 0,
    startedAt: null,
    frozenElapsedMs: null,
  };
}

/** @type {SessionState} */
let session = createInitialSession();

export function getSessionState() {
  return session;
}

export function getAttempts() {
  return session.attempts;
}

/**
 * @returns {number}
 */
export function getElapsedMs() {
  if (session.frozenElapsedMs !== null) {
    return session.frozenElapsedMs;
  }
  if (session.startedAt === null) {
    return 0;
  }
  return Math.max(0, performance.now() - session.startedAt);
}

export function isSessionCompleted() {
  return session.status === "completed";
}

export function isTimerRunning() {
  return session.startedAt !== null && session.status !== "completed";
}

/** Start the session timer on first valid ESEGUI. */
export function startSessionIfNeeded() {
  if (session.status === "completed") {
    return;
  }

  if (session.startedAt === null) {
    session.startedAt = performance.now();
  }

  session.status = "running";
}

export function incrementAttempts() {
  session.attempts += 1;
}

/** Freeze timer when mission completes. */
export function completeSession() {
  if (session.status === "completed") {
    return;
  }

  session.frozenElapsedMs = getElapsedMs();
  session.status = "completed";
}

/** New session — timer and attempts back to zero. */
export function resetSession() {
  session = createInitialSession();
}

/**
 * @param {number} ms
 * @returns {string}
 */
export function formatElapsedTime(ms) {
  const totalSec = Math.floor(Math.max(0, ms) / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
