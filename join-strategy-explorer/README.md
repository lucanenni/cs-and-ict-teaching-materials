# Nested loop join vs hash join

Un esploratore interattivo di due strategie di join: la tabella "Ordini" e la tabella "Clienti" vengono unite sulla chiave `cliente_id`, prima con un nested loop join (confronto a confronto) e poi con un hash join (costruzione di una hash table e lookup). Un contatore di operazioni mostra in diretta perché le due strategie scalano in modo molto diverso al crescere delle tabelle.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Uno slider per scegliere quante righe hanno le tabelle Ordini e Clienti (da 3 a 15, stesso numero per entrambe).
- **Nested loop join**: per ogni riga di Ordini, scansiona tutte le righe di Clienti cercando `cliente_id`. Un contatore di confronti effettuati cresce passo per passo, esattamente come N × M.
- **Hash join**: prima costruisce una hash table su Clienti (M operazioni di inserimento, una passata), poi scansiona Ordini una sola volta facendo un lookup O(1) per riga (N operazioni). Il contatore totale cresce come N + M, molto più lentamente.
- Due riquadri riassuntivi in alto mostrano live, al variare dello slider, il totale previsto per ciascuna strategia (N × M contro N + M), per vedere subito quanto si allontanano al crescere delle righe.
- Un riepilogo finale per ciascuna strategia, al termine dell'animazione, con il totale di operazioni effettivamente contato.

## Concetti didattici illustrati

- **Nested loop join**: la strategia di join più semplice, il cui costo cresce come il prodotto delle dimensioni delle due tabelle (N × M).
- **Hash join**: costruire una struttura hash permette di trasformare la ricerca della corrispondenza da una scansione lineare a un lookup in tempo costante, portando il costo totale a N + M.
- **Il ruolo del query planner**: perché un database, su tabelle grandi senza indice sulla chiave di join, sceglie quasi sempre l'hash join — e perché il nested loop può comunque vincere su tabelle piccolissime, dato che l'hash join ha un costo di costruzione iniziale.

## Nota sulla correttezza

Le funzioni `generateOrdini`, `generateClienti`, `buildNestedLoopSteps` e `buildHashJoinSteps` sono state verificate in Node (non incluso nel progetto pubblicato) per N = 3, 6 e 15: il nested loop produce sempre esattamente N × M confronti, l'hash join sempre esattamente N + M operazioni, ed entrambe le strategie trovano esattamente le stesse corrispondenze cliente_id per ciascun ordine.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — generazione dei dati, logica delle due strategie di join e animazione

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
