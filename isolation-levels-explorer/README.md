# Livelli di isolamento delle transazioni

Un esploratore interattivo dei 4 livelli di isolamento SQL standard (Read Uncommitted, Read Committed, Repeatable Read, Serializable). Due transazioni, T1 e T2, lavorano sullo stesso saldo di un conto: scegliendo il livello si vede, passo per passo, quale anomalia classica — dirty read o lettura non ripetibile — si manifesta oppure viene impedita.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un selettore con i 4 livelli di isolamento (Read Uncommitted, Read Committed, Repeatable Read, Serializable).
- **Scenario 1 — Dirty read**: T1 modifica il saldo ma non ha ancora fatto COMMIT; T2 prova a leggere il dato; poi T1 fa ROLLBACK. Con Read Uncommitted, T2 legge il valore modificato e scopre, dopo il ROLLBACK, di aver letto un valore mai esistito davvero. Con Read Committed o più stretto, T2 deve aspettare che T1 finisca prima di poter leggere.
- **Scenario 2 — Lettura non ripetibile**: T2 legge lo stesso saldo due volte nella stessa transazione; nel mezzo T1 lo modifica e fa COMMIT. Con Read Uncommitted o Read Committed, la seconda lettura di T2 restituisce il nuovo valore (diverso dalla prima — anomalia). Con Repeatable Read o Serializable, T2 vede lo stesso valore entrambe le volte.
- I due scenari vengono eseguiti ed esplorati in parallelo, in due colonne indipendenti, in modo da confrontare subito cosa cambia tra i livelli per ciascuna anomalia.
- Una tabella "anomalia vs livello" e il tradeoff tra isolamento e concorrenza nel pannello di approfondimento.

## Concetti didattici illustrati

- **Livello di isolamento**: quanto una transazione è protetta dagli effetti di altre transazioni concorrenti — un compromesso configurabile, non un valore assoluto.
- **Dirty read**: leggere un dato scritto da un'altra transazione non ancora confermata, che potrebbe sparire con un ROLLBACK.
- **Lettura non ripetibile** (non-repeatable read): ottenere due valori diversi leggendo lo stesso dato due volte nella stessa transazione.
- **Il tradeoff isolamento/concorrenza**: più isolamento elimina più anomalie, ma costringe più spesso le transazioni ad aspettarsi a vicenda.

## Nota sulla correttezza

Le funzioni `buildDirtyReadScenario` e `buildNonRepeatableReadScenario` sono state verificate in Node (non incluso nel progetto pubblicato) su tutti e 4 i livelli: l'anomalia risulta possibile esattamente nei livelli previsti dallo standard SQL (dirty read solo in Read Uncommitted; lettura non ripetibile in Read Uncommitted e Read Committed) e impedita in tutti gli altri casi.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica dei due scenari, selezione del livello e animazione a due colonne indipendenti

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
