# N Regine con backtracking

Un esploratore interattivo del classico problema delle N regine: piazzare N regine su una scacchiera N×N in modo che nessuna ne attacchi un'altra, procedendo riga per riga e tornando indietro (backtracking) ogni volta che una riga non ha più colonne libere.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Una scacchiera N×N, con N scelto tra 4, 5 e 6. N resta volutamente piccolo: con N più grande l'albero delle scelte e dei backtrack diventa troppo profondo per seguirlo passo-passo con un senso didattico (il numero di tentativi cresce molto in fretta).
- L'algoritmo procede riga per riga: per la riga corrente cerca la prima colonna libera (non attaccata da nessuna regina già piazzata in una riga precedente: stessa colonna, o una delle due diagonali). Se la trova, piazza la regina e passa alla riga successiva; se nessuna colonna funziona, fa **backtrack**, rimuovendo la regina della riga precedente e riprovando dalla colonna successiva lì.
- Passo-passo ("Avvia"/"Passo singolo"): ogni passo evidenzia la cella in esame, le celle della riga corrente che sono sotto attacco (stessa colonna o diagonale di una regina già piazzata) e, quando avviene, il momento esplicito del backtrack, con un messaggio dedicato nel pannello dei passi.
- L'esecuzione si ferma alla prima soluzione valida trovata (non enumera tutte le soluzioni possibili) e mostra la scacchiera finale con tutte le regine piazzate senza conflitti.
- Due contatori: i tentativi di piazzamento totali e il numero di backtrack effettuati.

## Concetti didattici illustrati

- **Backtracking**: provare una scelta, proseguire come se fosse quella giusta e, se si arriva a un vicolo cieco, tornare indietro e tentare un'alternativa — invece di generare in anticipo tutte le disposizioni possibili e scartare poi quelle non valide.
- **Perché è l'approccio naturale qui**: per le N regine non esiste una formula diretta che dia subito la soluzione; i vincoli (nessun attacco) vengono controllati man mano che la soluzione si costruisce, scartando una scelta non appena viola un vincolo, senza completare disposizioni che sarebbero comunque risultate invalide.
- **Il costo dei backtrack**: più backtrack servono, più la ricerca "a tentativi" è costata rispetto a trovare subito la strada giusta — il contatore dei backtrack lo rende visibile.

## Nota sulla correttezza

La logica di piazzamento, rilevamento degli attacchi e backtracking (funzioni `computeAttackers`, `attackedColumnsForRow`, `solveNQueensTrace`, `isValidSolution` in [script.js](script.js)) è stata verificata in Node (non incluso nel progetto pubblicato) per N = 4, 5 e 6: in tutti i casi la soluzione finale trovata è stata controllata e non contiene nessuna coppia di regine che si attacca a vicenda.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia e della scacchiera
- [script.js](script.js) — logica pura del backtracking (separata e testabile in Node) più l'animazione passo-passo

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
