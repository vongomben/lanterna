# Codice Lanterna — Inventario asset grafici

Analisi della cartella `img/` (35 file PNG).  
Nessun asset è stato modificato, rinominato o convertito.

Legenda categorie: `robot` · `container` · `wall` · `floor` · `marker` · `prop` · `background` · `reference`

---

## Inventario completo

| Filename | Funzione presunta | Categoria |
|---|---|---|
| `alien_container.png` | Container alieno — stato base/chiuso, oggetto da trasportare | container |
| `alien_container_4dir_sheet.png` | Spritesheet 2×2: container con freccia direzionale (su, destra, giù, sinistra) | container |
| `alien_container_carry.png` | Container in stato “sollevato/trasporto” (variante teal, simile a glow) | container |
| `alien_container_down.png` | Container con indicatore freccia verso il basso | container |
| `alien_container_glow.png` | Container evidenziato/attivo (feedback visivo: selezione, obiettivo, pickup) | container |
| `alien_container_left.png` | Container con indicatore freccia verso sinistra | container |
| `alien_container_opened.png` | Container aperto (stato post-interazione o animazione apertura) | container |
| `alien_container_right.png` | Container con indicatore freccia verso destra | container |
| `alien_container_up.png` | Container con indicatore freccia verso l'alto | container |
| `asset.png` | **Mockup di riferimento** — UI completa, palette colori, blocchi Blockly, layout responsive | reference |
| `barrier_warning.png` | Barriera/segnalazione a strisce giallo-nero, ostacolo non traversabile | prop / wall |
| `crate_metal.png` | Cassa metallica decorativa o ostacolo fisso | prop |
| `crate_wood.png` | Cassa di legno decorativa o ostacolo fisso | prop |
| `environment_asset_sheet.png` | **Foglio di riferimento** — anteprima di tutti gli asset ambientali con etichette | reference |
| `floor_markings_sheet.png` | Spritesheet segnaletica pavimento: frecce, tratteggi, angolo hazard, barriera, targa target, cornice | floor |
| `floor_tile_clean.png` | Tile pavimento pulito (4×4 sotto-griglia), texture base del lab | floor |
| `floor_tile_worn.png` | Tile pavimento usurato, variante alternativa del pavimento | floor |
| `goal_marker_B.png` | Punto di arrivo/obiettivo — tile con lettera **B** arancione | marker |
| `industrial_generator.png` | Generatore industriale decorativo da posizionare nel lab | prop |
| `robot_and_container_scale_check.png` | **Foglio di riferimento** — verifica proporzioni robot/container/carried | reference |
| `robot_gripper_4dir_sheet.png` | Spritesheet 2×2: robot con pinza aperta nelle 4 direzioni cardinali | robot |
| `robot_gripper_carry.png` | Robot che trasporta il container (pinza chiusa + cargo) | robot |
| `robot_gripper_closed.png` | Robot con pinza chiusa, vista default (probabilmente rivolta verso il basso) | robot |
| `robot_gripper_open.png` | Robot con pinza aperta, vista default | robot |
| `start_marker_A.png` | Punto di partenza — tile con lettera **A** verde | marker |
| `technical_terminal.png` | Terminale tecnico interattivo o decorativo | prop |
| `torre-sfondo.png` | Sfondo panoramico porto di Genova al tramonto (menu, splash, parallax) | background |
| `torre.png` | La Lanterna — torre faro verticale con stemma di Genova | background |
| `traffic_cone.png` | Cono stradale decorativo o piccolo ostacolo | prop |
| `wall_corner.png` | Segmento muro — angolo a 90° | wall |
| `wall_cross.png` | Segmento muro — incrocio a croce (+) | wall |
| `wall_endcap.png` | Segmento muro — terminale/capocorda | wall |
| `wall_horizontal.png` | Segmento muro — tratto orizzontale | wall |
| `wall_tjunction.png` | Segmento muro — incrocio a T | wall |
| `wall_vertical.png` | Segmento muro — tratto verticale | wall |

---

## Osservazioni tecniche

### Spritesheet da sliceare in runtime

| File | Layout stimato | Contenuto |
|---|---|---|
| `robot_gripper_4dir_sheet.png` | 2×2 | Robot pinza aperta: giù, destra, su, sinistra |
| `alien_container_4dir_sheet.png` | 2×2 | Container con freccia: su, destra, giù, sinistra |
| `floor_markings_sheet.png` | griglia irregolare | Frecce, tratteggio, hazard, barriera, targa target, cornice |

Esistono anche le **varianti singole** del container direzionale (`alien_container_up/down/left/right.png`), quindi lo sheet può restare solo come riferimento o per ottimizzazione futura.

### Stati animazione previsti (coperti dagli asset)

| Entità | Stati disponibili |
|---|---|
| **Robot** | idle/open × 4 direzioni (sheet), pinza chiusa, trasporto cargo |
| **Container** | chiuso, aperto, glow/evidenziato, carry, 4 direzioni |
| **Muri** | 6 tile modulari per costruire lab su griglia |

### File di riferimento (non da usare in-game)

- `asset.png` — concept/mockup UI completo
- `environment_asset_sheet.png` — catalogo visivo
- `robot_and_container_scale_check.png` — check scala

---

## Asset apparentemente mancanti

Rispetto al mockup in `asset.png` e alle meccaniche descritte (“Trasporta il container alieno dal punto A al punto B”):

