/**
 * Codice Lanterna — original port theme (extracted from hardcoded content).
 */
import { level01Walls } from "../levels/level01-walls.js";

export const scenarioConfig = {
  meta: {
    slug: "codice-lanterna",
    titolo: "Codice Lanterna",
    corsoRiferimento: "Industrial IoT e Robotics Developer",
    ambientazione: "Porto di Genova",
    oggettoDaSpostare: "container",
    puntoA: "deposito (punto A)",
    puntoB: "zona di estrazione (punto B)",
    obiettivoDidattico:
      "Analizzare un percorso, tradurlo in istruzioni a blocchi e comandare un robot/gripper per estrarre un container dal deposito.",
  },

  /** Accademia Digitale: A + 4 cifre per il locker fisico in stand. */
  codiceLocker: "A6184",

  navigazione: {
    homeUrl: "../",
    logoSrc: "../img/IT-Y-Flogo.png",
    percorsoLabel: "percorsi Accademia Digitale",
    percorsoUrl: "../digitale/",
  },

  sprite: {
    visualMode: "sprites",
    oggetto: "img/generated/container.png",
    braccioRobotico: "img/generated/robot.png",
    sfondo: "img/torre-sfondo.png",
    splashTower: "img/torre.png",
    splashTowerAlt: "La Lanterna di Genova",
  },

  copy: {
    headerTitle: "CODICE LANTERNA",
    mission: "Estrai il container dal deposito",
    blocklyHint: "Completa il programma inserendo i comandi tra PRENDI e RILASCIA.",
    splash: {
      title: "CODICE LANTERNA",
      credits: "da un'idea di Keila, Leonardo, Juan, Matteo",
      cta: "PREMI UN TASTO PER INIZIARE",
    },
    success: {
      title: "MISSIONE COMPLETATA",
    },
    status: {
      programComplete: "Programma completato.",
      missionComplete: "Container estratto. Missione completata.",
      levelReset: "Livello reimpostato.",
      newSession: "Nuova sessione.",
      movementBlocked: "Movimento bloccato.",
    },
    errors: {
      robotBusy: "Il robot è già in movimento.",
      alreadyCarrying: "Il robot sta già trasportando un container.",
      nothingToGrab: "Non c'è nessun container davanti alla pinza.",
      notCarrying: "Il robot non sta trasportando nessun container.",
      releaseOutOfBounds: "Non puoi rilasciare il container fuori dall'area di gioco.",
      releaseBlocked: "Non puoi rilasciare il container in quella posizione.",
      obstacle: "Il robot ha incontrato un ostacolo.",
    },
    blocks: {
      grab: "PRENDI CONTAINER",
      grabTooltip: "Afferra il container con la pinza del robot",
      forward: "AVANTI",
      forwardTooltip: "Muovi il robot di una cella nella direzione della pinza",
      turnRight: "GIRA A DESTRA",
      turnRightTooltip: "Ruota il robot di 90° verso destra",
      turnLeft: "GIRA A SINISTRA",
      turnLeftTooltip: "Ruota il robot di 90° verso sinistra",
      release: "RILASCIA CONTAINER",
      releaseTooltip: "Rilascia il container trasportato",
      repeat: "RIPETI",
      times: "VOLTE",
      repeatTooltip: "Ripete i blocchi interni un numero di volte",
    },
    toolbox: {
      movement: "MOVIMENTO",
      control: "CONTROLLO",
    },
    placeholders: {
      payload: "container",
      robot: "robot",
      robotCarry: "robot + cargo",
      start: "A",
      goal: "B",
    },
  },

  livelli: [
    {
      id: "livello-1",
      titolo: "Deposito",
      istruzioni: "Estrai il container dal deposito",
      blocchiDisponibili: [
        "move_forward",
        "turn_right",
        "turn_left",
        "repeat",
        "grip",
        "release",
      ],
      condizioneVittoria: "payload_on_goal",
      testoVittoria: "Container estratto dal deposito.",
      rows: 7,
      cols: 9,
      start: { row: 0, col: 0 },
      goal: { row: 6, col: 8 },
      robot: { row: 0, col: 1, direction: "left" },
      payload: { row: 0, col: 0 },
      walls: level01Walls,
      props: [
        { row: 3, col: 0, type: "crate_wood", blocking: true },
        { row: 5, col: 1, type: "traffic_cone", blocking: true },
        {
          row: 1,
          col: 3,
          type: "technical_terminal",
          // Wall-mounted scenery: visually overlaps a cell but does not occupy it.
          blocking: false,
        },
      ],
    },
  ],
};
