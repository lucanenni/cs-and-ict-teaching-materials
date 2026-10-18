# Coda e QoS

Un esploratore interattivo di come un router gestisce un collo di bottiglia condiviso da due tipi di traffico molto diversi — una videochiamata, sensibile al ritardo, e un download, che non se ne accorge — confrontando una semplice coda FIFO con una coda a priorità.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un singolo link in uscita (il "collo di bottiglia") che riceve pacchetti grandi e frequenti da un download e pacchetti piccoli e frequenti da una videochiamata.
- Due code identiche, mostrate fianco a fianco con gli stessi pacchetti: a sinistra una coda FIFO (primo arrivato, primo servito), a destra una coda a priorità in cui i pacchetti della videochiamata scavalcano quelli del download ancora in attesa.
- Il pulsante "📨 Invia raffica di pacchetti" inietta N pacchetti di download e M pacchetti della videochiamata (regolabili) in un breve intervallo, identici nelle due code.
- Passo-passo del processo di trasmissione — arrivo di un pacchetto, estrazione dalla coda, fine della trasmissione — con la coda e il link visualizzati in ogni istante, più una modalità automatica ("▶ Avvia") per ciascuna colonna.
- Per ogni pacchetto della videochiamata, quanto tempo ha aspettato in coda prima di essere trasmesso, con media e "jitter" (variabilità) aggiornati in tempo reale.
- Il confronto diretto mostra come, con un po' di traffico di download in coda, il ritardo della videochiamata con FIFO cresca e diventi irregolare, mentre con la coda a priorità resti basso e costante — al prezzo di un'attesa più lunga, in media, per il download.

## Concetti didattici illustrati

- **Latenza e jitter**: la latenza è quanto un pacchetto aspetta in coda; il jitter è quanto quell'attesa varia da un pacchetto all'altro — per una videochiamata il jitter irregolare spesso si sente più di un ritardo fisso.
- **I limiti del "primo arrivato, primo servito"**: perché trattare tutto il traffico allo stesso modo penalizza chi ha bisogno di risposte rapide quando in coda ci sono pacchetti grandi e non urgenti.
- **Code a priorità**: come far scavalcare in coda il traffico sensibile al ritardo senza interrompere una trasmissione già in corso (priorità non preemptive).
- **Il tradeoff della QoS**: dare priorità a un tipo di traffico non lo fa arrivare "gratis" — il traffico a bassa priorità aspetta più a lungo in media; la QoS sposta il problema, non lo elimina.

## Nota sulla correttezza

La simulazione della coda (`buildTimeline`/l'algoritmo di `simulateQueue` su cui è basata, in `script.js`) è stata verificata a parte in Node su più scenari (inclusi casi senza download e senza traffico video): il lavoro totale si conserva sempre, nessuna trasmissione si sovrappone a un'altra, l'attesa media e il jitter della videochiamata sono sempre uguali o minori con la priorità rispetto a FIFO, e l'attesa media del download è sempre uguale o maggiore con la priorità — il tradeoff atteso.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia e delle due colonne di confronto
- [script.js](script.js) — simulazione della coda (FIFO e priorità) e logica dell'animazione

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
