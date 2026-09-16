# Visualizzatore di branching Git

Uno strumento interattivo che mostra il grafo dei commit di un repository Git man mano che lo costruisci tu stesso: commit, branch, checkout e merge, con un vero modello a grafo aciclico diretto (DAG) dietro le quinte.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- **Commit**: aggiunge un nuovo commit al branch attuale, con il commit precedente come genitore.
- **Crea branch**: aggiunge una nuova etichetta che punta al commit attuale — nessun nuovo commit creato.
- **Checkout**: sposta HEAD su un altro branch.
- **Merge**: unisce un altro branch in quello attuale. Se un branch è semplicemente "avanti" rispetto all'altro, l'etichetta si sposta senza creare un nuovo commit (**fast-forward**); se le due storie sono divergenti, viene creato un vero commit di merge con due genitori.

Il grafo si aggiorna dal vivo dopo ogni azione, con le etichette dei branch e l'indicatore HEAD sempre visibili accanto al loro commit di riferimento.

## Concetti didattici illustrati

- **Grafo aciclico diretto (DAG)**: la vera struttura dati dietro la cronologia di un repository, non una semplice lista.
- **Branch come puntatori mobili**: un'etichetta leggera che punta a un commit, non una copia dei file.
- **Fast-forward vs merge commit**: due esiti diversi per un'unione, a seconda che le storie siano divergenti o meno — rilevato controllando se un commit è antenato dell'altro nel grafo.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — modello del repository (commit, branch, HEAD), rilevamento degli antenati per il merge e disegno del grafo su SVG

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
