/**
 * UI messages and status feedback.
 */

/**
 * @param {string} text
 */
export function showStatus(text) {
  const mission = document.getElementById("mission-text");
  if (mission) {
    mission.dataset.original ??= mission.textContent ?? "";
    mission.textContent = text;
    window.setTimeout(() => {
      mission.textContent = mission.dataset.original ?? text;
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
