# Il protocollo ALOHA

Un esploratore interattivo del più semplice protocollo di accesso a un canale condiviso mai inventato: le stazioni trasmettono senza mai ascoltare il canale prima, e se due trasmissioni si sovrappongono nel tempo, è collisione. Confronta fianco a fianco ALOHA puro e Slotted ALOHA sullo stesso identico traffico, per vedere perché dividere il tempo in slot raddoppia l'efficienza.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Due colonne affiancate, una per **ALOHA puro** e una per **Slotted ALOHA**, ciascuna con una timeline orizzontale (il tempo scorre da sinistra a destra) e 5 stazioni (A-E) che generano frame da trasmettere.
- Lo stesso identico flusso di richieste di trasmissione viene usato in entrambe le modalità, per un confronto onesto: in ALOHA puro ogni stazione trasmette nell'istante esatto in cui è pronta; in Slotted ALOHA deve aspettare l'inizio del prossimo slot discreto.
- Ogni colonna si può far scorrere passo-passo ("Passo singolo") o in automatico ("Avvia"), con le trasmissioni riuscite in verde e le collisioni (frame persi) in rosso, più un contatore live di frame tentati, riusciti ed efficienza (%).
- Un pulsante per generare un nuovo traffico casuale (sempre usato identico in entrambe le colonne) oltre alla sequenza di esempio fissa.

## Concetti didattici illustrati

- **Nessun ascolto del canale**: a differenza del CSMA, ALOHA trasmette sempre "al buio", senza controllare prima se il canale è libero — è il protocollo di accesso al mezzo più semplice possibile, storicamente il primo (rete ALOHAnet, Università delle Hawaii, anni '70).
- **La finestra di rischio**: in ALOHA puro una trasmissione rischia di collidere con qualunque altra inizi nei 2 tempi-frame circostanti; nello slotted, dovendo tutte iniziare sul confine di uno slot, la finestra si riduce a 1 solo tempo-frame.
- **Perché dimezzare la finestra raddoppia l'efficienza**: l'utilizzo massimo teorico del canale è circa il 18% per ALOHA puro e circa il 37% per Slotted ALOHA — la simulazione qui non deve convergere esattamente a questi numeri, ma lo slotted ottiene sempre un'efficienza uguale o migliore sullo stesso traffico.

## Nota sulla correttezza

Le funzioni `pureAlohaCollisions`, `assignSlots` e `slottedAlohaCollisions` sono state verificate in Node (non incluso nel progetto pubblicato) su una sequenza fissa e nota in anticipo di 6 trasmissioni: le collisioni rilevate in ALOHA puro ({A1, A2, B, C, E}, con solo D riuscito) e in Slotted ALOHA ({A2, E}, con A1/B/C/D riusciti) corrispondono esattamente a quanto calcolabile a mano dagli intervalli di sovrapposizione e dagli slot assegnati.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica di rilevamento delle collisioni per le due modalità e animazione delle due timeline

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
