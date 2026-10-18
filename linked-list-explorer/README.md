# Lista concatenata: inserire e rimuovere senza spostare nulla

Un esploratore interattivo di una lista concatenata singola, disegnata come una catena di caselle collegate da freccie, con un puntatore speciale "TESTA" verso il primo nodo. Mostra passo per passo come cambiano i puntatori durante inserimento in testa, in coda, dopo un nodo scelto, rimozione e ricerca — con particolare attenzione all'ordine in cui le freccie si staccano e si riattaccano.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- La lista parte precaricata con tre nodi (10, 20, 30) per avere subito qualcosa su cui operare.
- Cinque operazioni, scelte con i chip in alto: **Inserisci in testa**, **Inserisci in coda**, **Inserisci dopo un nodo** (il nodo di riferimento si scegli dal menu a tendina o cliccando direttamente su una casella del diagramma), **Rimuovi un nodo** (stesso meccanismo di scelta) e **Cerca un valore**.
- Ogni nodo mostra il proprio valore e, sotto, dove punta davvero il suo puntatore `next` in quel momento (es. "→ valore 20", "→ fine" o "(non collegato)" per un nodo appena creato e non ancora collegato a nulla) — così si vede esattamente quando una freccia si stacca e quando si riattacca altrove.
- **Inserimento in testa**: il nuovo nodo viene prima creato isolato, poi fatto puntare al vecchio primo nodo, e **solo alla fine** la TESTA si sposta sul nuovo nodo. L'ordine è deliberato: se la TESTA si spostasse prima che il nuovo nodo punti al vecchio primo, il resto della lista diventerebbe irraggiungibile e verrebbe perso. Nessun nodo esistente viene toccato.
- **Rimozione**: il nodo precedente a quello da rimuovere viene fatto puntare direttamente al nodo successivo a quello rimosso, scavalcandolo. Se si rimuove la testa, è la TESTA stessa a spostarsi sul nodo successivo. Gestisce anche il caso in cui si rimuove l'unico nodo della lista.
- **Ricerca**: attraversa la lista dall'inizio, un nodo alla volta, confrontando il valore fino a trovarlo o raggiungere la fine.
- "▶ Avvia"/"Passo singolo →" eseguono l'operazione scelta passo per passo; "🗑️ Svuota lista" riporta la lista a vuota per esplorare i casi limite (inserimento in testa/coda su lista vuota, ricerca su lista vuota).

## Concetti didattici illustrati

- **Inserimento e rimozione in O(1)** (quando si ha già un riferimento al punto giusto): non serve spostare nessun altro nodo, basta far puntare qualche freccia altrove.
- **L'ordine dei passi conta**: in particolare nell'inserimento in testa, collegare il nuovo nodo al resto della lista *prima* di spostare la testa è l'unico ordine che non perde dati.
- **Confronto con un array** (approfondito nel pannello dedicato): un array richiede di spostare tutti gli elementi successivi per inserire o rimuovere in mezzo (O(n)), ma accede direttamente all'N-esimo elemento (O(1)); una lista concatenata è l'opposto — inserimento/rimozione locale economica (O(1)), ma accesso all'N-esimo elemento solo attraversandola dall'inizio (O(n)) — e i suoi nodi non devono essere contigui in memoria.

## Nota sulla correttezza

Le funzioni pure `opInsertHead`, `opInsertTail`, `opInsertAfter`, `opRemove` e `opSearch` sono state verificate a parte con uno script Node (non incluso nel progetto pubblicato) su una sequenza di 8 operazioni concatenate (inserimento in testa su lista vuota, inserimento in testa su lista non vuota, inserimento in coda, inserimento dopo un nodo specifico, rimozione di un nodo intermedio, rimozione della testa, ricerca di un valore presente, ricerca di un valore assente), verificando ad ogni passo lo stato finale della lista e, nel caso dell'inserimento in testa, che il nuovo nodo punti già al vecchio primo nodo nello step intermedio in cui la testa non si è ancora spostata.

## Scelta di design

Il progetto implementa solo la lista concatenata **singola** (un puntatore `next` per nodo). La variante doppia (con puntatore anche al nodo precedente) non è stata implementata come funzionalità interattiva per restare entro lo stesso insieme di operazioni e mantenere il diagramma leggibile; è menzionata solo come approfondimento concettuale nel pannello di aiuto: una lista doppia aggiunge un puntatore `prev` a ogni nodo, che permette di attraversarla anche a ritroso e di rimuovere un nodo senza dover prima attraversare la lista per trovarne il precedente, al prezzo di un puntatore in più da mantenere coerente ad ogni operazione.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica delle operazioni sulla lista e animazione passo per passo

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
