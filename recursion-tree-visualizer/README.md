# Albero della ricorsione

Uno strumento interattivo che mostra come una funzione ricorsiva si scompone in tante chiamate più piccole, e come queste chiamate si "risolvono" dal basso verso l'alto per costruire il risultato finale.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Due funzioni classiche: **fattoriale** (una catena lineare di chiamate) e **Fibonacci** (una ricorsione che si ramifica in due chiamate ad ogni passo).
- L'intero albero delle chiamate viene disegnato subito, con le caselle non ancora "eseguite" mostrate in grigio tratteggiato; i controlli play/passo-singolo/velocità fanno avanzare l'esecuzione un evento alla volta (chiamata o ritorno), esattamente nell'ordine in cui avverrebbero in una vera esecuzione ricorsiva.
- Una didascalia sopra l'albero spiega cosa sta succedendo in quel preciso passo (es. "fibonacci(4) = fibonacci(3) + fibonacci(2) = 2 + 1 = 3"), e una "pila delle chiamate attive" mostra quali chiamate sono, in quel momento, ancora in attesa di un risultato.
- In modalità Fibonacci, un badge arancione su ogni casella mostra quante volte quella stessa chiamata (stesso n) viene ripetuta in punti diversi dell'albero — rendendo visibile, senza bisogno di spiegazioni astratte, quanto lavoro ridondante fa la ricorsione ingenua.
- Le statistiche in fondo confrontano il numero di chiamate effettivamente fatte con il numero di passi che basterebbero con un semplice ciclo, per n dato.

## Concetti didattici illustrati

- **Ricorsione**: come una funzione che chiama se stessa scompone un problema in sotto-problemi più piccoli, fino a un caso base che si risolve direttamente.
- **Caso base vs caso ricorsivo**: la condizione che ferma la ricorsione, e cosa succede se manca (ricorsione infinita).
- **Pila delle chiamate (call stack)**: le chiamate in attesa di un risultato restano "sospese" fino a quando la chiamata più interna non ritorna.
- **Complessità e ridondanza**: la ricorsione ingenua di Fibonacci rifà da zero gli stessi calcoli molte volte, un esempio concreto per introdurre concetti come la complessità esponenziale e la *memoization*.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia, incluso il disegno CSS dell'albero
- [script.js](script.js) — costruzione dell'albero delle chiamate, calcolo dei valori e generazione dei fotogrammi dell'animazione

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
