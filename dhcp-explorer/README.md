# DHCP: assegnazione automatica degli IP

Una simulazione interattiva del protocollo DHCP: guarda la trattativa a quattro messaggi (DORA — Discover, Offer, Request, Ack) con cui un dispositivo ottiene un indirizzo IP da un pool limitato, e cosa succede quando quel pool si esaurisce.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un pool di soli 5 indirizzi IP, mostrato come una fila di caselle verdi (libere) o rosse (assegnate).
- Il pulsante "Connetti un nuovo dispositivo" avvia, per un nuovo dispositivo scelto da una lista, l'animazione a passi della sequenza DORA (play/pausa/passo singolo), con un diagramma dispositivo↔server DHCP che si evidenzia a ogni messaggio.
- Una tabella dei lease che si aggiorna quando l'assegnazione va a buon fine, con MAC e IP del dispositivo e un pulsante per "disconnetterlo" (liberando di nuovo il suo indirizzo nel pool).
- Uno scenario di pool esaurito: dal sesto dispositivo in poi (senza disconnetterne prima qualcuno) il server non ha più indirizzi liberi e la sequenza si ferma dopo il DHCPDISCOVER, senza offerta.

## Concetti didattici illustrati

- **La sequenza DORA**: cosa contiene e a cosa serve ciascuno dei quattro messaggi, e perché DISCOVER e REQUEST sono entrambi in broadcast.
- **Il pool di indirizzi come risorsa limitata**: un server DHCP non crea indirizzi dal nulla — se il pool è pieno, semplicemente non può rispondere.
- **Il lease come prestito a tempo** (approfondito nel pannello dedicato): perché un indirizzo assegnato via DHCP non è permanente, e come una disconnessione (o una mancata rinnovazione) lo restituisce al pool.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — pool di indirizzi, generazione dei passi DORA e gestione della tabella dei lease

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
