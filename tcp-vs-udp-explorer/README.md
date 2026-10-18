# TCP vs UDP

Lo stesso scenario — un mittente A che invia 10 segmenti numerati a un destinatario B, con due perdite fisse nel percorso — eseguito fianco a fianco con le garanzie di TCP (numerazione, ACK, ritrasmissione) e con la semplicità di UDP (nessuna garanzia, consegna immediata di ciò che arriva).

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Due colonne indipendenti, TCP e UDP, ciascuna con i propri controlli "▶ Avvia" / "Passo singolo →" / "↺ Ricomincia": si possono far avanzare separatamente, per confrontare a proprio ritmo cosa succede passo per passo nelle due modalità (scelta di design discussa più sotto).
- Lo stesso scenario di base in entrambe: 10 segmenti, con il 3° e il 7° che si perdono nel percorso (scelti fissi, per uno scenario riproducibile e confrontabile).
- **TCP**: ogni segmento è numerato; il destinatario invia un ACK per ciascuno; se l'ACK non arriva entro un timeout simulato, il mittente ritrasmette. Tutti i segmenti arrivano, sempre nello stesso ordine in cui sono stati spediti, ma quelli persi richiedono un giro aggiuntivo (più passi totali).
- **UDP**: nessun ACK, nessuna ritrasmissione. I segmenti persi restano persi per sempre. Per rendere visibile anche il rischio del disordine, il segmento 4 impiega un percorso più lento e arriva dopo il segmento 5 (spedito dopo di lui): il destinatario lo riceve comunque subito, fuori ordine.
- Un riepilogo per ciascuna modalità (aggiornato passo per passo) con segmenti consegnati, passi impiegati e ACK scambiati — a fine scenario: **10/10** per TCP (in **24** passi, **10** ACK) contro **8/10** per UDP (in soli **11** passi, **0** ACK).

## Concetti didattici illustrati

- **Perché un file o una pagina web vogliono TCP**: serve tutto il contenuto, l'ordine conta, e un ritardo extra dovuto alle ritrasmissioni è un prezzo accettabile pur di non ricevere dati corrotti o incompleti.
- **Perché una videochiamata o un gioco online spesso preferiscono UDP**: un pacchetto audio/video vecchio, arrivato in ritardo dopo un'eventuale ritrasmissione, non serve più comunque — meglio perdere un frame e andare avanti che bloccarsi ad aspettarlo.
- **Il costo dell'affidabilità**: gli ACK di TCP sono un overhead di messaggi di controllo assente in UDP, e le ritrasmissioni aumentano i passi (il "tempo") necessari a completare la consegna.

## Note di progettazione

- **Controlli indipendenti invece di un controllo condiviso**: TCP e UDP hanno ciascuno i propri pulsanti Avvia/Passo singolo, invece di un unico controllo che avanza entrambi in parallelo. È la scelta più semplice da verificare e da capire passo per passo (si può, ad esempio, far avanzare solo UDP fino alla fine per osservare subito il disordine di arrivo, poi tornare su TCP), in coerenza con il pattern già usato in altri progetti della raccolta (es. [database-locking-explorer](../database-locking-explorer/)).
- **TCP come "stop-and-wait" semplificato**: per chiarezza didattica, il mittente qui invia un segmento e aspetta l'ACK (o il timeout) prima del prossimo, invece di usare una vera finestra scorrevole con più segmenti in viaggio contemporaneamente come il TCP reale. Il punto pedagogico (tutto arriva, in ordine, con più passi per le perdite) resta identico e più facile da seguire passo per passo.
- Le funzioni `buildTcpSteps`, `buildUdpSteps`, `deliveredSoFar` e `ackSoFar` sono pure (nessun accesso al DOM) e sono state verificate con un test Node: TCP consegna sempre i 10 segmenti in ordine stretto `[1..10]` in 24 passi con 10 ACK; UDP consegna `[1,2,5,4,6,8,9,10]` (8 segmenti, con 4 e 5 scambiati) in 11 passi senza alcun ACK.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica dei due scenari e animazione delle due colonne indipendenti

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
