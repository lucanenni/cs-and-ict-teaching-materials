# Albero binario di ricerca

Uno strumento interattivo che mostra come un **albero binario di ricerca** (BST) tiene i dati ordinati automaticamente, permette di cercare un valore senza controllarli tutti uno a uno, e come la sua forma dipenda interamente dall'ordine in cui i valori vengono inseriti.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- **Inserimento**: scrivi un numero e aggiungilo all'albero — la pagina mostra dove finisce e perché (a sinistra se è più piccolo del nodo corrente, a destra se è più grande, ripetuto ad ogni livello).
- **Ricerca**: cerca un valore e guarda, passo dopo passo, il percorso di confronti seguito per trovarlo (o per scoprire che non c'è) — molto più corto di un controllo elemento per elemento.
- **Visita in-order**: attraversa l'albero (sinistra, nodo, destra, ricorsivamente) e mostra come produca sempre e comunque i valori in ordine crescente, qualunque sia la forma dell'albero.
- Le statistiche mostrano il numero di nodi, l'altezza attuale dell'albero e l'altezza minima teoricamente possibile con quel numero di nodi — utile per notare quando un albero è più "sbilanciato" del necessario.

## Concetti didattici illustrati

- **Struttura dati ordinata**: come organizzare i dati in modo che restino sempre ordinati "gratuitamente", senza bisogno di riordinarli ogni volta.
- **Ricerca binaria su una struttura ad albero**: ogni confronto dimezza (idealmente) lo spazio di ricerca rimanente, invece di scorrere tutto in sequenza.
- **Bilanciamento**: l'ordine di inserimento determina la forma dell'albero — inserire valori già ordinati produce una catena degenere (equivalente, in termini di prestazioni, a una semplice lista), mentre un ordine "misto" tende a produrre alberi più bassi e più efficienti da cercare.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia, incluso il disegno CSS dell'albero (con segnaposto invisibili per mantenere corretta la posizione sinistra/destra anche quando un nodo ha un solo figlio)
- [script.js](script.js) — logica di inserimento, ricerca e visita in-order del BST, generazione dei fotogrammi dell'animazione e disegno dell'interfaccia

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
