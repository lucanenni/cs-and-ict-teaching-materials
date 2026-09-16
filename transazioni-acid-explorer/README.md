# Transazioni: perché un prelievo può "sparire"

Un esploratore interattivo del classico problema del "lost update": due sportelli prelevano dallo stesso conto quasi contemporaneamente. Senza transazioni, la banca può finire per consegnare più soldi di quanti il conto ne avesse — senza che il saldo finale lo riveli. Con le transazioni, lo stesso scenario si risolve correttamente.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un conto con saldo iniziale fisso (€100) e un importo di prelievo regolabile, richiesto da due sportelli contemporaneamente.
- Due animazioni indipendenti (play/pausa/passo singolo) affiancate: lo stesso scenario eseguito prima senza alcuna protezione (entrambi gli sportelli leggono lo stesso saldo "vecchio" e scrivono in sequenza, l'uno sovrascrivendo l'altro) e poi con transazioni (la seconda deve aspettare che la prima confermi).
- Un riepilogo finale che confronta saldo registrato e denaro davvero consegnato: nello scenario senza transazioni, con un importo abbastanza alto (es. €70), i due sportelli consegnano insieme €140 pur avendo solo €100 — una discrepanza che il solo saldo finale non rivela.
- Cambiando l'importo si possono esplorare anche i casi in cui le transazioni non rifiutano il secondo prelievo (quando i fondi restano comunque sufficienti dopo il primo).

## Concetti didattici illustrati

- **Il problema del lost update**: perché due letture concorrenti dello stesso dato, seguite da scritture indipendenti, possono far sparire un aggiornamento.
- **Atomicità e isolamento**: come una transazione rende leggi-verifica-scrivi un blocco indivisibile, impedendo a un'altra transazione di intromettersi a metà.
- **Le altre due lettere di ACID** (approfondito nel pannello dedicato): cosa sono coerenza e durabilità, e perché completano la stessa promessa.

## Nota sulla correttezza

Le funzioni `buildNoTxScenario` e `buildTxScenario` sono state verificate in Node (non incluso nel progetto pubblicato) su ogni combinazione di saldo (0-100, a passi di 10) e importo (1-100, a passi di 7): lo scenario con transazioni conserva sempre esattamente il denaro (saldo finale + denaro consegnato = saldo iniziale, senza eccezioni) e non produce mai un saldo negativo; lo scenario senza transazioni produce una discrepanza pari esattamente al prelievo "perso" di uno sportello ogni volta che entrambi i prelievi vengono erroneamente autorizzati.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica dei due scenari e animazione a due colonne indipendenti

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
