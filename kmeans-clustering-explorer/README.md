# K-means: clustering passo per passo

Un esploratore interattivo dell'algoritmo di clustering k-means: 22-30 punti sparsi in 2-3 gruppi, da raggruppare in K cluster alternando due mosse — assegnazione e aggiornamento — fino alla convergenza. Permette di ripartire con centroidi iniziali diversi per mostrare che k-means trova un minimo locale, non la soluzione migliore in assoluto.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un'area con 22-30 punti generati casualmente in 2 o 3 gruppi visivamente distinti (più un clic sull'area per aggiungerne altri a mano).
- Un selettore per K (2, 3 o 4 cluster) e centroidi iniziali scelti a caso tra i punti esistenti (inizializzazione "Forgy"), mostrati come quadrati colorati.
- "Passo singolo" esegue una delle due fasi alternate: **assegnazione** (ogni punto prende il colore del centroide più vicino) oppure **aggiornamento** (ogni centroide si sposta alla media dei punti a lui assegnati).
- "Avvia" esegue tutte le iterazioni in automatico finché i centroidi non si muovono più (convergenza) o si raggiunge un limite di sicurezza di 20 iterazioni.
- Un contatore di iterazioni complete e un messaggio di convergenza a fine corsa.
- "Ricomincia con nuovi centroidi casuali" mantiene gli stessi punti ma sceglie una nuova inizializzazione: provandolo più volte si vede che il raggruppamento finale può cambiare.

## Concetti didattici illustrati

- **Assegnazione e aggiornamento**: le due mosse alternate che, ripetute, fanno convergere k-means.
- **Convergenza**: l'algoritmo si ferma quando i centroidi si stabilizzano (spostamento massimo sotto una soglia minima), non quando "capisce" il raggruppamento giusto.
- **Minimo locale vs minimo globale**: l'inizializzazione casuale dei centroidi influenza il risultato finale; k-means migliora progressivamente a partire da dove parte, e può bloccarsi in una soluzione discreta ma non ottimale.

## Nota sulla correttezza

Le funzioni `assignPoints`, `updateCentroids` e `maxMovement` sono state verificate in Node (non incluso nel progetto pubblicato) su casi calcolabili a mano: due blob ben separati che convergono ai centroidi (0, 1) e (20, 1) in due iterazioni, un punto equidistante da due centroidi assegnato per convenzione al primo, e un centroide senza punti assegnati che resta fermo.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica di k-means e disegno su canvas

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
