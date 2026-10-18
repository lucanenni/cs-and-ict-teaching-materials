# Routing a vettore di distanza

Un esploratore interattivo del routing a vettore di distanza (distance vector routing, lo stesso principio del protocollo RIP): cinque router collegati da link con costi diversi imparano, scambiandosi solo le proprie tabelle con i vicini, le strade più economiche verso tutte le altre destinazioni — senza che nessuno di loro veda mai la rete intera.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Una rete fissa di 5 router (A, B, C, D, E) collegati da link con costo diverso, disegnata come diagramma con nodi e pesi.
- Lo stato iniziale (round 0): ogni router conosce solo il costo verso i vicini direttamente collegati; tutte le altre distanze sono "infinite".
- "Passo singolo →" esegue un round dell'algoritmo di Bellman-Ford distribuito: ogni router riceve le tabelle dei vicini e aggiorna una distanza solo se passare per quel vicino costa meno di quanto sapesse già.
- "▶ Avvia" esegue i round automaticamente fino a convergenza (nessun cambiamento in un intero round), poi si ferma da solo.
- Le tabelle di routing di tutti i router, aggiornate round dopo round, con le voci appena cambiate evidenziate in giallo e il router coinvolto evidenziato anche nel diagramma.
- Un messaggio finale quando la rete converge, con il numero di round che sono davvero servite.
- La topologia è scelta apposta per mostrare un caso in cui il collegamento diretto non è il migliore: A-C costa 5 come link diretto, ma A-B-C costa solo 1+2=3; lo stesso vale per B-D (diretto 4, ma via C costa 2+1=3).

## Concetti didattici illustrati

- **Visione locale vs visione globale**: un router non ha una mappa della rete, solo ciò che i vicini gli raccontano — eppure l'informazione si propaga e converge comunque verso le strade ottime.
- **Prossimo salto (next hop)**: instradare un pacchetto richiede solo sapere "a quale vicino lo passo", non conoscere l'intero percorso fino alla destinazione.
- **Algoritmo di Bellman-Ford distribuito**: la regola di aggiornamento (`costo verso il vicino + distanza dichiarata dal vicino`) e perché, applicata round dopo round da tutti i router insieme, porta sempre a distanze corrette.
- **Convergenza non istantanea**: una scorciatoia scoperta da un router deve propagarsi un salto alla volta ai router più lontani, motivo per cui può servire più di un round.

## Nota sulla correttezza

L'algoritmo (`step`/`runToConvergence` in `script.js`) è stato verificato a parte in Node su tre topologie diverse (quella usata nel progetto, un triangolo semplice e una catena a 5 nodi): le distanze finali calcolate round dopo round coincidono sempre con quelle di un algoritmo di Dijkstra di riferimento eseguito sull'intera topologia, incluse le scorciatoie non ovvie (A→C via B, B→D via C).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia e del diagramma di rete
- [script.js](script.js) — algoritmo di distance vector e logica dell'animazione

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
