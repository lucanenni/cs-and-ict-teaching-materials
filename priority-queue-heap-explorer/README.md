# Coda con priorità (heap)

Un min-heap binario reale, mostrato contemporaneamente come array (come vive davvero in memoria) e come albero (per capirlo a colpo d'occhio), con inserimento e estrazione del minimo animati passo per passo.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- **Inserimento**: il nuovo valore entra in fondo all'array e "risale" (sift-up) scambiandosi col genitore finché la proprietà di heap non è di nuovo rispettata — animato passo per passo, con i confronti e gli scambi evidenziati sia sull'array sia sull'albero.
- **Estrazione del minimo**: la radice viene rimossa, l'ultimo elemento prende il suo posto e "scende" (sift-down) scambiandosi col figlio più piccolo — stessa animazione, direzione opposta.
- Le due rappresentazioni (array e albero) restano sempre sincronizzate, per collegare visivamente "dove vive" un heap in memoria con "come si ragiona" su di esso.

## Nota sulla correttezza

La logica di inserimento ed estrazione è stata verificata in Node su 500 sequenze casuali di inserimenti/estrazioni: la proprietà di heap risulta sempre valida dopo ogni operazione, e svuotare completamente lo heap con estrazioni ripetute produce sempre l'ordine perfettamente crescente atteso. La versione "tracciata" (che genera un fotogramma per ogni confronto/scambio, usata per l'animazione) è stata verificata produrre esattamente lo stesso array finale di una versione diretta, su altre 300 sequenze.

## Concetti didattici illustrati

- **Proprietà di heap**: ogni nodo ≤ ai suoi figli — una regola più debole di un ordinamento completo, ma sufficiente a garantire accesso immediato al minimo.
- **Sift-up e sift-down**: le due operazioni che, in tempo logaritmico, ripristinano la proprietà di heap dopo ogni modifica.
- **Array come rappresentazione di un albero completo** (approfondito nel pannello dedicato): perché un heap non ha bisogno di puntatori — gli indici di genitore e figli si calcolano con l'aritmetica.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia (incluso l'albero disegnato in puro CSS)
- [script.js](script.js) — motore del min-heap con generazione della traccia passo-passo

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
