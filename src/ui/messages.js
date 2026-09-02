/**
 * UI messages and status feedback.
 */

/**
 * @param {string} text
 */
let statusTimer = null;

export function showStatus(text) {
  const mission = document.getElementById("mission-text");
  if (mission) {
    mission.dataset.original ??= mission.textContent ?? "";
    mission.textContent = text;
    if (statusTimer !== null) {
      window.clearTimeout(statusTimer);
    }
    statusTimer = window.setTimeout(() => {
      mission.textContent = mission.dataset.original ?? text;
      statusTimer = null;
    }, 2000);
  }
}

/**
 * @param {string} text
 */
export function setMission(text) {
  const mission = document.getElementById("mission-text");
  if (mission) {
    mission.textContent = text;
    mission.dataset.original = text;
  }
}
