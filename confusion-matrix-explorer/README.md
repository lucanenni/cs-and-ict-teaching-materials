# Matrice di confusione e soglia di decisione

Un filtro anti-spam giocattolo già "addestrato": ogni email ha un punteggio di rischio, e spostando la soglia di decisione si vede in tempo reale come cambiano la matrice di confusione e le metriche di valutazione (accuratezza, precisione, richiamo).

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- 50 email simulate, ciascuna con un punteggio di rischio (0-100) e un'etichetta reale nascosta al filtro (spam o normale) — generate in modo che spam e normali si sovrappongano parzialmente, come capita con dati reali.
- Uno slider sposta la **soglia di decisione**: le email con punteggio sopra soglia vengono marcate spam.
- La **matrice di confusione** (veri positivi, falsi positivi, veri negativi, falsi negativi) e le metriche derivate si aggiornano dal vivo mentre si sposta lo slider.
- "Nuove email" rigenera il campione, per vedere che il compromesso precisione/richiamo non dipende da un caso isolato.

## Concetti didattici illustrati

- La **matrice di confusione** come base per valutare un classificatore binario.
- **Precisione** vs **richiamo** (recall): due modi diversi di misurare "quanto è buono" un modello, che rispondono a domande diverse e vanno scelti in base a cosa costa di più sbagliare.
- Perché la sola **accuratezza** può essere fuorviante, specialmente con classi sbilanciate (approfondito nel pannello dedicato).
- L'idea che la **soglia di decisione** è un parametro che si può scegliere in base al contesto, non un dato di fatto del modello.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — generazione dei dati, calcolo della matrice di confusione e delle metriche, disegno del grafico

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
