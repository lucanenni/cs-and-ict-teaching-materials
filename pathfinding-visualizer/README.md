# Visualizzatore di pathfinding

Disegna dei muri su una griglia, poi guarda BFS e DFS esplorarla in modi molto diversi alla ricerca di un percorso dalla partenza all'arrivo — solo uno dei due garantisce di trovare quello più breve.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Una griglia 14×8 con partenza in alto a sinistra e arrivo in basso a destra: clicca sulle celle per disegnare (o cancellare) dei muri.
- Un menu per scegliere tra **BFS** (in ampiezza) e **DFS** (in profondità).
- "Avvia ricerca" anima l'esplorazione cella per cella, poi evidenzia in verde il percorso trovato (se esiste).
- "Muri casuali" genera un labirinto casuale per una demo rapida; "Griglia vuota" cancella tutti i muri.

## Concetti didattici illustrati

- **BFS (Breadth-First Search)**: esplora "per onde" e garantisce sempre il percorso più breve su una griglia senza pesi.
- **DFS (Depth-First Search)**: si spinge il più lontano possibile prima di tornare indietro, trova un percorso ma quasi mai il più breve.
- Il compromesso tra **quanto lavoro fa** un algoritmo di ricerca e **quanto è buono** il risultato che trova — due algoritmi possono risolvere lo stesso problema con garanzie molto diverse.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — implementazione di BFS/DFS, ricostruzione del percorso e logica di riproduzione

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
