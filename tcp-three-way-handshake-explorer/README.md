# Handshake TCP a 3 vie

Un esploratore interattivo dell'apertura di una connessione TCP: i tre messaggi (SYN, SYN-ACK, ACK) con cui client e server si scambiano i rispettivi numeri di sequenza iniziali e si confermano a vicenda di averli ricevuti. Un approfondimento opzionale mostra anche la chiusura, che richiede invece quattro messaggi (FIN, ACK, FIN, ACK).

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Due host (Client e Server) con il proprio stato TCP (CLOSED/LISTEN → SYN_SENT/SYN_RECEIVED → ESTABLISHED), aggiornato a ogni passo.
- Un diagramma a messaggi scambiati, con freccette che indicano la direzione e un'etichetta con i campi `seq`/`ack` di ciascun messaggio.
- Controlli "▶ Avvia" (esegue i passi automaticamente), "Passo singolo →" (un messaggio alla volta) e "↺ Ricomincia".
- Un pulsante "Mostra anche la chiusura" che apre una sezione separata con lo stesso tipo di diagramma per la chiusura a 4 vie (FIN dal client, ACK dal server, FIN dal server, ACK dal client).
- I numeri di sequenza iniziali (x per il client, y per il server) sono generati con una funzione pseudo-casuale ma deterministica: restano identici a ogni caricamento della pagina, per rendere l'esempio riproducibile.

## Concetti didattici illustrati

- **Perché servono esattamente 3 messaggi**: ciascun lato deve sia comunicare il proprio numero di sequenza iniziale, sia confermare di aver ricevuto quello dell'altro. Con solo 2 messaggi il server non riceverebbe mai la conferma che il client ha visto il suo numero di sequenza (la connessione resterebbe "half-open" dal suo punto di vista).
- **Numeri di sequenza e ack**: un campo `ack=N` significa "mi aspetto il prossimo byte numerato N"; sia il SYN che il FIN "consumano" un numero di sequenza, da cui `ack = seq + 1` in entrambi i casi.
- **Apertura (3 vie) vs chiusura (4 vie)**: la chiusura richiede un messaggio in più perché una connessione TCP è bidirezionale — un lato può ancora avere dati da inviare dopo che l'altro ha già segnalato di aver finito (da cui gli stati intermedi CLOSE_WAIT e FIN_WAIT_2).
- **Trasporto vs cifratura**: questo handshake stabilisce solo la connessione di trasporto. Il TLS handshake (altro progetto di questa raccolta, [tls-handshake-explorer](../tls-handshake-explorer/)) negozia la cifratura *sopra* una connessione TCP già apertà con questi tre messaggi.

## Note di progettazione

- I numeri di sequenza iniziali derivano da `pseudoRandomSeq(seed)`, un generatore lineare congruenziale con seed fisso (7 per il client, 13 per il server): è deterministico (stesso output a ogni esecuzione, utile per i test automatici) ma produce numeri che "sembrano" scelti a caso, come accade davvero in TCP.
- Per semplicità didattica, la chiusura termina entrambi i lati direttamente in CLOSED: nella realtà il client passerebbe prima per un breve periodo in TIME_WAIT, qui omesso.
- `pseudoRandomSeq`, `buildHandshakeSteps` e `buildClosingSteps` sono funzioni pure (nessun accesso al DOM), esportate con `module.exports` quando il file viene eseguito in Node e verificate con un test automatico su: determinismo del generatore, valori di seq/ack calcolati correttamente ad ogni passo, stati finali (ESTABLISHED per l'apertura, CLOSED per la chiusura).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica dei due scenari (apertura e chiusura) e animazione del diagramma

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
