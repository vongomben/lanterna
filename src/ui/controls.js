/**
 * Run / Stop / Reset button wiring.
 */

/**
 * @param {{ run?: boolean, stop?: boolean, reset?: boolean }} state
 */
export function setControlsState({ run, stop, reset }) {
  const btnRun = document.getElementById("btn-run");
  const btnStop = document.getElementById("btn-stop");
  const btnReset = document.getElementById("btn-reset");

  if (run !== undefined && btnRun) {
    btnRun.disabled = !run;
  }
  if (stop !== undefined && btnStop) {
    btnStop.disabled = !stop;
  }
  if (reset !== undefined && btnReset) {
    btnReset.disabled = !reset;
  }
}

/**
 * @param {{ onRun: () => void, onStop: () => void, onReset: () => void }} handlers
 */
export function initControls({ onRun, onStop, onReset }) {
  const btnRun = document.getElementById("btn-run");
  const btnStop = document.getElementById("btn-stop");
  const btnReset = document.getElementById("btn-reset");

  btnRun?.addEventListener("click", onRun);
  btnStop?.addEventListener("click", onStop);
  btnReset?.addEventListener("click", onReset);

  setControlsState({ run: true, stop: false, reset: true });
}
