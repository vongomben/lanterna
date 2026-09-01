# Codice Lanterna

Motore web di coding visuale a blocchi (Blockly + Kaplay): programmi un robot/gripper per spostare un oggetto dal punto **A** al punto **B**.

Un solo repository, **due giochi** (stesso motore, contenuti diversi):

| Gioco | Config | Build | Cartella sul sito |
| --- | --- | --- | --- |
| **Codice Lanterna** (Porto di Genova, container) | `src/data/scenario-config.lanterna.js` | `npm run build` → `dist/` | `its-your-future/codice-lanterna/` |
| **Missione Nautica** (cella 4.0, componente nautico; sprite placeholder) | `src/data/scenario-config.nautica.js` | `npm run build:nautica` → `dist-nautica/` | `its-your-future/missione-nautica/` |

Non c’è un selettore in-game: ogni comando di build **congela** una skin. Chi apre `/codice-lanterna/` vede il porto; chi apre `/missione-nautica/` vede il cantiere.

Parte del percorso [IT'S YOUR FUTURE](https://github.com/vongomben/its-your-future).

- **Lanterna online:** [vongomben.github.io/its-your-future/codice-lanterna/](https://vongomben.github.io/its-your-future/codice-lanterna/)
- **Build hostata su GitHub:** [its-your-future/codice-lanterna](https://github.com/vongomben/its-your-future/tree/main/codice-lanterna)

## Requisiti

- [Node.js](https://nodejs.org/) 18 o superiore (include `npm`)

## Sviluppo in locale

Dalla cartella di questo repository:

```powershell
npm install
npm run dev
```

Apri l’URL stampato da Vite (di solito [http://localhost:5173](http://localhost:5173)).

| Comando | Cosa fa |
|---------|---------|
| `npm run dev` / `npm run dev:lanterna` | Skin **Codice Lanterna** (porto) |
| `npm run dev:nautica` | Skin **Missione Nautica** (placeholder) |
| `npm run build` | Lanterna in `dist/` (deploy Jekyll invariato) |
| `npm run build:lanterna` | Lanterna in `dist-lanterna/` (affiancata, non tocca `dist/`) |
| `npm run build:nautica` | Nautica in `dist-nautica/` |
| `npm run preview` | Serve `dist/` in locale |
| `npm run trim-assets` | Rigenera gli sprite ritagliati in `img/generated/` |

La scelta della skin avviene con `VITE_SCENARIO=lanterna|nautica` (la impostano gli script npm; su Windows non serve esportare a mano la variabile).

## Come generare i due giochi

Dalla cartella `lanterna`:

```powershell
npm run build          # → dist/            Codice Lanterna
npm run build:nautica  # → dist-nautica/    Missione Nautica
```

Poi copia **manualmente** ciascuna cartella in una sottocartella diversa di `its-your-future` (stessa convenzione di sempre: `base: "./"`).

Per un **terzo** titolo: nuovo file `src/data/scenario-config.qualcosa.js` + uno script `build:qualcosa`. Il motore (`src/game/`, `src/blockly/`) non si tocca.

## Dove si personalizza il contenuto

| Cosa | File |
| --- | --- |
| Testi, missione, blocchi, sprite Lanterna | `src/data/scenario-config.lanterna.js` |
| Testi, missione, placeholder Nautica | `src/data/scenario-config.nautica.js` |
| Quale config è attiva | `src/data/scenario-config.js` (legge `VITE_SCENARIO`) |

**Non toccare** per un nuovo tema: logica Blockly, collisioni, movimento. Cambia solo la config.

Missione Nautica usa ancora **placeholder** (rettangoli etichettati). Gli asset grafici definitivi si aggiungono dopo in `sprite` della config nautica.

## Hosting su GitHub (its-your-future)

I giochi non sono siti Pages a sé: la build statica si copia in una sottocartella del repository [vongomben/its-your-future](https://github.com/vongomben/its-your-future).

### Codice Lanterna (`dist/` → `codice-lanterna/`)

```powershell
npm run build

$src = "D:\davide-productions\26-06-11_Liguria-Chapter-02\github2\lanterna\dist"
$dst = "D:\davide-productions\26-06-11_Liguria-Chapter-02\github2\its-your-future\codice-lanterna"

Remove-Item "$dst\*" -Recurse -Force
Copy-Item "$src\*" $dst -Recurse
```

Poi nel repo `its-your-future`: `git add codice-lanterna`, commit, push.  
URL: [https://vongomben.github.io/its-your-future/codice-lanterna/](https://vongomben.github.io/its-your-future/codice-lanterna/)

La scheda didattica è in `_progetti/codice-lanterna.md`.

### Missione Nautica (`dist-nautica/` → `missione-nautica/`)

Stesso schema, cartella diversa. Crea `missione-nautica/` sul sito se non esiste ancora.

```powershell
npm run build:nautica

$src = "D:\davide-productions\26-06-11_Liguria-Chapter-02\github2\lanterna\dist-nautica"
$dst = "D:\davide-productions\26-06-11_Liguria-Chapter-02\github2\its-your-future\missione-nautica"

New-Item -ItemType Directory -Force -Path $dst | Out-Null
Remove-Item "$dst\*" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item "$src\*" $dst -Recurse
```

Poi: `git add missione-nautica`, commit, push.  
URL previsto: `https://vongomben.github.io/its-your-future/missione-nautica/`

Serve anche una scheda in `_progetti/` (come per Lanterna) se il gioco deve comparire nel catalogo del sito.

## Stack

- [Vite](https://vitejs.dev/) — build e dev server
- [Blockly](https://developers.google.com/blockly) — editor a blocchi
- [Kaplay](https://kaplayjs.com/) — motore di gioco 2D
