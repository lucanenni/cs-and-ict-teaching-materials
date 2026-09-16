# Piani di esecuzione: quando l'indice non conviene

Un esploratore interattivo di come un pianificatore di query sceglie tra una scansione completa e una ricerca indicizzata — e perché avere un indice non significa che il database lo userà sempre.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Una tabella di esempio da 1000 righe con un indice disponibile su una colonna, e uno slider per regolare quante righe soddisfano una condizione `WHERE`.
- Due "piani di esecuzione" in stile `EXPLAIN`, con il loro costo stimato che si aggiorna dal vivo: Seq Scan (costo costante, legge sempre tutta la tabella) e Index Scan (costo che cresce con il numero di righe trovate, perché ogni riga richiede un accesso separato).
- Un verdetto che mostra quale piano sceglierebbe davvero il pianificatore, con quattro scenari preimpostati che vanno da una ricerca per chiave univoca a un filtro che seleziona quasi tutta la tabella.

## Concetti didattici illustrati

- **Il costo di un accesso "sparso" (indice) contro uno "in blocco" (scansione completa)**, e perché non sono uguali per riga.
- **La selettività di una condizione** come fattore decisivo nella scelta del piano — non basta "avere un indice" perché il database lo usi.
- **Come un pianificatore stima quante righe corrisponderanno** (approfondito nel pannello dedicato), tramite statistiche periodicamente ricalcolate, non eseguendo davvero la query in anticipo.

## Nota sulla correttezza

Il modello di costo (`seqScanCost`, `indexScanCost`) è stato verificato in Node (non incluso nel progetto pubblicato): il costo della scansione completa è sempre costante; il costo della ricerca indicizzata cresce in modo strettamente monotono con il numero di righe corrispondenti su tutto l'intervallo 0-1000; è stato individuato e verificato il punto esatto di incrocio tra le due strategie; e i quattro scenari preimpostati producono il verdetto atteso (indice vince con poche righe, scansione completa vince quando la condizione seleziona una porzione ampia della tabella).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — modello di costo e aggiornamento dei piani in base allo slider

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
