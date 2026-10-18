# Rete neurale a più strati: il forward pass

Un esploratore interattivo del calcolo in avanti (forward pass) di una piccola rete neurale: 2 input, uno strato nascosto di 3 neuroni (ReLU), un neurone di output (sigmoide). Il calcolo avanza un neurone alla volta, nell'ordine corretto, mostrando la somma pesata e l'attivazione di ciascuno.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Una rete con 2 input, uno strato nascosto di 3 neuroni e un neurone di output, disegnata come grafo di nodi collegati da archi: ogni arco mostra il peso corrispondente.
- Due slider per regolare i valori di input x1 e x2.
- "Passo singolo" avanza il calcolo un neurone alla volta, nell'ordine corretto: prima i 3 neuroni dello strato nascosto (ciascuno con la propria somma pesata + bias, poi ReLU), poi il neurone di output (somma pesata degli output nascosti + bias, poi sigmoide). Il nodo appena calcolato si evidenzia con un bordo acceso e mostra il suo valore numerico.
- "Avvia" esegue tutti i calcoli in sequenza automaticamente.
- Un riepilogo testuale di ogni calcolo (formula e risultato) e il valore di output finale a fine sequenza.
- Cambiare x1 o x2 azzera il calcolo e lo fa ripartire dal primo neurone nascosto.

## Scelte di progetto

- **Pesi e bias fissi**: per rendere i calcoli verificabili a mano e concentrare l'attenzione sul meccanismo del forward pass piuttosto che sulla loro regolazione. Sono documentati in `script.js` (`HIDDEN_WEIGHTS`, `OUTPUT_WEIGHTS`).
- **ReLU nello strato nascosto, sigmoide in output**: una combinazione comune nelle reti reali — ReLU è semplice ed efficiente per gli strati interni, la sigmoide è utile in output per leggere il risultato come una probabilità tra 0 e 1.

## Concetti didattici illustrati

- **Somma pesata e attivazione**: ogni neurone combina i suoi input con pesi e bias, poi applica una funzione non lineare.
- **Forward pass**: l'informazione scorre in una sola direzione, dagli input verso l'output, mai all'indietro.
- **Perché serve uno strato nascosto** (approfondito nel pannello dedicato): un solo neurone separa solo dati linearmente separabili; uno strato nascosto permette alla rete di modellare funzioni non lineari.

## Nota sulla correttezza

Il forward pass (`computeHidden`, `computeOutput`) è stato verificato in Node (non incluso nel progetto pubblicato) su tre combinazioni di input calcolate a mano, confrontando sia i valori pre-attivazione (z) che quelli post-attivazione di ogni neurone, incluso il caso in cui tutti i neuroni nascosti vengono azzerati dalla ReLU.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica del forward pass e disegno della rete su canvas

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
