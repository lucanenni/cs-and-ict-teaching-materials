# Simulazione di un neurone artificiale

Uno strumento interattivo che mostra come un singolo **neurone artificiale** prende una decisione: combina input binari (sì/no) pesati per importanza, aggiunge una soglia (bias) e applica una funzione di attivazione per produrre un output.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Tre condizioni (interruttori SÌ/NO) che rappresentano gli input del neurone, ciascuna con uno slider per regolarne il **peso** (importanza, positiva o negativa).
- Uno slider per il **bias**, la soglia che facilita o ostacola la decisione.
- Un menu per scegliere la **funzione di attivazione** (step, sigmoide, ReLU, tanh) e vedere come cambia l'output a parità di input.
- Tre **scenari** predefiniti (uscire con il meteo incerto, guardare un film, studiare per l'esame) che cambiano condizioni, pesi e bias per contestualizzare l'esempio.
- Una visualizzazione grafica in tempo reale (canvas) con input, connessioni pesate, neurone e output, più la formula del calcolo (`z = w1·x1 + w2·x2 + w3·x3 + b`) e il risultato dell'attivazione.

## Concetti didattici illustrati

- Struttura di base di un **neurone artificiale**: input, pesi, somma pesata, bias, funzione di attivazione.
- Il **peso** come misura di quanto un singolo input influenza la decisione (e come un peso negativo possa "contrastare" un input attivo).
- Il **bias** come soglia che rende la decisione più o meno facile indipendentemente dagli input.
- Differenze pratiche tra funzioni di attivazione comuni (decisione netta con step, probabilità con sigmoide, ecc.).
- Idea che una singola unità di calcolo, ripetuta e combinata, è il mattone base delle reti neurali.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica di calcolo del neurone e disegno della visualizzazione sul canvas

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
