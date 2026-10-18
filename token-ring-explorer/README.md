# Token passing: accesso senza collisioni

Un esploratore interattivo del token passing: un anello di 6 nodi in cui un unico gettone (token) circola sempre nello stesso senso, e solo chi lo possiede in un dato istante può trasmettere. Un meccanismo di accesso al mezzo **deterministico**, per contrasto con gli accessi a contesa come CSMA.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un anello di 6 nodi (N0–N5) con un token che li visita in sequenza, sempre nello stesso senso.
- Si scelgono con le caselle in alto quali nodi hanno un frame pronto da inviare; la destinazione di ciascuno è assegnata automaticamente (al nodo "vogliente" successivo nell'elenco, o al nodo opposto se è l'unico) e mostrata accanto alla casella.
- Simulazione passo-passo (play/pausa/passo singolo): il token circola nodo per nodo; quando raggiunge un nodo con un frame pronto, quel nodo lo trattiene, allega il frame, lo lascia viaggiare intorno all'anello finché non raggiunge il destinatario (che lo copia) e poi completa il giro di ritorno fino al mittente, come conferma di consegna — solo allora il mittente rilascia il token.
- Se un nodo diverso da quello che sta trasmettendo ha anch'esso un frame pronto, i passi "il token passa a..." lo segnalano esplicitamente come "in attesa del proprio turno": deve aspettare che il token lo raggiunga, non può mai trasmettere fuori turno.
- Il bottone "Nuovo scenario" cambia il punto di partenza del token (a parità di nodi scelti), per mostrare che l'ordine di servizio segue sempre e solo la posizione del token in quel momento, non chi ha "richiesto prima" in senso assoluto.

## Concetti didattici illustrati

- **Accesso al mezzo deterministico**: l'anello qui è la stessa forma della topologia fisica ad anello, ma il punto dell'esploratore non è il cablaggio — è il meccanismo che decide chi può trasmettere, che funzionerebbe concettualmente anche su un cablaggio diverso.
- **Niente collisioni, per costruzione**: poiché solo chi detiene il token può trasmettere, e il token è unico, due trasmissioni simultanee non possono mai verificarsi — non è una probabilità bassa come nel backoff casuale di CSMA, è un'impossibilità strutturale.
- **Il prezzo del determinismo** (approfondito nel pannello dedicato): l'overhead di dover aspettare il proprio turno anche quando il mezzo sarebbe altrimenti libero, specialmente con pochi nodi attivi su un anello grande — contro il rischio di collisione ma nessuna attesa strutturale di un accesso a contesa come ALOHA o CSMA.
- **Conferma di consegna per giro completo**: il frame continua a circolare dopo aver raggiunto il destinatario, tornando al mittente che lo rimuove dall'anello — la scelta di design adottata qui (documentata, non l'unica possibile: alcune varianti del vero IEEE 802.5 lasciano invece al destinatario il compito di rimuovere il frame).

## Nota sulla correttezza

La funzione `buildScenario` è stata verificata a parte in Node su: nessun nodo richiedente (il token circola a vuoto); un solo nodo richiedente (destinazione assegnata correttamente al nodo opposto); due nodi che si scambiano i frame (l'ordine di invio rispetta sempre e solo l'ordine in cui il token li raggiunge, non l'ordine di selezione); e 100 combinazioni casuali di nodi richiedenti e punto di partenza del token, verificando che il numero di trasmissioni effettive corrisponda sempre esattamente al numero di nodi richiedenti e che ogni trasmissione si concluda (conferma di consegna) prima che la successiva possa iniziare.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica della simulazione e animazione dell'anello

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
