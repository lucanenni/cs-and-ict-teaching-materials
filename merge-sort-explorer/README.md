# Merge sort: divide et impera

Un esploratore interattivo del merge sort: mostra passo per passo come un array viene diviso ricorsivamente a metà finché restano singoli elementi, e poi come i pezzi ordinati vengono ricomposti unendoli a due a due fino a ottenere l'array completo ordinato.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un array di partenza fisso (modificabile con "Array di default") oppure un array casuale generato da un seed fisso: ogni click su "Nuovo array casuale" pesca il blocco successivo della stessa sequenza deterministica, così i risultati sono riproducibili anche in un test automatico.
- **Fase di divisione**: l'albero si costruisce dalla radice (l'array originale) verso le foglie, dividendo ogni volta a metà, finché ogni foglia contiene un solo elemento.
- **Fase di unione**: risalendo dall'albero, ogni nodo unisce i due sotto-array (già ordinati) dei suoi figli: a ogni passo vengono confrontati i due elementi in testa e il più piccolo viene spostato nel nuovo array, finché un lato si esaurisce e il resto dell'altro viene copiato direttamente. Il nodo mostra in tempo reale le due code residue ("Sx"/"Dx") e il risultato che si sta costruendo ("→").
- Un contatore dei confronti totali effettuati durante tutta l'esecuzione, aggiornato passo per passo.
- Controlli "Avvia" (esecuzione automatica), "Passo singolo" e "Ricomincia", tutti già funzionanti al caricamento della pagina con l'array di default.

## Concetti didattici illustrati

- **Divide et impera**: risolvere un problema grande dividendolo in sotto-problemi più piccoli e identici nella struttura, risolverli (banalmente, quando sono piccoli abbastanza) e ricomporre le soluzioni.
- **La fase di unione come motore dell'efficienza**: unire due array già ordinati richiede un solo passaggio lineare (ogni elemento viene guardato una volta), non un confronto di ogni coppia possibile.
- **Perché nasce O(n log n)**: l'albero della divisione ha log₂ n livelli (n si dimezza a ogni livello finché arriva a 1), e ricomporre tutti i pezzi a un dato livello costa in totale un lavoro proporzionale a n. "n di lavoro" per "log n livelli" dà O(n log n), molto meno degli O(n²) confronti necessari per controllare ogni coppia di elementi dell'array intero.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia e dell'albero
- [script.js](script.js) — logica pura del merge sort (separata e testabile in Node) più l'animazione passo-passo

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
