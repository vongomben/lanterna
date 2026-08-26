/**
 * Session stats display — header + success overlay.
 */
import {
  getElapsedMs,
  getAttempts,
  formatElapsedTime,
} from "../state/sessionState.js";

const UPDATE_INTERVAL_MS = 250;

/** @type {number | null} */
let displayInterval = null;

export function updateSessionDisplay() {
  const timeText = formatElapsedTime(getElapsedMs());
  const attemptsText = String(getAttempts());

  const timeEl = document.getElementById("stat-time");
  const attemptsEl = document.getElementById("stat-attempts");
  const overlayTimeEl = document.getElementById("success-stat-time");
  const overlayAttemptsEl = document.getElementById("success-stat-attempts");

  if (timeEl) timeEl.textContent = timeText;
  if (attemptsEl) attemptsEl.textContent = attemptsText;
  if (overlayTimeEl) overlayTimeEl.textContent = timeText;
  if (overlayAttemptsEl) overlayAttemptsEl.textContent = attemptsText;
}

export function startSessionDisplayLoop() {
  stopSessionDisplayLoop();
  updateSessionDisplay();
  displayInterval = window.setInterval(updateSessionDisplay, UPDATE_INTERVAL_MS);
}

export function stopSessionDisplayLoop() {
  if (displayInterval !== null) {
    window.clearInterval(displayInterval);
    displayInterval = null;
  }
}

export function initSessionDisplay() {
  updateSessionDisplay();
  startSessionDisplayLoop();
}
