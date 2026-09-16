# Compressione di Huffman

Uno strumento interattivo che mostra perché dare codici più corti alle lettere più frequenti (e più lunghi a quelle rare) permette di comprimere un testo, senza perdere nemmeno un bit di informazione.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Scrivendo un testo, la pagina conta le occorrenze di ogni carattere e costruisce l'**albero di Huffman**, un passo alla volta: ad ogni passo unisce i due nodi meno frequenti rimasti in coda in un unico nuovo nodo.
- L'albero risultante è disegnato con le etichette 0/1 su ogni ramo: il codice di ogni carattere si legge seguendo il percorso dalla radice alla sua foglia.
- Una tabella mostra il codice binario assegnato a ciascun carattere — più corto per i caratteri più frequenti — e il testo viene poi codificato con quei codici.
- Un confronto numerico mostra quanti bit servono con Huffman contro una codifica a 8 bit fissi per carattere, con la percentuale di spazio risparmiato.

## Concetti didattici illustrati

- **Compressione senza perdita (lossless)**: si riduce lo spazio occupato senza perdere alcuna informazione — il testo originale si ricostruisce sempre esattamente.
- **Codifica a lunghezza variabile**: a differenza di codifiche a larghezza fissa (ASCII, o il codice Baudot visto in [baudot-code-explorer](../baudot-code-explorer/)), qui ogni carattere può occupare un numero diverso di bit, scelto in base a quanto è frequente.
- **Codice prefisso**: nessun codice è mai l'inizio di un altro, il che rende la decodifica non ambigua senza bisogno di separatori.
- **Algoritmo greedy**: ad ogni passo si prende la scelta localmente migliore (unire i due nodi meno frequenti) — e in questo caso specifico, si dimostra che porta sempre a un risultato ottimale.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia, incluso il disegno CSS dell'albero (con etichette 0/1 sui rami) condiviso in stile con recursion-tree-visualizer e binary-search-tree-visualizer
- [script.js](script.js) — costruzione passo-passo dell'albero di Huffman, assegnazione dei codici e codifica del testo

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
