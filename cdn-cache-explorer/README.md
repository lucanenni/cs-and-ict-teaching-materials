# CDN: cache hit, cache miss e invalidazione

Un esploratore interattivo della cache di una CDN: guarda una richiesta viaggiare fino al server d'origine la prima volta (lenta) e tornare quasi istantanea dal server edge le volte successive — finché una scadenza (TTL) o un'invalidazione manuale non la rendono di nuovo un miss.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Tre risorse di esempio, ciascuna con la propria scadenza (TTL) e i propri tempi di risposta realistici (origine lenta, edge veloce).
- Un orologio simulato che avanza a ogni richiesta, e un diagramma animato che mostra il percorso reale del pacchetto: solo utente↔edge per un hit, utente↔edge↔origine↔edge↔utente per un miss.
- Una cronologia delle richieste con l'esito (HIT/MISS) e il tempo di risposta, per vedere concretamente quanto conviene un hit.
- Un pulsante "Invalida" per ogni risorsa: forza il prossimo accesso a essere un miss anche se il TTL non è ancora scaduto, come una vera pubblicazione di un aggiornamento.

## Concetti didattici illustrati

- **Cache hit vs cache miss** e perché la differenza di velocità è così marcata.
- **TTL (Time To Live)**: perché una cache scade da sola, anche senza che nessuno la tocchi.
- **Invalidazione manuale** (approfondito nel pannello dedicato): perché serve poter forzare un miss prima della scadenza naturale, tipicamente dopo aver pubblicato un aggiornamento.

## Nota sulla correttezza

La logica di cache (`requestResource`, `isCached`, `purgeResource`) è stata verificata in Node (non inclusa nel progetto pubblicato): la prima richiesta a una risorsa è sempre un miss che la mette in cache con la scadenza corretta; le richieste successive entro il TTL sono hit; il comportamento al confine esatto della scadenza è stato verificato esplicitamente (l'ultimo istante utile è ancora un hit, quello dopo è un miss); e un'invalidazione manuale forza un miss anche su una risorsa con un TTL lungo ancora ben lontano dalla scadenza.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — risorse, logica di cache/scadenza/invalidazione e animazione

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
