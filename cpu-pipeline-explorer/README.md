# Pipeline della CPU e hazard

Un esploratore interattivo della pipeline a 4 stadi (Fetch, Decode, Execute, Writeback): invece di eseguire una istruzione alla volta, una CPU con pipelining tiene più istruzioni "in volo" contemporaneamente, ciascuna in uno stadio diverso dello stesso ciclo di clock. Il progetto mostra prima la classica "scalinata" senza intoppi, poi lo stesso tipo di programma con un hazard di dati che costringe la pipeline a fermarsi per un ciclo.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Una griglia istruzioni × cicli di clock: ogni riga è una delle 5 istruzioni di un piccolo programma giocattolo, ogni colonna un ciclo di clock, ogni cella lo stadio (F/D/E/W) in cui quella istruzione si trova in quel ciclo.
- Due scenari selezionabili: **"Senza hazard"** (5 istruzioni indipendenti, nessuna dipendenza fra registri: la classica scalinata del pipelining, 8 cicli in tutto) e **"Con hazard"** (le stesse 5 istruzioni, ma la terza ha bisogno del risultato appena calcolato dalla seconda: la pipeline rileva l'hazard e inserisce una bolla, un ciclo di stallo, prima di lasciarla proseguire — 9 cicli in tutto).
- "Avvia" / "Passo singolo" fanno avanzare l'animazione un ciclo di clock alla volta, popolando la colonna corrispondente e descrivendo a parole cosa succede in quel ciclo (incluso il momento esatto in cui l'hazard viene rilevato e la bolla inserita).
- Un riepilogo sempre visibile confronta i cicli totali necessari nei due scenari, per rendere concreto il costo in prestazioni di un singolo stallo.

## Come viene rilevato (e risolto) l'hazard

Questa pipeline non ha forwarding/bypass (approfondito nel pannello "Come funziona?"): una istruzione in Decode può passare a Execute solo se, per ogni registro che le serve, l'istruzione che lo produce ha già completato la sua Writeback in un ciclo **precedente** a quello attuale. Se non è così, l'istruzione resta bloccata in Decode — e tutto ciò che la segue resta bloccato con lei — mentre lo stadio Execute riceve una bolla (un ciclo "vuoto", senza nessuna istruzione reale dentro). Nel programma con hazard, questo succede esattamente una volta: la terza istruzione aspetta un ciclo in più prima di poter leggere il registro che la seconda ha appena finito di scrivere.

## Concetti didattici illustrati

- **Pipelining e throughput**: il pipelining non rende più rapida la singola istruzione (da inizio a fine, una istruzione impiega sempre gli stessi 4 cicli, o anche qualcuno di più se incontra uno stallo) — aumenta invece il throughput, il numero di istruzioni completate per unità di tempo, perché più istruzioni procedono in parallelo in stadi diversi.
- **Hazard di dati**: cosa succede quando una istruzione dipende da un valore che un'altra, appena precedente, non ha ancora davvero calcolato — e perché va rilevato prima che causi un risultato sbagliato.
- **Stallo (bolla) come soluzione semplice**: bloccare l'istruzione dipendente (e chi la segue) finché il dato non è pronto, al costo di cicli di clock sprecati.
- **Forwarding/bypass** (approfondimento): una tecnica più sofisticata, usata nelle CPU reali, che instrada il risultato direttamente da uno stadio all'altro senza aspettare la Writeback — spiegata testualmente nel pannello di approfondimento, senza implementarla in questo progetto (che si concentra sulla tecnica più facile da spiegare, lo stallo).

## Nota sulla correttezza

La funzione `buildPipelineSchedule` è stata verificata in Node (test non incluso nel progetto pubblicato) su tre casi: 5 istruzioni indipendenti (nessuna bolla, 8 cicli — verificando anche che ogni istruzione passi per F→D→E→W in 4 cicli consecutivi), le stesse 5 istruzioni con una dipendenza fra la 2ª e la 3ª (esattamente 1 bolla al ciclo 5, 9 cicli totali, nessun hazard "a catena" sulla 5ª istruzione), e un caso minimo di 2 istruzioni con hazard immediato (1 bolla, 6 cicli invece di 5).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica della pipeline (rilevazione hazard e stallo) e animazione a griglia

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
