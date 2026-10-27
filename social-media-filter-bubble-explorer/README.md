# Bolle di filtraggio: quando l'algoritmo ti dà sempre ragione

Un feed simulato di post su un argomento volutamente leggero ("Mare o montagna per le vacanze?") che mostra, passo dopo passo, come un semplice algoritmo di raccomandazione basato sui "mi piace" possa restringere progressivamente la varietà di punti di vista mostrati, fino a creare una bolla quasi monotematica.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un feed di 12 post fittizi, inizialmente in parti uguali (50/50) tra due fazioni neutre: chi preferisce il mare e chi preferisce la montagna per le vacanze.
- Un contatore sempre visibile "% Mare vs % Montagna" nel feed attuale, con una barra che si sposta progressivamente.
- Metti "Mi piace" ai post che preferisci: un algoritmo visibile e semplice conta i "mi piace" dati a ciascuna fazione nel round e ricalcola la proporzione del **prossimo** round, sbilanciandola sempre di più verso la fazione che hai premiato (es. 50/50 → ~70/30 → ~85/15 → quasi 95/5).
- "Passo singolo" avanza di un round alla volta (funzionante fin dal primo caricamento della pagina, senza dover prima cliccare "Avvia"); "Avvia" fa scorrere diversi round automaticamente ogni pochi secondi, lasciando il tempo di continuare a metter "mi piace" tra un round e l'altro.
- "Rimetti in equilibrio il feed" riporta tutto a un mix 50/50, azzera i contatori e permette di osservare di nuovo il fenomeno da capo — magari scegliendo stavolta di premiare l'altra fazione.

## Concetti didattici illustrati

- **Algoritmi di raccomandazione**: come un sistema molto semplice (conta i "mi piace" per categoria, mostra più di ciò che piace) possa comunque produrre un effetto di restringimento marcato dopo pochi round.
- **Echo chamber**: un ambiente informativo in cui si sente ripetere soprattutto ciò che già si pensa, finendo per rinforzarlo invece di metterlo in discussione.
- **Obiettivo di engagement vs varietà**: perché una piattaforma ottimizzata per il tempo di permanenza tende a mostrare contenuti già apprezzati, non contenuti diversi — approfondito nel pannello di aiuto.
- Un consiglio pratico: cercare attivamente, di tanto in tanto, fonti e punti di vista diversi da quelli che il proprio feed mostra di default, perché il feed da solo non lo farà mai spontaneamente.

## Nota sulla correttezza

La funzione pura `nextProportion` (che calcola la proporzione del round successivo a partire dai "mi piace" del round corrente) è stata verificata in Node, separatamente dal DOM, su diversi casi: mettere sempre "mi piace" alla stessa fazione sposta la proporzione sempre di più verso quella fazione, mai nella direzione opposta, restando sempre entro i limiti 5%-95%; mettere "mi piace" in parità (o nessun "mi piace") lascia la proporzione invariata; cambiare fazione preferita a metà sessione inverte la direzione dello spostamento.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — generazione del feed, logica dei round e dell'algoritmo di raccomandazione

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
