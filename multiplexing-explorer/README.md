# Multiplexing: TDM vs FDM

Un esploratore interattivo delle due tecniche classiche di multiplexing: 3-4 flussi di dati condividono lo stesso canale fisico dividendosi il **tempo** (TDM) o la **frequenza** (FDM) — due filosofie opposte per lo stesso problema.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- 3 o 4 "conversazioni" colorate (scegli il numero con i bottoni in alto) che condividono lo stesso canale fisico.
- **TDM**: una timeline di 12 slot temporali, rivelati uno alla volta (passo-passo o play) e colorati secondo il flusso a cui sono assegnati in quell'istante, in un ordine fisso che si ripete ciclicamente (A, B, C, A, B, C, …). Un solo flusso alla volta occupa davvero il canale.
- **FDM**: uno spettro semplificato con una sotto-banda orizzontale per flusso; passo-passo accende le bande una alla volta, finché non sono tutte attive simultaneamente — e restano così, ciascuna confinata nella propria fetta di frequenza, per tutta la durata.
- Un riepilogo finale (quando entrambe le simulazioni sono complete) che confronta esplicitamente le due tecniche: TDM condivide dividendo nel tempo, FDM condivide dividendo nello spettro.

## Concetti didattici illustrati

- **TDM (Time-Division Multiplexing)**: slot temporali ciclici assegnati a turno; a ciascun flusso sembra di avere tutta la banda, ma solo per una piccola frazione del tempo.
- **FDM (Frequency-Division Multiplexing)**: sotto-bande di frequenza non sovrapposte, assegnate in modo permanente; tutti i flussi trasmettono insieme, ma ciascuno con solo una porzione della banda totale.
- **Commutazione di circuito vs di pacchetto** (approfondito nel pannello dedicato): perché TDM e FDM, riservando una fetta garantita a ciascun flusso, sono storicamente associate alla commutazione di circuito — in contrasto con la condivisione statistica e opportunistica, senza fette riservate in anticipo, della commutazione di pacchetto.
- **Usi reali**: TDM nei sistemi telefonici digitali (T1/E1) e in parte nel GSM; FDM nella trasmissione radio/TV tradizionale e nei vecchi sistemi via cavo analogici.

## Nota sulla correttezza

Le funzioni `buildTDMSteps` e `buildFDMSteps` sono state verificate a parte in Node: con 3 flussi il pattern TDM su 12 slot è esattamente `a,b,c,a,b,c,a,b,c,a,b,c` (ogni flusso occupa esattamente 4 slot su 12); con 4 flussi è `a,b,c,d,a,b,c,d,a,b,c,d` (ogni flusso esattamente 3 slot su 12); in entrambi i casi ogni slot ha sempre e solo un flusso assegnato. FDM attiva le bande nell'ordine dei flussi fino a un passo finale che le rende tutte attive insieme. Le frazioni di banda/tempo per flusso (1 e 1/N per TDM, 1/N e 1 per FDM) sono state verificate numericamente, incluso il caso senza alcun flusso selezionato (nessuna divisione per zero).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica delle due simulazioni (TDM e FDM) e animazione

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
