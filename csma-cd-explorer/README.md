# Ethernet e CSMA/CD

Un esploratore interattivo di CSMA/CD (Carrier Sense Multiple Access with Collision Detection): 3-4 dispositivi condividono lo stesso cavo Ethernet e devono accorgersi — mentre sta succedendo — quando due di loro trasmettono quasi nello stesso istante.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un cavo Ethernet condiviso (bus), disegnato in orizzontale, con 4 dispositivi agganciati sopra a diverse posizioni lungo il cavo.
- Una simulazione passo-passo (play/pausa/passo singolo) a tick discreti: ogni dispositivo con dati pronti ascolta il cavo (carrier sense) e, se lo sente libero, inizia a trasmettere continuando ad ascoltare mentre lo fa.
- Il **tempo di propagazione**: il segnale viaggia sul cavo a velocità finita (proporzionale alla distanza tra i dispositivi). Lo scenario di default seleziona i due dispositivi più lontani sul cavo apposta per garantire che uno inizi a trasmettere prima che il segnale dell'altro lo raggiunga fisicamente — nessuno dei due sa ancora dell'altro.
- Quando i due segnali si incrociano sul cavo, **entrambi** i dispositivi coinvolti rilevano la distorsione **mentre stanno ancora trasmettendo** (si vede il cavo colorarsi di rosso e la trasmissione interrompersi a metà), inviano un breve segnale di **jam** e scelgono un **backoff esponenziale casuale** — la finestra massima raddoppia a ogni tentativo andato male — prima di ritentare.
- Si può scegliere quali dispositivi hanno dati pronti con le caselle in alto, e generare un nuovo scenario casuale con l'apposito bottone.

## Concetti didattici illustrati

- **Carrier sense**: ascoltare il mezzo condiviso prima di trasmettere.
- **Tempo di propagazione**: perché due dispositivi lontani sullo stesso cavo possono entrambi sentirlo "libero" e trasmettere quasi insieme, senza che nessuno dei due stia sbagliando.
- **Collision Detection**: come un dispositivo half-duplex via cavo può accorgersi della collisione mentre trasmette, ascoltando il proprio segnale distorto — a differenza di una radio Wi-Fi, che durante la trasmissione non riesce a sentire nulla d'altro sul canale (approfondito nel pannello di confronto in pagina).
- **Jam signal e backoff esponenziale binario**: come i due dispositivi coinvolti si avvisano a vicenda e si "distanziano" nel tempo prima di ritentare, raddoppiando la finestra di attesa a ogni collisione.
- **Full-duplex moderno** (approfondimento): perché gli switch Ethernet full-duplex, con un collegamento dedicato per ogni dispositivo, hanno reso CSMA/CD quasi obsoleto.

## Nota sulla correttezza

La funzione `buildScenario` è stata verificata a parte in Node su: un dispositivo singolo (nessuna collisione, successo diretto); i due dispositivi più lontani sul cavo (collisione rilevata da entrambi i lati, esattamente a metà trasmissione, a tick diversi perché il segnale deve viaggiare fisicamente e i due non partono nello stesso istante — rilevata a tick 6 e 7 su un caso calcolato a mano); e 300 combinazioni casuali di 1-4 dispositivi (nessun ciclo infinito, tutti riescono infine a trasmettere).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica della simulazione e animazione del cavo

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
