# Indici e alberi B: cercare senza leggere tutto

Un confronto diretto e animato tra due modi di cercare una riga per codice: leggerle tutte una per una (come deve fare una tabella senza indice) oppure scendere in un piccolo albero B che le tiene organizzate — contando i confronti reali di entrambi i metodi.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Una tabella di 15 righe salvata nell'ordine "fisico" di inserimento (non ordinata per codice) e lo stesso insieme di codici organizzato in un piccolo albero B (una radice con 3 chiavi separatrici, 4 foglie con 3 chiavi ciascuna).
- Un codice da cercare (a scelta, o tra cinque preimpostati che includono casi esistenti e non), con due animazioni indipendenti: la scansione riga per riga della tabella, e la discesa nell'albero confrontando le chiavi nodo per nodo.
- Un contatore di confronti per ciascun metodo, con un confronto visivo finale a barre — la differenza si vede subito, anche su una tabella di sole 15 righe.

## Concetti didattici illustrati

- **Perché un indice velocizza la ricerca**: senza, il caso peggiore (valore assente) richiede sempre di controllare ogni riga; con un albero B, il numero di nodi visitati cresce molto più lentamente della dimensione della tabella.
- **La differenza tra ordine fisico e ordine logico**: la tabella su disco resta nell'ordine di inserimento, ma l'indice mantiene comunque un accesso "come se" fosse ordinata, senza doverla riscrivere.
- **Il costo di un indice** (approfondito nel pannello dedicato): perché non conviene indicizzare automaticamente ogni colonna.

## Nota sulla correttezza

L'albero di questo progetto è costruito una sola volta (bulk-load da un elenco fisso di 15 chiavi ordinate), non tramite inserimenti incrementali con sdoppiamento dei nodi: questo rende la struttura interamente verificabile a mano. L'algoritmo di ricerca in `script.js` è stato verificato in Node (non incluso nel progetto pubblicato) su tutte le 15 chiavi esistenti (trovate correttamente, con un numero di confronti sempre tra 1 e 6) e su 14 valori assenti in punti diversi dell'intervallo (correttamente segnalati come assenti da entrambi i metodi), oltre a un controllo generico dell'invariante di un albero B (le chiavi di ogni figlio cadono sempre nell'intervallo dei due separatori che lo delimitano nel nodo padre).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — dati della tabella e dell'albero, algoritmi di ricerca e animazione

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
