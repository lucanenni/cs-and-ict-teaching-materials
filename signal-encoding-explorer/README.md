# Codifica di segnale: NRZ vs Manchester

Un esploratore interattivo di due modi per trasformare una sequenza di bit in una forma d'onda elettrica: NRZ (Non-Return-to-Zero), semplice ma a rischio quando ci sono molti bit identici consecutivi, e Manchester, che garantisce sempre una transizione a metà di ogni bit al costo di una banda doppia.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un campo per inserire manualmente una sequenza di 12-16 bit (0 e 1), un pulsante "Applica", un pulsante che carica un esempio con un lungo tratto di bit identici consecutivi (il caso critico per il clock), e un pulsante che genera una sequenza pseudo-casuale ma deterministica.
- La forma d'onda **NRZ**: un tracciato a gradini dove ogni bit occupa un intervallo di tempo fisso, livello alto per 1 e basso per 0, senza alcuna transizione tra bit consecutivi uguali.
- La forma d'onda **Manchester**: ogni bit ha sempre una transizione esattamente a metà del proprio intervallo (convenzione usata qui: bit 1 = transizione alto→basso a metà bit, bit 0 = basso→alto).
- Un'evidenziazione visiva (area rossa) e testuale del tratto NRZ con molti bit uguali consecutivi (quando presente, da almeno 4 bit), con la spiegazione del rischio di "perdere il conto" per il destinatario.
- Un contatore di transizioni totali per entrambe le codifiche sulla stessa sequenza.

## Concetti didattici illustrati

- **Clock recovery (auto-sincronizzazione)**: perché è importante quando mittente e destinatario non condividono un filo di clock dedicato, ma solo il segnale dati — il destinatario deve dedurre da solo, guardando le transizioni, quando finisce un bit e inizia il successivo.
- **Il problema di NRZ con sequenze lunghe di bit uguali**: nessuna transizione per molti bit di fila significa nessun aggancio del clock in quel tratto, con il rischio concreto di "perdere il conto".
- **Il costo di Manchester**: garantisce sempre almeno una transizione per bit (quindi tipicamente il doppio o più rispetto a NRZ sulla stessa sequenza), ma per farlo richiede il doppio della larghezza di banda a parità di velocità utile di bit.

## Note di progettazione

- **Nessun "Avvia"/"Passo singolo"**: a differenza di altri progetti della raccolta, qui il disegno delle forme d'onda è un redraw diretto e istantaneo ogni volta che la sequenza cambia, invece di un'animazione bit per bit. Per un contenuto puramente visivo come una forma d'onda — dove l'informazione interessante è la forma intera, non la sua costruzione progressiva — un rendering diretto è più chiaro e immediato; questa scelta è esplicitamente consentita dalla specifica del progetto.
- La sequenza casuale è generata da `pseudoRandomBits(seed, length)`, un generatore lineare congruenziale che avanza il proprio seed ad ogni click: deterministico a parità di seed (utile per i test), ma produce sequenze diverse ad ogni generazione durante l'uso normale.
- `validateBits`, `nrzTransitions`, `manchesterLevels`, `manchesterTransitions`, `longestRun` e `pseudoRandomBits` sono funzioni pure (nessun accesso al DOM), esportate con `module.exports` in Node e verificate con un test automatico su diversi casi (`0000`, `1010`, `1100`, la sequenza con il lungo tratto piatto, sequenze casuali): confermano che Manchester produce sempre almeno tante transizioni quanti sono i bit, mentre NRZ può arrivare a zero transizioni su un tratto di bit identici.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica di codifica/conteggio e disegno delle forme d'onda in SVG

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
