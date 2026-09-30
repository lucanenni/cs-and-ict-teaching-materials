# Deadlock: quando due transazioni si bloccano a vicenda

Un esploratore interattivo del classico scenario di deadlock: due bonifici in direzioni opposte tra gli stessi due conti, che possono finire per aspettarsi a vicenda per sempre — e come un ordine di lock coerente lo previene del tutto.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Due pannelli affiancati con la stessa coppia di trasferimenti concorrenti (T1: A→B, T2: B→A), animati passo passo (play/pausa/passo singolo) con una mini-tabella che mostra in tempo reale chi tiene il lock su ciascun conto e chi è in attesa.
- A sinistra, un ordine di lock incoerente: le due transazioni finiscono in un'attesa circolare (deadlock), evidenziata in rosso, risolta dal database con l'abort di una delle due e il suo ritentativo.
- A destra, lo stesso scenario ma con un ordine di lock coerente (entrambe bloccano sempre prima lo stesso conto): le transazioni si mettono semplicemente in coda, senza mai bloccarsi a vicenda.

## Concetti didattici illustrati

- **Lock e attesa**: perché una transazione che vuole modificare una riga deve aspettare se un'altra la sta già modificando.
- **Deadlock come attesa circolare**: perché due transazioni possono bloccarsi a vicenda, e come il database se ne accorge e lo risolve scegliendo una vittima.
- **Prevenzione tramite ordine di lock coerente** (approfondito nel pannello dedicato): perché è la soluzione preferita rispetto a bloccare tutto in anticipo.

## Nota sulla correttezza

Le tracce di entrambi gli scenari (`DEADLOCK_STEPS`, `ORDERED_STEPS`) sono state verificate in Node (non incluso nel progetto pubblicato): nessun lock viene mai "rubato" senza un rilascio esplicito nel passo precedente, nessuna transazione risulta mai in attesa di un conto già libero, lo scenario di sinistra contiene davvero un'attesa circolare nei passi segnalati come deadlock, e quello di destra non ne contiene mai una in nessun passo — oltre a verificare che entrambi gli scenari terminino con tutti i lock rilasciati.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — tracce dei due scenari (stato dei lock passo per passo) e animazione a due colonne indipendenti

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
