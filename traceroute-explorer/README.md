# Traceroute: mappare la strada di un pacchetto

Una simulazione interattiva di traceroute: scopri, un hop alla volta, tutti i router attraversati da un pacchetto verso una destinazione, sfruttando il campo TTL (Time To Live) esattamente come farebbe il comando reale.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Tre destinazioni preimpostate, a distanza diversa (4, 6 e 8 hop), per confrontare percorsi più corti e più lunghi.
- Un diagramma che si allunga in base al numero di hop, con l'animazione a passi (play/pausa/passo singolo) che rivela un router alla volta man mano che il TTL cresce.
- Una tabella dei risultati, popolata hop dopo hop con IP del router e RTT (round-trip time), che tende a crescere avvicinandosi alla destinazione.
- Il pulsante "Esegui di nuovo" rigenera gli RTT (con una variazione casuale) mantenendo la stessa destinazione, per mostrare che i tempi non sono mai identici a ogni esecuzione.

## Concetti didattici illustrati

- **Il campo TTL** e come un router lo decrementa, scartando il pacchetto e segnalandolo con un ICMP "Time Exceeded" quando arriva a 0.
- **L'idea alla base di traceroute**: far "morire" il pacchetto un hop più lontano a ogni tentativo per scoprire l'intero percorso, un router alla volta.
- **Perché la destinazione risponde diversamente dai router intermedi** (approfondito nel pannello dedicato): il trucco della porta UDP "sbagliata" apposta, e la differenza con l'approccio ICMP Echo di `tracert` su Windows.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — generazione degli hop (IP e RTT), dei passi dell'animazione e del diagramma dinamico

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
