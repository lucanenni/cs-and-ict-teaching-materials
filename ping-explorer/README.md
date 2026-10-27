# Il comando ping: c'è qualcuno dall'altra parte?

Un esploratore interattivo del comando `ping`: invia 4 richieste ICMP Echo Request verso una destinazione a scelta e mostra, passo per passo, se e quanto velocemente arriva una risposta. Permette di confrontare un host vicino e stabile, un host lontano ma stabile, un host raggiungibile ma instabile (con perdita di pacchetti) e un host del tutto irraggiungibile.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un diagramma con il proprio dispositivo e una destinazione selezionabile tra 4 chip: "Server scolastico", "Sito governativo", "Server lontano (altro continente)", "Host non esistente".
- Passo-passo ("Avvia" o "Passo singolo"): per ciascuna delle 4 richieste, l'invio dell'Echo Request con TTL iniziale e poi l'esito — una Echo Reply con il relativo RTT misurato, oppure una richiesta scaduta, oppure una risposta di errore "Destinazione host irraggiungibile".
- Quattro scenari diversi, con valori fissi (non casuali) pensati per essere didatticamente chiari:
  - **Server scolastico**: RTT basso e stabile (3-5 ms), nessuna perdita.
  - **Sito governativo**: RTT molto variabile (jitter alto, da 48 a 210 ms) e una richiesta persa su quattro, per simulare una connessione instabile o un server sotto carico.
  - **Server lontano (altro continente)**: RTT alto (168-190 ms) ma stabile — nessuna perdita, solo distanza fisica maggiore.
  - **Host non esistente**: tutte le 4 richieste ricevono una risposta di errore "Destinazione host irraggiungibile" da un router intermedio, invece di un timeout silenzioso.
- Statistiche finali, come il comando reale: pacchetti trasmessi, ricevuti, persi (con percentuale) e RTT minimo/medio/massimo calcolati solo sui pacchetti andati a buon fine.

## Concetti didattici illustrati

- **ICMP Echo Request/Reply**: come `ping` misura la raggiungibilità e il tempo di andata e ritorno (RTT) di un host.
- **Il vero ruolo del TTL in un ping**: evitare che un pacchetto resti bloccato per sempre in un loop di routing — non mappare il percorso (quello è compito di `traceroute`, un altro progetto di questa raccolta).
- **RTT alto non è un guasto**: la distanza fisica e il numero di router attraversati influenzano il tempo di risposta anche quando tutto funziona correttamente.
- **Richiesta scaduta vs host irraggiungibile**: un timeout (nessuna risposta, approfondito nel pannello dedicato) è diverso da un errore esplicito inviato da un router che non trova una strada verso la destinazione.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — scenari fissi, calcolo delle statistiche e animazione passo-passo

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
