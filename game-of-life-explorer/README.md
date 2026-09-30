# Il gioco della vita di Conway

Uno strumento interattivo con il classico automa cellulare di Conway: quattro regole semplicissime, applicate a tutte le celle di una griglia simultaneamente, bastano a generare comportamenti sorprendentemente complessi.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Una griglia toroidale (i bordi si "avvolgono") su cui si applicano le classiche regole del gioco della vita.
- Pattern predefiniti: l'aliante (glider, si muove diagonalmente), lampeggiatore e rospo (oscillatori a periodo 2), faro (oscillatore a periodo 2), pulsar (oscillatore a periodo 3), e il cannone di alianti di Gosper, che genera un nuovo aliante ogni 30 generazioni all'infinito.
- Clicca sulle celle per accenderle o spegnerle a mano e componi i tuoi pattern.

## Concetti didattici illustrati

- **Automi cellulari**: sistemi in cui regole locali semplicissime, applicate uniformemente, producono comportamento globale complesso.
- **Emergenza**: nessuna cella "decide" nulla di più complesso della propria sopravvivenza — la complessità nasce dall'interazione, non da regole complicate.
- **Turing completezza**: perché questo semplice gioco è, in linea di principio, capace di calcolare qualunque cosa un computer generico possa calcolare (approfondito nel pannello dedicato).

## Verifica dei pattern

Tutti i pattern sono stati verificati calcolando le generazioni in Node prima di essere usati: lampeggiatore e aliante confrontati passo-passo con il comportamento atteso; rospo, faro e pulsar verificati per tornare esattamente allo stato di partenza dopo il loro periodo noto (rispettivamente 2, 2 e 3 generazioni — il pulsar è risultato avere esattamente 48 celle vive, il numero noto per questo pattern); il cannone di Gosper verificato controllando che il numero di celle vive cresca di esattamente +5 ogni 30 generazioni, per 5 intervalli consecutivi (150 generazioni in totale) — la firma numerica di un aliante emesso a ogni ciclo.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — regole del gioco della vita, pattern predefiniti e rendering su canvas

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
