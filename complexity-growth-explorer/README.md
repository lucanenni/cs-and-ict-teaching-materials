# Quanto velocemente cresce un algoritmo?

Uno strumento interattivo che confronta visivamente sei classi di complessità (notazione O grande) — da O(1) a O(2ⁿ) — mostrando quanto conta la **forma della crescita**, non solo la potenza del computer su cui gira il codice.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un grafico a scala logaritmica confronta sei curve di crescita — O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ) — ciascuna con un esempio concreto tratto da altri progetti di questa raccolta (tabelle hash, alberi binari, ordinamento, ricorsione ingenua di Fibonacci).
- Uno slider sposta un cursore lungo l'asse orizzontale (la dimensione dell'input, n): la tabella sotto il grafico mostra il numero esatto di operazioni per ciascuna classe a quel valore di n, e un tempo stimato assumendo un computer capace di un miliardo di operazioni al secondo.
- Le caselle nel pannello in alto permettono di nascondere singole curve, per confrontarne solo alcune alla volta.
- Il pannello di approfondimento mostra concretamente perché un computer più veloce aiuta pochissimo un algoritmo esponenziale, mentre aiuta molto di più un algoritmo quadratico.

## Concetti didattici illustrati

- **Notazione O grande**: uno strumento per descrivere come cresce il lavoro di un algoritmo al crescere della dimensione dell'input, indipendentemente dall'hardware su cui gira.
- **Perché serve una scala logaritmica**: senza, le curve più lente da crescere risulterebbero indistinguibili da zero appena confrontate con una crescita esponenziale.
- **L'algoritmo conta più dell'hardware**: raddoppiare la velocità del computer sposta pochissimo un problema esponenziale, ma aiuta molto di più un problema polinomiale — la vera soluzione, quando esiste, è un algoritmo con una classe di complessità migliore.
- Collegamento diretto con gli altri progetti della categoria Algoritmi e Strutture dati di questa raccolta, che illustrano ciascuna di queste classi di complessità con un esempio concreto e interattivo.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — definizione delle classi di complessità, disegno del grafico SVG a scala logaritmica e calcolo dei tempi stimati

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
