# Pila e coda

Uno strumento interattivo che mostra le due strutture dati più semplici per accumulare ed estrarre elementi — la **pila** (stack, LIFO) e la **coda** (queue, FIFO) — e perché la differenza tra le due conta.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Due modalità indipendenti — **Pila** e **Coda** — ciascuna con il proprio stato: passare dall'una all'altra non mescola i dati.
- Aggiungi un valore (o generane uno casuale) e rimuovilo: in modalità Pila l'elemento appena inserito è sempre il primo a essere tolto (evidenziato come "CIMA"); in modalità Coda è sempre il primo elemento mai inserito ad andarsene (evidenziato come "TESTA").
- Una cronologia delle operazioni mostra ogni push/pop o enqueue/dequeue con lo stato risultante della struttura, per seguire passo passo cosa succede.

## Concetti didattici illustrati

- **LIFO vs FIFO**: le due regole d'ordine fondamentali per organizzare dati, e come la stessa identica sequenza di inserimenti produca un ordine di uscita completamente diverso a seconda della struttura scelta.
- **Astrazione dei dati**: pile e code non dicono nulla su *come* sono implementate internamente (array, lista concatenata...) — definiscono solo *quali operazioni* sono permesse e in che ordine si comportano.
- Applicazioni reali: la pila delle chiamate di un programma e la funzione "Annulla" di un editor (entrambe LIFO); una coda di stampa o di richieste in arrivo a un server (FIFO).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica di pila e coda, cronologia delle operazioni e disegno dell'interfaccia

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
