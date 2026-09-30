# Trie (albero dei prefissi)

Un trie reale — la struttura dati dietro l'autocompletamento — con un elenco di parole modificabile e una barra di ricerca che evidenzia dal vivo il percorso corrispondente al prefisso digitato.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un albero dei prefissi costruito da un elenco di parole (modificabile: aggiungi le tue), dove ogni nodo è una lettera e le parole che condividono un prefisso condividono anche il percorso nell'albero.
- I nodi che completano una parola vera e propria sono evidenziati in modo diverso dai nodi che sono solo prefissi intermedi.
- Digitando un prefisso nella barra di ricerca, il percorso corrispondente si illumina dal vivo sull'albero e sotto compare l'elenco esatto di tutte le parole che iniziano con quel prefisso — lo stesso meccanismo dietro l'autocompletamento di una tastiera.

## Nota sulla correttezza

La struttura dati e la ricerca per prefisso sono state verificate in Node contro un controllo indipendente a forza bruta (filtrare l'intero elenco di parole con `String.startsWith`), su un elenco di 15 parole e 7 prefissi diversi (incluso il prefisso vuoto e un prefisso senza corrispondenze): risultati sempre identici.

## Concetti didattici illustrati

- **Condivisione dei prefissi**: perché parole diverse che iniziano allo stesso modo occupano lo stesso spazio nell'albero, invece di essere duplicate.
- **Ricerca per prefisso in tempo proporzionale alla lunghezza del prefisso, non al numero di parole** (approfondito nel pannello dedicato): il vantaggio chiave di un trie rispetto a una semplice lista.
- **Nodo come "prefisso" vs nodo come "parola completa"**: la stessa sequenza di lettere può essere entrambe le cose contemporaneamente (es. "sol" è sia una parola sia l'inizio di "solitario").

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia (incluso l'albero disegnato in puro CSS)
- [script.js](script.js) — implementazione del trie (inserimento, ricerca per prefisso) e rendering dell'albero

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