### Gameplay / personaggi
- [ ] Robot **4 direzioni con pinza chiusa** (lo sheet mostra solo pinza aperta; per pickup si userà `robot_gripper_carry` o `robot_gripper_closed` ruotato?)
- [ ] Robot **4 direzioni in stato carry** (solo una vista carry esiste)
- [ ] Creatura aliena / cupola vetro (nel mockup c'è un alieno verde in cupola; gli asset attuali mostrano un container industriale arancione — coerente col naming, ma diverso dal concept)
- [ ] Animazioni frame-by-frame (movimento ruote, apertura pinza, ecc.) — tutto statico per ora

### UI / branding (fuori canvas, potrebbero essere CSS/SVG)
- [ ] Logo “Codice Lanterna” con icona esagono/faro
- [ ] Icone pulsanti Esegui / Stop / Reset
- [ ] Icone blocchi Blockly (frecce, pinza, loop)
- [ ] Elementi timer (`02:45` nel mockup)
- [ ] Favicon

### Ambiente
- [ ] Decal pavimento testuali (“LAB PORTO DI GENOVA”, “ZONA 01”) — potrebbero essere HTML/CSS
- [ ] Tile pavimento **angolo/bordo** per transizioni pulite tra clean/worn
- [ ] Porta o varco muro (apertura traversabile) — se previsto nei livelli
- [ ] Ombre proiettate separate (drop shadow) — attualmente integrate negli sprite

### Audio
- [ ] Nessun file audio presente (SFX movimento, pickup, vittoria, errore; musica di sottofondo)

### Dati livello
- [ ] Nessun file livello (JSON/JS) — atteso in fase successiva, non in `img/`

---

## Problemi / punti di attenzione

1. **Naming misto IT/EN** — `torre.png` / `torre-sfondo.png` in italiano, resto in inglese. Non è un blocco, ma conviene mappare alias consistenti in codice.
2. **`asset.png` non è uno sprite** — rischio confusione se caricato come texture di gioco.
3. **Disallineamento concept vs asset** — il mockup mostra container “alieno” in cupola; gli sprite finali sono container industriali sci-fi. Funzionalmente ok, esteticamente diverso.
4. **Direzione robot** — tutti gli sprite singoli (`open`, `closed`, `carry`) sembrano orientati verso il **basso**; le altre direzioni sono solo nello sheet.
5. **`floor_markings_sheet.png`** — layout non uniforme; richiederà coordinate manuali di slice, a differenza dei sheet 2×2.
6. **Scala griglia** — `robot_and_container_scale_check.png` conferma che robot e container occupano ~1 cella ciascuno; da formalizzare la dimensione tile (es. 64×64 o 128×128 px) in fase di setup KAPLAY.

---

## Struttura cartelle `src/` proposta

Architettura a strati, con piccole aggiunte rispetto alla bozza iniziale: cartella `state/` per lo stato logico e `levels/` per i dati livello.

```
lanterna/
├── index.html              # shell pagina, layout UI + canvas
├── img/                    # asset grafici (esistente, invariato)
├── styles/
│   └── main.css            # UI esterna al canvas (header, pannello Blockly, timer)
└── src/
    ├── main.js             # entry point: init UI, Blockly, KAPLAY
    │
    ├── game/               # rendering e gameplay KAPLAY
    │   ├── game.js         # init engine, scene, game loop
    │   ├── assets.js       # mappa path → sprite KAPLAY, slice sheet
    │   ├── level.js        # rendering griglia da dati livello
    │   └── robot.js        # entità robot: sprite, direzione, stati pinza
    │
    ├── state/              # stato logico (indipendente da KAPLAY)
    │   └── gameState.js    # posizione robot, orientamento, cargo, celle lab
    │
    ├── levels/             # definizione livelli (solo dati)
    │   └── level01.js      # griglia, spawn A, goal B, ostacoli, props
    │
    ├── blockly/            # programmazione visuale
    │   ├── blocks.js       # definizione blocchi custom
    │   ├── toolbox.js      # toolbox categorie (movimento, azioni, loop)
    │   ├── parser.js       # workspace Blockly → lista comandi
    │   └── executor.js     # esecuzione step-by-step comandi su gameState
    │
    └── ui/                 # DOM fuori dal canvas
        ├── controls.js     # pulsanti Esegui / Stop / Reset
        └── messages.js     # testo missione, feedback vittoria/errore
```

### Motivazione delle modifiche rispetto alla bozza

| Modifica | Perché |
|---|---|
| `state/gameState.js` separato da `game/` | Lo stato logico (dove è il robot, cosa trasporta) non deve dipendere da KAPLAY; l'executor e il renderer lo consumano entrambi |
| `levels/` dedicata | I livelli sono dati puri; tenerli fuori da `game/` facilita aggiunta livelli senza toccare il motore |
| `game/assets.js` | Centralizza path e slice degli sheet; evita stringhe sparse in `robot.js` / `level.js` |
| `commands.js` → assorbito da `blockly/executor.js` | Il parser produce comandi, l'executor li esegue: un unico flusso Blockly → stato |
| `styles/main.css` fuori da `src/` | Convenzione Vite: CSS globale accanto a `index.html`, importato da `main.js` |

### Flusso dati previsto

```
Blockly workspace
    → parser.js (lista comandi)
        → executor.js (modifica gameState.js step-by-step)
            → game.js / robot.js / level.js (sync visuale KAPLAY)
                → ui/messages.js (feedback)
```

---

*Generato il 2026-08-26 — Prompt 0, analisi preliminare. Nessun codice di gioco implementato.*
