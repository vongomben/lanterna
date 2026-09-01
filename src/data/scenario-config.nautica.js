/**
 * Missione Nautica — Cantiere 4.0 / Dobot Magician Go (placeholder visuals).
 */
import { level01Walls } from "../levels/level01-walls.js";

export const scenarioConfig = {
  meta: {
    slug: "missione-nautica",
    titolo: "Missione Nautica",
    corsoRiferimento:
      "15° Corso Tecnico Superiore per la Progettazione e la Produzione Meccatronica Avanzata",
    ambientazione: "cella produttiva 4.0 nautica",
    oggettoDaSpostare: "componente nautico",
    puntoA: "punto di stoccaggio (A)",
    puntoB: "zona di controllo qualità (B)",
    obiettivoDidattico:
      "Programmare un braccio robotico (Dobot Magician Go, DobotLab) per prelevare un componente nautico, depositarlo in zona controllo qualità e verificarne le specifiche prima del deposito finale.",
  },

  sprite: {
    visualMode: "placeholders",
    oggetto: null,
    braccioRobotico: null,
    sfondo: null,
    splashTower: null,
    splashTowerAlt: "",
  },

  copy: {
    headerTitle: "MISSIONE NAUTICA",
    mission: "Preleva il componente e depositalo in zona controllo qualità",
    blocklyHint:
      "Completa il programma inserendo i comandi tra PRENDI COMPONENTE e RILASCIA COMPONENTE.",
    splash: {
      title: "MISSIONE NAUTICA",
      credits:
        "Cantiere 4.0 · Dobot Magician Go (DobotLab) · 15° Corso Tecnico Superiore per la Progettazione e la Produzione Meccatronica Avanzata",
      cta: "PREMI UN TASTO PER INIZIARE",
    },
    success: {
      title: "MISSIONE COMPLETATA",
    },
    status: {
      programComplete: "Programma completato.",
      missionComplete: "Componente nautico verificato. Missione completata.",
      levelReset: "Livello reimpostato.",
      newSession: "Nuova sessione.",
      movementBlocked: "Movimento bloccato.",
    },
    errors: {
      robotBusy: "Il braccio robotico è già in movimento.",
      alreadyCarrying: "Il braccio sta già trasportando un componente nautico.",
      nothingToGrab: "Non c'è nessun componente nautico davanti al gripper.",
      notCarrying: "Il braccio non sta trasportando nessun componente nautico.",
      releaseOutOfBounds: "Non puoi rilasciare il componente nautico fuori dalla cella.",
      releaseBlocked: "Non puoi rilasciare il componente nautico in quella posizione.",
      obstacle: "Il braccio robotico ha incontrato un ostacolo.",
    },
    blocks: {
      grab: "PRENDI COMPONENTE",
      grabTooltip: "Afferra il componente nautico con il gripper del Dobot Magician Go",
      forward: "AVANTI",
      forwardTooltip: "Muovi il braccio robotico di una cella nella direzione del gripper",
      turnRight: "GIRA A DESTRA",
      turnRightTooltip: "Ruota il braccio di 90° verso destra",
      turnLeft: "GIRA A SINISTRA",
      turnLeftTooltip: "Ruota il braccio di 90° verso sinistra",
      release: "RILASCIA COMPONENTE",
      releaseTooltip: "Rilascia il componente nautico trasportato",
      repeat: "RIPETI",
      times: "VOLTE",
      repeatTooltip: "Ripete i blocchi interni un numero di volte",
    },
    toolbox: {
      movement: "MOVIMENTO",
      control: "CONTROLLO",
    },
    placeholders: {
      payload: "componente nautico",
      robot: "Dobot Magician Go",
      robotCarry: "Dobot + componente",
      start: "A stoccaggio",
      goal: "B qualità",
      splash: "cella produttiva 4.0",
    },
  },

  livelli: [
    {
      id: "livello-1",
      titolo: "Controllo qualità",
      istruzioni:
        "Preleva il componente nautico dal punto di stoccaggio e depositalo in zona controllo qualità",
      blocchiDisponibili: [
        "move_forward",
        "turn_right",
        "turn_left",
        "repeat",
        "grip",
        "release",
      ],
      condizioneVittoria: "payload_on_goal",
      testoVittoria: "Componente nautico verificato e depositato in zona controllo qualità.",
      rows: 7,
      cols: 9,
      start: { row: 0, col: 0 },
      goal: { row: 6, col: 8 },
      robot: { row: 0, col: 1, direction: "left" },
      payload: { row: 0, col: 0 },
      walls: level01Walls,
      props: [
        { row: 3, col: 0, type: "crate_wood", label: "pallet" },
        { row: 5, col: 1, type: "traffic_cone", label: "segnale" },
        { row: 1, col: 3, type: "technical_terminal", label: "banco QC" },
      ],
    },
  ],
};
