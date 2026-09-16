# Come un'immagine diventa pixel

Una griglia di pixel dipingibile a mano che mostra il valore RGB esatto di ogni singolo puntino colorato — per capire concretamente che un'immagine digitale è, sotto sotto, solo una lunga lista di numeri.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md). Si affianca a [color-synthesis-explorer](../color-synthesis-explorer/): lì si vede come si *mescolano* i colori, qui come si *memorizzano*.

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Una griglia di 12×12 pixel dipingibile con una tavolozza di colori predefiniti o un selettore di colore personalizzato.
- Passando il mouse (o cliccando) su un pixel se ne vede il valore esatto: coordinate, RGB e codice esadecimale.
- Un calcolo dal vivo del "peso" grezzo dell'immagine (pixel × 3 byte).
- Tre esempi pronti da caricare (cuore, faccina, scacchiera) per vedere subito immagini riconoscibili fatte solo di pixel colorati.

## Concetti didattici illustrati

- Il **pixel** come unità minima di un'immagine digitale, e la sua rappresentazione come tre numeri (R, G, B).
- La relazione tra **risoluzione** (numero di pixel) e **peso** (byte necessari a memorizzarli).
- Un'introduzione intuitiva all'idea di **compressione**: perché immagini con grandi aree uniformi (come la scacchiera) pesano, nella realtà, molto meno del calcolo "grezzo".

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — griglia di pixel, tavolozza, calcolo del peso e caricamento degli esempi

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
