# Codice Lanterna

Videogioco web di coding visuale a blocchi (Blockly + Kaplay): programma un robot/gripper per estrarre un container dal deposito del Porto di Genova e portarlo dal punto **A** al punto **B**.

Parte del percorso [IT'S YOUR FUTURE](https://github.com/vongomben/its-your-future).

- **Gioco online:** [vongomben.github.io/its-your-future/codice-lanterna/](https://vongomben.github.io/its-your-future/codice-lanterna/)
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

Altri comandi utili:

| Comando | Cosa fa |
|---------|---------|
| `npm run build` | Prepara gli asset, genera la build di produzione in `dist/` e copia `img/` |
| `npm run preview` | Serve in locale la cartella `dist/` (utile per verificare la build prima del deploy) |
| `npm run trim-assets` | Rigenera gli sprite ritagliati in `img/generated/` |

## Build di produzione

```powershell
npm run build
```

L’output finisce in `dist/` (HTML, CSS/JS in `assets/`, immagini in `img/`).  
`vite.config.js` usa `base: "./"`, così i path relativi funzionano anche sotto una sottocartella come `/its-your-future/codice-lanterna/`.

## Hosting su GitHub (its-your-future)

Il gioco non è pubblicato come sito Pages a sé: la build statica viene copiata nella cartella `codice-lanterna/` del repository [vongomben/its-your-future](https://github.com/vongomben/its-your-future), già hostato su GitHub Pages.

Procedura (dopo `npm run build`):

1. Clona (o aggiorna) il repo del sito, se non ce l’hai già in locale:

   ```powershell
   git clone https://github.com/vongomben/its-your-future.git
   ```

2. Sostituisci il contenuto di `its-your-future/codice-lanterna/` con quello di `dist/` di questo progetto.  
   Esempio da PowerShell (adatta i percorsi):

   ```powershell
   $src = "D:\davide-productions\26-06-11_Liguria-Chapter-02\github2\lanterna\dist"
   $dst = "D:\davide-productions\26-06-11_Liguria-Chapter-02\github2\its-your-future\codice-lanterna"

   Remove-Item "$dst\*" -Recurse -Force
   Copy-Item "$src\*" $dst -Recurse
   ```

3. Nel repository `its-your-future`, committa e pusha su `main`:

   ```powershell
   Set-Location "D:\davide-productions\26-06-11_Liguria-Chapter-02\github2\its-your-future"
   git add codice-lanterna
   git commit -m "Update Codice Lanterna build"
   git push
   ```

4. Dopo il deploy di GitHub Pages, il gioco è disponibile su:

   [https://vongomben.github.io/its-your-future/codice-lanterna/](https://vongomben.github.io/its-your-future/codice-lanterna/)

La scheda didattica del progetto è in `_progetti/codice-lanterna.md` e punta a `/codice-lanterna/` tramite `relative_url`.

## Stack

- [Vite](https://vitejs.dev/) — build e dev server
- [Blockly](https://developers.google.com/blockly) — editor a blocchi
- [Kaplay](https://kaplayjs.com/) — motore di gioco 2D
