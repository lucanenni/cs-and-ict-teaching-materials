# ARP: chi ha questo IP?

Un esploratore interattivo del protocollo ARP: guarda come un dispositivo scopre il MAC associato a un IP sulla propria rete locale — una richiesta in broadcast, una risposta di chi lo possiede — e come una cache con scadenza evita di doverlo richiedere ogni volta.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Una piccola rete locale con quattro dispositivi oltre al laptop, ciascuno con un IP e un MAC.
- L'animazione a passi (play/pausa/passo singolo) di una richiesta ARP: broadcast a tutti, risposta di un solo dispositivo, e la consegna finale del frame al MAC giusto.
- Una cache ARP che si popola e mostra quante operazioni di invio mancano alla sua scadenza: una volta scaduta, la stessa destinazione richiede una nuova richiesta ARP completa.
- Un caso speciale, una destinazione fuori dalla rete locale (`8.8.8.8`): l'ARP non punta mai a un IP lontano, ma al gateway, che si occuperà di instradare il pacchetto oltre.

## Concetti didattici illustrati

- **ARP Request/Reply**: perché la richiesta è in broadcast (non si sa ancora chi risponderà) e la risposta è in unicast (chi possiede l'IP già sa a chi rispondere).
- **La cache ARP**: perché conviene evitare di ripetere la stessa domanda a ogni pacchetto, e perché comunque scade.
- **Il ruolo del gateway per le destinazioni fuori rete** (approfondito nel pannello dedicato): perché un router non riceve mai un ARP per un IP a cui non appartiene, ma solo per il proprio, collegandosi a [network-packet-journey](../network-packet-journey/) e [ip-subnetting-explorer](../ip-subnetting-explorer/).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — dispositivi della rete, logica di risoluzione/cache e animazione

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
