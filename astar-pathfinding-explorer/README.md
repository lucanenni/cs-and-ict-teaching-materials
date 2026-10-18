# A* contro Dijkstra: una bussola aiuta

Un esploratore interattivo che esegue Dijkstra e A* sulla stessa identica griglia (stessi muri, stessa partenza, stesso arrivo) e li mostra fianco a fianco, passo dopo passo, colorando le celle che ciascuno espande. I due algoritmi trovano sempre lo stesso percorso ottimo, ma A* — guidato dalla distanza di Manhattan verso l'arrivo — ci arriva tipicamente esplorando molte meno celle.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Due griglie identiche (10×14), con muri disegnabili cliccando sulle celle (vale per entrambe, condividono la stessa mappa) e alcuni scenari pronti all'uso.
- Un'unica coppia di comandi "Avvia" / "Passo singolo" che fa avanzare **entrambi** gli algoritmi in sincronia, un'espansione per ciascuno a ogni passo: è una scelta di semplicità didattica (un solo cursore temporale condiviso, invece di due animazioni indipendenti) per rendere immediato il confronto passo per passo di quante celle ciascuno ha già esplorato in quel momento.
- Un pannello dei passaggi che racconta, per ogni passo, quale cella sta espandendo Dijkstra (con il suo costo accumulato g) e quale cella sta espandendo A* (con g, l'euristica h e il totale f = g + h).
- Un riepilogo finale con il costo totale del percorso (identico per i due algoritmi) e il conteggio delle celle espanse da ciascuno, per rendere visibile quanto A* ne risparmi.

## Scelta di design: costo uniforme, non terreni diversi

A differenza di [dijkstra-shortest-path-explorer](../dijkstra-shortest-path-explorer/), qui ogni cella attraversabile costa esattamente **1** (i muri restano invalicabili). È una scelta deliberata: l'obiettivo di questo progetto è isolare l'unica vera differenza fra Dijkstra e A* — l'uso di una euristica — senza sovrapporci anche la variabile "costo del terreno", già approfondita altrove nella raccolta. Con il costo uniforme, Dijkstra e A* condividono riga per riga lo stesso codice di ricerca (`runSearch` in [script.js](script.js)): Dijkstra lo chiama con euristica sempre a zero, A* con l'euristica della distanza di Manhattan. Essendo letteralmente la stessa funzione, si vede con chiarezza che la sola differenza possibile è l'ordine di espansione delle celle — non un algoritmo "diverso" o più furbo in altro modo.

## Concetti didattici illustrati

- **Euristica ammissibile**: una stima h(n) del costo rimanente che non lo sovrastima mai. La distanza di Manhattan su una griglia a costo 1 è sempre ammissibile, perché il percorso reale (fatto di passi ortogonali, eventualmente deviati da muri) non può mai essere più corto della distanza in linea d'aria.
- **Perché l'ammissibilità garantisce l'ottimalità**: proprio perché h non esagera mai per eccesso, A* non scarta mai per errore una cella che fa parte del vero percorso migliore. Il risultato è che A* trova sempre lo stesso costo minimo di Dijkstra — semplicemente, esplorando con priorità le celle che "sembrano" più vicine al traguardo, ne visita molte di meno in direzioni che si rivelerebbero inutili.
- **Dijkstra come caso particolare di A***: con euristica sempre a zero, A* degenera esattamente in Dijkstra (nessuna informazione sulla direzione dell'arrivo, solo il costo già accumulato).

## Nota sulla correttezza

La funzione `runSearch` è stata verificata in Node (test non incluso nel progetto pubblicato) su: una griglia vuota, un labirinto con un solo varco in un muro, una destinazione completamente isolata da muri, e 50 griglie generate casualmente con muri sparsi. In tutti i casi: il costo finale calcolato da A* coincide esattamente con quello di Dijkstra (o entrambi correttamente non trovano percorso), e A* non espande mai più celle di Dijkstra — spesso nettamente meno (fino al 40-50% in meno negli scenari di prova).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica di ricerca (Dijkstra/A* condivisi) e animazione a doppia griglia

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
