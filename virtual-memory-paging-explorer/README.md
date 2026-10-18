# Memoria virtuale e paging

Un esploratore interattivo della paginazione: un processo con 8 pagine virtuali ma solo 4 frame di memoria fisica disponibili. Mostra, passo per passo, come la page table decide se un accesso è un hit o un page fault, e come la politica FIFO scelga quale pagina sfrattare quando la memoria fisica è piena.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Una page table con 8 pagine virtuali (0-7) e una memoria fisica con 4 frame (0-3): ogni pagina mostra il frame a cui è assegnata, oppure "non presente (su disco)".
- "Genera sequenza casuale" produce 10-12 accessi a pagine virtuali; in alternativa si può inserire un numero di pagina (0-7) e aggiungerlo alla sequenza con "Aggiungi accesso alla sequenza".
- "Passo singolo" avanza di un accesso alla volta: controlla la page table, segnala HIT o PAGE FAULT, e in caso di fault con memoria piena sceglie la pagina da sfrattare con la politica **FIFO** (la più vecchia tra quelle residenti).
- "Avvia" esegue tutta la sequenza in automatico.
- Un contatore "hit / page fault" che si aggiorna a ogni accesso, con page table e frame che si aggiornano visibilmente (quale pagina viene scaricata, quale viene caricata).

## Concetti didattici illustrati

- **L'illusione della memoria virtuale**: un processo vede uno spazio di indirizzi più grande della RAM fisica realmente disponibile; la page table nasconde questa differenza traducendo pagine virtuali in frame fisici (o segnalando che una pagina è su disco).
- **Page fault**: perché è lento rispetto a un hit — bisogna aspettare il disco, ordini di grandezza più lento della RAM.
- **Politiche di sostituzione delle pagine**: FIFO è semplice da seguire passo per passo (sfratta la pagina caricata più a lungo fa); il pannello di approfondimento introduce LRU come alternativa più efficace ma più costosa da implementare esattamente.

## Nota sulla correttezza

La funzione `simulatePaging` è stata verificata in Node (non incluso nel progetto pubblicato) su tre casi calcolabili a mano: una sequenza di 10 accessi con 4 frame che produce esattamente 4 hit e 6 fault (con le eviction FIFO verificate pagina per pagina), una sequenza di accessi ripetuti alla stessa pagina (1 solo fault, poi tutti hit) e una sequenza più corta del numero di frame disponibili (nessuna eviction).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica della paginazione FIFO e animazione passo per passo

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
