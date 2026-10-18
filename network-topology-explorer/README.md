# Topologie di rete

Un esploratore interattivo di come sono collegati fisicamente i computer di una rete: bus, stella, anello e mesh. Per ciascuna topologia si può inviare un messaggio passo-passo e vedere come viaggia, e si può simulare un guasto cliccando su un nodo o un cavo per capire quali topologie restano in piedi e quali si spezzano.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un selettore tra 4 topologie (Bus, Stella, Anello, Mesh), ciascuna disegnata come diagramma con 5 nodi (più l'hub per la stella).
- Due selettori per scegliere mittente e destinatario, e un pulsante "📨 Invia messaggio" che calcola e anima, passo-passo ("Avvia"/"Passo singolo"), come il messaggio viaggia secondo le regole della topologia scelta: broadcast sul cavo condiviso nel bus, sempre tramite l'hub nella stella, di nodo in nodo in una direzione nell'anello, lungo il percorso più breve disponibile nella mesh.
- Un meccanismo per simulare un guasto: clic su un nodo o su un collegamento del diagramma per "romperlo" (e di nuovo per ripararlo). Inviando un nuovo messaggio dopo un guasto si vede l'effetto concreto sulla topologia scelta.
- Una tabella di confronto tra costo (numero di cavi necessari) e resilienza ai guasti delle 4 topologie.

## Concetti didattici illustrati

- **Bus**: un unico cavo condiviso; il segnale va sempre in broadcast e solo il destinatario accetta il messaggio. Un guasto al cavo centrale spezza la rete in due metà isolate tra loro.
- **Stella**: ogni nodo è collegato solo all'hub centrale. Un guasto su un singolo cavo isola solo quel nodo, ma un guasto sull'hub isola *tutta* la rete: un singolo punto di rottura totale.
- **Anello**: ogni nodo è collegato solo ai due vicini, e il messaggio viaggia in una sola direzione. Un guasto in un punto qualsiasi blocca i messaggi che dovrebbero passare di lì, ma non quelli che vanno nell'altra direzione dell'anello.
- **Mesh**: molti collegamenti ridondanti permettono percorsi alternativi; la rete resiste quasi sempre a un singolo guasto, e serve un guasto multiplo ben piazzato per isolare davvero due nodi.
- **Il tradeoff costo/resilienza**: più collegamenti ridondanti costano di più (una mesh completa su *n* nodi richiede n·(n-1)/2 cavi) ma resistono meglio ai guasti.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica di instradamento per le 4 topologie e animazione passo-passo

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
