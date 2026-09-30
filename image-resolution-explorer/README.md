# Risoluzione di un'immagine

Uno strumento interattivo che riduce una scena generata al volo alle risoluzioni e profondità di colore delle vecchie schede grafiche dei PC (CGA, EGA, VGA), con una vera riduzione algoritmica di pixel e colori, non un filtro decorativo.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Una scena generata proceduralmente (cielo, sole, montagne, punti colorati) a 800×600, "Originale".
- Cinque livelli di riduzione: SVGA (640×480, colore invariato — solo risoluzione ridotta), VGA "Mode 13h" (320×200, 256 colori ottenuti per quantizzazione reale a 3-3-2 bit), EGA (320×200, 16 colori mappati sulla palette EGA/IBM standard) e CGA (320×200, 4 colori — la palette 1 ad alta intensità: nero, ciano chiaro, magenta chiaro, bianco).
- Ogni pixel viene davvero ridisegnato al colore più vicino disponibile nella palette di destinazione (distanza euclidea in RGB), non semplicemente sfocato o scurito.

## Concetti didattici illustrati

- **Risoluzione**: il numero di pixel usati per rappresentare un'immagine, indipendente dalla profondità di colore.
- **Profondità di colore e palette**: come un numero limitato di colori disponibili costringe ogni pixel al colore più vicino tra quelli permessi.
- **Compromessi storici hardware**: perché le vecchie schede grafiche sceglievano combinazioni specifiche di risoluzione e colori, vincolate dalla memoria video disponibile.

## Nota sui dati

Le palette EGA (16 colori) e CGA (4 colori, palette 1 alta intensità) riprodotte sono gli standard IBM ampiamente documentati. La modalità VGA a 256 colori non riproduce la palette di default storica esatta (mai stata un singolo standard universale) ma applica una vera quantizzazione algoritmica a 256 colori (3 bit rosso, 3 bit verde, 2 bit blu), lo stesso principio usato realmente per ridurre la profondità di colore.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — generazione della scena, ridimensionamento e quantizzazione del colore per ciascun preset

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
