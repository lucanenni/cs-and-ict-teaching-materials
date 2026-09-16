# RLE, LZ77 e Huffman a confronto

Uno strumento interattivo che applica tre veri algoritmi di compressione senza perdita allo stesso testo, mostrando che nessuno dei tre è sempre il migliore: ciascuno sfrutta un tipo diverso di ridondanza.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- **RLE** (run-length encoding): sostituisce sequenze di caratteri identici consecutivi con "carattere × quante volte".
- **LZ77**: cerca sottostringhe già viste all'interno di una finestra scorrevole e le sostituisce con riferimenti "torna indietro di N, copiane M" — gestisce correttamente anche riferimenti che si sovrappongono a se stessi (utile per le ripetizioni di un solo carattere).
- **Huffman**: la stessa logica di [huffman-coding-explorer](../huffman-coding-explorer/), qui usata solo per il conteggio finale dei bit nel confronto.
- Una tabella riassuntiva confronta i bit totali di ciascun metodo contro una codifica a 8 bit fissi per carattere, evidenziando il migliore e il peggiore.
- Il preset "nessuno aiuta molto" mostra concretamente che RLE e LZ77 possono far **crescere** un testo senza ripetizioni sfruttabili, per via del costo fisso di ogni token.

## Concetti didattici illustrati

- **Tipi diversi di ridondanza**: ripetizioni consecutive (RLE), ripetizioni di sottostringhe più lontane (LZ77), squilibrio nella frequenza dei singoli caratteri (Huffman) — tre fenomeni statisticamente diversi.
- **Nessun compressore è universale**: un fatto dimostrabile matematicamente (principio del piccione), non solo un limite pratico di questi tre algoritmi in particolare.
- **Compressione senza perdita verificabile**: sia RLE sia LZ77 vengono anche decompressi automaticamente per confermare che il testo torna esattamente identico all'originale.

## Verifica

RLE e LZ77 sono stati testati con round-trip completi (compressione seguita da decompressione, confrontata con l'originale) su sei stringhe diverse in Node prima di essere usati, incluso il caso limite di una sequenza di 16 caratteri identici (che richiede un riferimento LZ77 sovrapposto a se stesso) — tutti i test sono risultati corretti. La pagina stessa verifica ogni decompressione dal vivo e lo segnala.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — implementazione di RLE, LZ77 (con verifica di decompressione) e conteggio dei bit Huffman

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
