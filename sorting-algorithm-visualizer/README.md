# Visualizzatore di ordinamento

Guarda quattro algoritmi di ordinamento classici — bubble sort, selection sort, insertion sort, quick sort — confrontare e scambiare valori, un passo alla volta, con contatori di confronti e scambi.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un array di 16 valori casuali, rappresentati come barre.
- Un menu per scegliere tra quattro algoritmi di ordinamento, ciascuno spiegato brevemente.
- "Passo singolo" avanza di un confronto/scambio alla volta; "Avvia" esegue l'intero ordinamento in automatico, a velocità regolabile.
- Contatori dal vivo di quanti confronti e scambi sono stati fatti finora — un modo concreto per "vedere" l'efficienza (o l'inefficienza) di un algoritmo.

## Concetti didattici illustrati

- Il funzionamento di **bubble sort**, **selection sort**, **insertion sort** e **quick sort**, e le differenze pratiche tra loro.
- Il concetto di **complessità algoritmica**: perché alcuni algoritmi fanno più lavoro di altri per ottenere lo stesso risultato, misurabile qui direttamente contando confronti e scambi.
- L'idea di **divide et impera** (usata da quick sort): risolvere un problema grande dividendolo in sottoproblemi più piccoli e più semplici.

## Nota tecnica

Ogni algoritmo è eseguito per intero in anticipo, registrando ogni confronto e scambio come un "fotogramma" in una sequenza; i controlli di riproduzione si limitano a scorrere questa sequenza già calcolata. Questo evita la complessità di dover mettere in pausa un algoritmo (specialmente quick sort, che è ricorsivo) mentre è in esecuzione.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — implementazione dei quattro algoritmi e logica di riproduzione

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
