# Sharding e partizionamento

Un esploratore interattivo del partizionamento orizzontale (sharding): una tabella "Utenti" di 12 righe divisa su 3 shard in base all'ID (`id % 3`). Confronta passo per passo una query che usa la chiave di sharding — e interroga un solo nodo — con una che non la usa — e deve interrogarli tutti.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- 12 utenti (id, nome, età) distribuiti su 3 shard con hash sharding semplice (`shard = id % 3`), mostrati come 3 riquadri affiancati.
- **Query per ID**: inserendo un ID, la pagina mostra passo per passo il calcolo `id % 3`, l'instradamento diretto a quello shard SOLO, e il risultato — con un contatore "nodi interrogati: 1 di 3".
- **Query senza chiave di sharding** (es. "età > 30"): la query viene inviata (scatter) a tutti e 3 gli shard, ciascuno restituisce i propri risultati, e vengono poi uniti (gather) — con un contatore "nodi interrogati: 3 di 3" a confronto con il caso precedente.
- Lo shard effettivamente interrogato in ciascun passo viene evidenziato nei riquadri in alto, insieme alle righe trovate.

## Concetti didattici illustrati

- **Sharding (partizionamento orizzontale)**: dividere le righe di una tabella grande su più nodi, per scalare orizzontalmente oltre quanto un solo server potrebbe gestire.
- **Chiave di sharding**: il campo (qui l'id) usato per decidere su quale nodo va ciascuna riga — e che permette di instradare una query direttamente al nodo giusto.
- **Query scatter-gather**: il costo reale di una query che non usa la chiave di sharding, che deve raggiungere tutti i nodi e poi unire i risultati.

## Nota sulla correttezza

Le funzioni `shardOf`, `buildIdQueryScenario` e `buildScatterGatherScenario` sono state verificate in Node (non incluso nel progetto pubblicato): ogni utente appartiene esattamente a uno dei 3 shard (nessuna riga persa o duplicata), la query per ID interroga sempre esattamente 1 nodo, e la query scatter-gather su "età > 30" trova le stesse 7 righe totali che si otterrebbero filtrando l'intera tabella senza sharding (3 nello Shard 0, 1 nello Shard 1, 3 nello Shard 2).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — dati, logica di sharding e animazione dei due scenari

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
