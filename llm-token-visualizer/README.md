# LLM token visualizer

Un simulatore didattico che mostra, passo dopo passo, come un modello di linguaggio (LLM) genera testo **un token alla volta**, scegliendo tra percorsi alternativi con probabilità diverse.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

Vibe coding (Claude free) + qualche intervento manuale.

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Una frase di esempio viene generata token per token con un'animazione temporizzata (velocità regolabile).
- In uno o due punti della frase (a seconda dell'esempio) il modello si trova davanti a più alternative plausibili: se la "modalità automatica" è disattivata, la generazione si ferma e mostra le probabilità delle alternative — che sommano sempre al 100% insieme al percorso principale — lasciando scegliere quale seguire.
- I colori distinguono il token corrente, il percorso principale e i percorsi alternativi scelti.
- Una sezione "Perché il modello sceglie queste probabilità?" (in fondo, sotto "Come funziona?") approfondisce brevemente softmax e temperatura per chi vuole andare oltre.

## Concetti didattici illustrati

- Generazione **autoregressiva**: il testo viene prodotto un token alla volta, condizionato dal contesto precedente.
- **Token** come unità di base (parola, parte di parola o punteggiatura), non necessariamente coincidenti con le parole.
- **Probabilità** associate a ciascun token candidato e il ruolo del campionamento/scelta nella generazione.
- Idea di **spazio dei possibili completamenti**: da uno stesso prompt possono nascere continuazioni diverse.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica di stato, generazione dei token e gestione delle scelte

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
