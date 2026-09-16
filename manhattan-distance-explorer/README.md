# Distanza di Manhattan

Un esploratore interattivo della distanza di Manhattan (o "taxicab distance"): sposta due punti su una griglia e guarda come la somma delle differenze assolute di riga e colonna si confronta con la distanza euclidea in linea d'aria.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Una griglia 8×12 su cui spostare due punti A e B, cliccando le celle dopo aver selezionato quale dei due muovere.
- Il calcolo dal vivo della distanza di Manhattan (`|Δriga| + |Δcolonna|`) e, per confronto, della distanza euclidea in linea d'aria, con una riga tratteggiata che la visualizza.
- Un percorso "a scala" tra i due punti, generato mescolando a caso l'ordine dei passi verticali e orizzontali: il pulsante "Mescola percorso" ne mostra uno diverso ogni volta, tutti della stessa identica lunghezza — e il pannello indica quanti percorsi distinti esistono in totale (un calcolo di combinazioni).
- Quattro configurazioni pronte (angoli opposti, stessa riga, stessa colonna, posizione casuale) per esplorare i casi limite: quando la distanza di Manhattan coincide con quella euclidea e quando se ne discosta di più.

## Concetti didattici illustrati

- **Distanza di Manhattan / taxicab**: perché su una griglia di strade percorribili solo in orizzontale o in verticale non ha senso "tagliare" in diagonale, e come si calcola.
- **Percorsi multipli, stessa distanza**: ogni combinazione di passi verticali e orizzontali produce un percorso diverso ma della stessa lunghezza — un'introduzione informale al calcolo combinatorio (coefficiente binomiale).
- **Euristiche ammissibili** (approfondito nel pannello dedicato): perché la distanza di Manhattan è la stima giusta da usare in algoritmi come A* quando il movimento è limitato alle quattro direzioni cardinali, come nei percorsi visti in [pathfinding-visualizer](../pathfinding-visualizer/) e [dijkstra-shortest-path-explorer](../dijkstra-shortest-path-explorer/).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — calcolo delle distanze, generazione del percorso a scala e disegno della linea euclidea

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
