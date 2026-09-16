# Monta il tuo PC

Un simulatore interattivo per montare e smontare virtualmente un computer, componente per componente, scoprendo a cosa serve ognuno — con due stili grafici selezionabili e una modalità quiz per mettersi alla prova.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

**Modalità "Monta/smonta"**
- Un case visto di lato, con gli slot vuoti tratteggiati per ogni componente (scheda madre, alimentatore, disco SSD, processore, RAM, scheda video, dissipatore).
- Cliccando su un componente nel vassoio (o sul suo slot vuoto nel case) lo si monta — se richiede un altro componente non ancora presente, un messaggio lo spiega chiaramente.
- Cliccando su un componente già montato si apre una scheda con nome, funzione e una curiosità; da lì lo si può anche smontare, a meno che altri componenti non dipendano da lui (es. non si può smontare la scheda madre finché la CPU è ancora inserita).
- Due stili grafici intercambiabili in qualsiasi momento: **Schematico** (forme piatte, un colore per componente, massima chiarezza) e **Realistico** (gradienti, ventole, tracce del circuito stampato, un aspetto più simile all'hardware vero).

**Modalità Quiz**
- 10 domande a risposta multipla, in parte testuali ("a cosa serve la CPU?") e in parte visive (viene mostrato il disegno di un componente, senza etichetta, da riconoscere).
- Punteggio finale e un messaggio diverso a seconda del risultato.

## Concetti didattici illustrati

- I componenti principali di un computer desktop e la funzione di ciascuno.
- Le **dipendenze fisiche** tra componenti (es. la CPU si monta sulla scheda madre, il dissipatore sopra la CPU) e perché un PC si monta in un ordine sensato.
- La differenza tra memoria **volatile** (RAM) e **permanente** (SSD).
- Il ruolo di CPU e GPU nel calcolo, e perché sono progettate in modo molto diverso (pochi core versatili contro molti core specializzati).

## Nota tecnica

Le sovrapposizioni e i disegni dei componenti sono generati con SVG creato dinamicamente in JavaScript, non immagini esterne. Lo stesso disegno usato nella vista del case viene riusato nelle domande visive del quiz, con le etichette di testo rimosse per non svelare subito la risposta.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — dati dei componenti, disegno SVG nei due stili, logica di montaggio/smontaggio e motore del quiz

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
