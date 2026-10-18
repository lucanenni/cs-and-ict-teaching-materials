# Union-Find e l'algoritmo di Kruskal

Un esploratore interattivo di come l'algoritmo di Kruskal costruisce un albero di copertura minimo (Minimum Spanning Tree) su una piccola rete di 7 nodi, usando la struttura dati Union-Find per decidere in tempo utile quali archi accettare e quali scartare perché chiuderebbero un ciclo.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un grafo di 7 nodi e 10 archi pesati, con ogni nodo inizialmente colorato come la propria componente (il proprio insieme).
- Gli archi ordinati per peso crescente in una lista laterale, esattamente come li richiede Kruskal.
- "Passo singolo" per considerare un arco alla volta: viene eseguito `find` sui due nodi estremi — se sono in componenti diverse, l'arco viene aggiunto al Minimum Spanning Tree (evidenziato in verde) e le due componenti si uniscono (tutti i nodi della componente più piccola prendono il colore dell'altra, unione per dimensione); se sono già nella stessa componente, l'arco viene scartato (mostrato in grigio tratteggiato) perché chiuderebbe un ciclo.
- "Avvia" esegue tutti i passi in automatico fino a quando il MST è completo (un solo componente) o tutti gli archi sono stati considerati.
- Un riepilogo finale con peso totale del MST, numero di archi usati e numero di archi scartati.

## Concetti didattici illustrati

- **Union-Find**: come rispondere in modo efficiente alla domanda "questi due nodi sono già collegati, anche indirettamente?", tramite le operazioni `find` (qual è la radice del mio insieme?) e `union` (unisci due insiemi).
- **L'algoritmo di Kruskal**: perché considerare gli archi dal più leggero al più pesante, e accettarne uno solo se collega due componenti ancora separate, produce sempre un albero di copertura di peso minimo.
- **Perché un MST non ha cicli**: un albero di copertura minimo collega tutti i nodi usando il minor peso possibile — e un ciclo conterrebbe sempre almeno un arco "di troppo", rimovibile senza perdere la connessione e senza aumentare il peso totale.

## Nota sulla correttezza

La logica di `makeUnionFind` e `runKruskal` è stata verificata in Node (non incluso nel progetto pubblicato): sul grafo usato in questa pagina, Kruskal produce un MST di peso totale 23 con 6 archi (F-G, C-D, B-C, A-C, D-E, D-F), scartando l'arco A-B perché chiuderebbe un ciclo — un risultato confermato in modo indipendente da un algoritmo a forza bruta che enumera tutti i possibili alberi di copertura. Uno stress test con 25 grafi casuali più piccoli conferma che il peso del MST calcolato da Kruskal coincide sempre con quello calcolato a forza bruta.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica di Union-Find/Kruskal e disegno del grafo (SVG)

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
