# Cammino minimo (Dijkstra)

Un simulatore reale dell'algoritmo di Dijkstra su una griglia con terreni di costo diverso: dipingi erba, fango, acqua e muri, e guarda l'algoritmo espandersi ed trovare sempre il percorso di costo totale minimo — non quello con meno celle.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Una griglia 8×12 con quattro tipi di terreno dal costo diverso (erba 1, fango 3, acqua 5, muro invalicabile), dipingibili a mano.
- Una vera implementazione di Dijkstra con coda a priorità (min-heap binario): l'animazione mostra l'ordine reale con cui l'algoritmo espande le celle (il "fronte d'onda" che si allarga dal punto di partenza) e il percorso finale evidenziato, con il suo costo totale.
- Tre configurazioni pronte: griglia vuota, un fiume da aggirare, una palude di fango accanto a un muro.

## Nota sulla correttezza

L'algoritmo (coda con priorità a min-heap) è stato verificato in Node confrontando la distanza calcolata con quella di un algoritmo indipendente (rilassamento ripetuto in stile Bellman-Ford) su 300 griglie 5×5 casuali con muri e costi diversi: nessuna discrepanza. La ricostruzione del percorso finale è stata verificata separatamente su altre 300 griglie: il costo totale del percorso ricostruito coincide sempre con la distanza calcolata dall'algoritmo, e ogni passo del percorso è sempre verso una cella ortogonalmente adiacente.

## Concetti didattici illustrati

- **Coda con priorità**: la struttura dati che permette a Dijkstra di espandere sempre la cella più economica, non la più vicina in numero di passi.
- **Rilassamento**: l'operazione centrale dell'algoritmo — aggiornare la distanza conosciuta di una cella solo se si trova una strada più economica per raggiungerla.
- **Perché costo totale ≠ numero di passi** (approfondito nel pannello dedicato): in cosa Dijkstra generalizza la BFS vista in [pathfinding-visualizer](../pathfinding-visualizer/), e perché BFS da sola non basta quando i costi non sono tutti uguali.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — implementazione di Dijkstra con min-heap, generazione della traccia e ricostruzione del percorso

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
