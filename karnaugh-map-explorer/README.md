# Mappe di Karnaugh

Un semplificatore booleano reale (algoritmo di Quine-McCluskey) con mappe di Karnaugh interattive da 2, 3 o 4 variabili: clicca le celle o scegli un preset e guarda l'espressione minimizzata calcolarsi dal vivo, con i raggruppamenti colorati direttamente sulla mappa.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Mappe di Karnaugh da 2, 3 o 4 variabili, con righe e colonne in vero codice di Gray, cliccabili cella per cella.
- Alcuni preset pronti (maggioranza, XOR, cifra BCD non valida, parità...) per vedere subito esempi interessanti.
- L'espressione booleana minimizzata (in forma somma di prodotti), con ogni termine colorato allo stesso modo delle celle della mappa che copre — le celle coperte da più di un termine sono disegnate a righe diagonali multicolore.

## Nota sulla correttezza

L'algoritmo di minimizzazione (Quine-McCluskey: ricerca degli implicanti primi per combinazione ripetuta, poi selezione di una copertura tramite implicanti primi essenziali) è stato verificato non contro "risposte note" ma per **equivalenza funzionale**: l'espressione prodotta viene rivalutata su ogni possibile combinazione di ingresso e confrontata con la tabella di verità originale. Questa verifica è stata eseguita in Node su **tutte** le 16 mappe possibili con 2 variabili, **tutte** le 256 mappe possibili con 3 variabili, e 4000 mappe generate casualmente con 4 variabili — nessuna discrepanza in nessun caso. La stessa identica verifica viene rieseguita dal vivo in questa pagina ogni volta che l'espressione viene calcolata (vedi `verifyEquivalence` in `script.js`), e segnalerebbe visibilmente un eventuale errore invece di mostrare un risultato sbagliato senza avvisare.

## Concetti didattici illustrati

- **Codice di Gray e adiacenza**: perché la mappa non è in ordine binario normale — così ogni cella adiacente (anche ai bordi opposti della mappa) differisce sempre per un solo bit.
- **Raggruppamenti come termini prodotto**: più grande è un gruppo di 1 adiacenti, meno variabili servono per descriverlo — un'idea visiva che l'algoritmo di Quine-McCluskey rende precisa e automatica.
- **Perché fidarsi di un algoritmo di semplificazione** (approfondito nel pannello dedicato): la differenza tra "sembra giusto" e "è stato verificato su ogni caso possibile".

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — algoritmo di Quine-McCluskey, disposizione a codice di Gray e verifica di equivalenza funzionale

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
