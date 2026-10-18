# Albero AVL

Un esploratore interattivo degli alberi AVL: estende l'idea dell'albero binario di ricerca aggiungendo il ri-bilanciamento automatico dopo ogni inserimento. Permette di confrontare, con gli stessi numeri inseriti in ordine crescente, un albero che resta sempre basso e largo con uno che invece degenera in una catena lineare.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Inserimento di numeri uno alla volta, con "Passo singolo" per avanzare manualmente attraverso le fasi di ogni inserimento (inserimento BST → risalita con controllo del fattore di bilanciamento → eventuale rotazione) oppure "Inserisci" per vederle scorrere tutte in automatico.
- Il fattore di bilanciamento (altezza sinistra − altezza destra) mostrato su ogni nodo, con evidenza in rosso quando esce dall'intervallo [-1, 1].
- Le quattro rotazioni AVL (semplice sinistra, semplice destra, doppia sinistra-destra, doppia destra-sinistra), applicate automaticamente quando serve ed evidenziate nel pannello dei passaggi.
- Un pulsante "Inserisci 1, 2, 3, 4, 5" per un caso dimostrativo pronto all'uso: con il bilanciamento AVL attivo l'albero resta bilanciato (altezza 3 per 5 nodi); con la casella "Disattiva bilanciamento AVL" spuntata, lo stesso inserimento degenera in una catena lineare di altezza 5.

## Concetti didattici illustrati

- **Degenerazione di un BST "ingenuo"**: perché inserire valori già ordinati in un albero binario di ricerca senza bilanciamento produce, nel caso peggiore, una semplice lista collegata.
- **Fattore di bilanciamento e rotazioni**: come un singolo numero per nodo (la differenza tra le altezze dei due sottoalberi) basta a rilevare uno squilibrio, e come una rotazione lo corregge senza violare l'ordine del BST.
- **Complessità O(log n) garantita**: perché un albero che si ri-bilancia da solo garantisce che ricerca, inserimento e cancellazione restino logaritmici indipendentemente dall'ordine di inserimento.

## Nota sulla correttezza

La logica pura (`rotateLeft`, `rotateRight`, `updateHeight`, `balanceFactor` e la funzione d'inserimento) è stata verificata in Node (non incluso nel progetto pubblicato) su diversi casi: inserimento di 1, 2, 3 produce una radice 2 con rotazione singola; inserimento di 1, 2, 3, 4, 5 produce un albero di altezza 3 con AVL attivo contro altezza 5 (catena) con AVL disattivo; gli inserimenti 3, 1, 2 e 1, 3, 2 attivano correttamente le rotazioni doppie (LR e RL); un inserimento duplicato non modifica l'albero; infine uno stress test con 100 inserimenti casuali conferma che l'albero resta sempre bilanciato e con altezza entro il limite teorico O(log n), e che la visita in-order resta sempre ordinata.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica dell'inserimento AVL, delle rotazioni e dell'animazione a fotogrammi

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
