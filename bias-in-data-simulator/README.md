# Il bias nei dati

Una simulazione che mostra come un modello, allenato a imitare decisioni storiche, possa **imparare e ripetere un'ingiustizia** presente nei dati di addestramento — anche quando i due gruppi coinvolti non hanno, in realtà, nessuna differenza di merito.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- 12 coppie di candidati fittizi: in ogni coppia, un candidato di Città A e uno di Città B condividono **esattamente lo stesso punteggio** di competenza ed esperienza — nessuna differenza reale di merito, per costruzione (non per caso statistico).
- Le decisioni storiche di assunzione (su cui il modello giocattolo di questa pagina è "allenato") favorivano però la Città A a parità di punteggio: un bias del passato, arbitrario e ingiustificato.
- Un interruttore permette di attivare o disattivare l'uso della città come informazione per il modello: con l'interruttore attivo si vede un chiaro divario nel tasso di assunzione tra le due città; disattivandolo, il divario scompare.
- Un grafico a dispersione mostra ogni coppia come **un solo pallino diviso a metà** nella posizione esatta del loro merito condiviso (sinistra = Città A, destra = Città B), pieno se quel candidato è assunto dal modello, vuoto se no — così è impossibile non notare quando le due metà divergono pur partendo dallo stesso punto.

## Concetti didattici illustrati

- **Bias nei dati**: un modello impara esattamente i pattern presenti nei dati con cui viene allenato, inclusi quelli ingiusti.
- La differenza tra **correlazione presente nei dati** e **merito reale**: qui i due gruppi sono identici per costruzione, eppure i dati storici li trattano diversamente.
- **Discriminazione per proxy**: nel pannello di approfondimento si spiega perché, nel mondo reale, rimuovere un'informazione sensibile non basta sempre a eliminare il problema, se altre informazioni disponibili sono comunque correlate con essa.
- L'importanza di **verificare l'equità** (fairness) di un modello confrontando i suoi risultati tra sottogruppi, non solo la sua accuratezza complessiva.

## Nota didattica

Il caso di questa pagina è volutamente **fittizio e semplificato** (due città immaginarie, senza alcun riferimento a caratteristiche reali come genere, etnia o provenienza) proprio per poter discutere il meccanismo del bias algoritmico in classe senza toccare direttamente categorie sensibili reali. Il fenomeno che illustra — un modello che eredita e amplifica un pregiudizio presente nei propri dati di addestramento — è però ben documentato anche in casi reali (es. sistemi di selezione del personale, valutazione del credito, giustizia predittiva).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — generazione dei candidati, calcolo dei punteggi e disegno del grafico

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
