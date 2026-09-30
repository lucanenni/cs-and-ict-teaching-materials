# Numeri in virgola mobile (IEEE 754)

Uno strumento interattivo che mostra come 32 bit riescono a rappresentare sia numeri minuscoli sia enormi — e perché, in cambio, non possono essere sempre esatti.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- I 32 bit di un numero in virgola mobile a precisione singola, divisi in segno, esponente e mantissa: accendendoli e spegnendoli a mano si vede il valore risultante in tempo reale.
- Scrivendo un numero decimale, la pagina mostra il pattern di bit più vicino disponibile — e se il numero scritto non è rappresentabile esattamente, dice chiaramente qual è la minuscola differenza.
- Casi speciali (infinito, NaN, zero, numeri denormali) riconosciuti e spiegati automaticamente in base al pattern di bit.

## Concetti didattici illustrati

- **Notazione scientifica in binario**: segno, esponente e mantissa svolgono lo stesso ruolo di segno, potenza di 10 e cifre significative nella notazione scientifica decimale.
- **Precisione finita**: perché frazioni "semplici" in decimale (come 0,1) possono essere periodiche in binario, e quindi non rappresentabili esattamente in un numero finito di bit.
- **Casi speciali**: perché servono pattern riservati per infinito e "non un numero", e cosa sono i numeri denormali.

## Nota di correttezza

Tutta la codifica e decodifica passa dal vero tipo Float32 del browser (`DataView.setFloat32`/`getFloat32`), non da una formula reimplementata a mano: i valori mostrati sono quindi garantiti conformi allo standard IEEE 754 reale, non un'approssimazione.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — conversione bit↔valore tramite DataView, calcolo della scomposizione segno/esponente/mantissa per la spiegazione

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
