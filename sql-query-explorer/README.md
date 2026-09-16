# SQL dal vivo: SELECT, WHERE, JOIN

Un piccolo motore SQL scritto da zero in JavaScript — tokenizzatore, parser ed esecutore — che interpreta ed esegue davvero le query scritte dall'utente su un mini-database di studenti e voti. Non è un simulatore con risposte precalcolate: ogni query, comprese quelle scritte a mano, viene realmente analizzata ed eseguita.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Due tabelle di esempio sempre visibili (`studenti` e `voti`, collegate da `studenti.id = voti.studente_id`), così si vede sempre da dove arriva ogni riga di risultato.
- Cinque query pronte, dalla più semplice (`SELECT` con `WHERE`) alla più complessa (`JOIN` con `WHERE` e `ORDER BY`), oltre a un editor libero per scriverne di proprie.
- Messaggi d'errore in italiano, chiari e specifici, quando la query non è valida (parola chiave mancante, tabella o colonna sconosciuta, colonna ambigua tra le due tabelle...) — pensati per essere didattici, non solo per segnalare il fallimento.

## Cosa capisce il motore

`SELECT colonne|* FROM tabella [JOIN altratabella ON t1.col = t2.col] [WHERE condizioni con AND] [ORDER BY colonna [ASC|DESC]]`

Volutamente **non** copre tutto SQL: niente sottoquery, `GROUP BY`, funzioni di aggregazione (`COUNT`, `SUM`...), `OR` o parentesi nel `WHERE`, o join multipli. Lo scopo non è essere un database completo, ma eseguire correttamente e in modo trasparente il sottoinsieme che copre.

## Concetti didattici illustrati

- **Sintassi SQL di base**: `SELECT`/`FROM`/`WHERE`/`JOIN`/`ORDER BY` scritti e letti davvero, non solo mostrati come esempio statico.
- **L'ordine logico di esecuzione di una query** (approfondito nel pannello dedicato): perché concettualmente `FROM` e `JOIN` vengono valutati prima di `WHERE`, e `SELECT` per ultimo, anche se è la prima parola che si scrive.
- **Ambiguità delle colonne in un JOIN**: perché una colonna con lo stesso nome in due tabelle (come `id`) va qualificata con `tabella.colonna`.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [engine.js](engine.js) — il motore SQL: tokenizzatore, parser ricorsivo e motore di esecuzione (JOIN, filtro, ordinamento, proiezione)
- [script.js](script.js) — interfaccia: rendering delle tabelle di esempio, query preimpostate ed esecuzione

## Nota sulla correttezza

Il motore in `engine.js` è stato verificato con una batteria di test in Node (non inclusa nel progetto pubblicato) che confronta i risultati di ogni query preimpostata — oltre a `JOIN`, `WHERE` con `AND`, `ORDER BY` crescente/decrescente, `SELECT *` su tabella singola e su join, colonne qualificate e ambigue — con il risultato atteso calcolato a mano sul dataset fisso, più una serie di query deliberatamente scorrette per verificare che ogni errore venga segnalato con un messaggio corretto invece di un risultato sbagliato silenzioso.

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
