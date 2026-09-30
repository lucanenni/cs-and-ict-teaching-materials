# Ciclo fetch-decode-execute

Un simulatore interattivo del ciclo base di ogni processore: una piccola macchina ad accumulatore (architettura di von Neumann) che esegue davvero un programma, fase per fase — fetch, decode, execute — con due programmi di esempio pronti all'uso.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Una CPU giocattolo con un accumulatore (ACC), un program counter (PC), un registro istruzione (IR) e un set minimo di istruzioni (`LDA`, `STA`, `ADD`, `SUB`, `JMP`, `JZ`, `OUT`, `HALT`).
- Una memoria unica che contiene sia le istruzioni del programma sia i dati su cui lavora (architettura di von Neumann) — visibile e aggiornata in tempo reale.
- **Somma due numeri**: un programma lineare, senza salti, per vedere fetch → decode → execute su ogni singola istruzione.
- **Conto alla rovescia (con salto)**: un programma con un vero ciclo (`SUB` + `JZ` + `JMP`), per vedere come un salto condizionato altera il flusso normale (PC che avanza di uno alla volta).

## Nota sulla correttezza

La logica di esecuzione è stata verificata in Node confrontando il risultato finale (valore dell'accumulatore, stato della memoria, output prodotto) della versione che genera la traccia passo-passo con quello di un interprete diretto dello stesso set di istruzioni, su entrambi i programmi — nessuna divergenza. Il programma "Conto alla rovescia" produce esattamente l'output `3, 2, 1` atteso.

## Concetti didattici illustrati

- **Il ciclo fetch-decode-execute**: la sequenza di tre fasi che ogni istruzione, in ogni processore reale, attraversa sempre.
- **Program Counter e flusso di controllo**: perché normalmente il PC avanza di uno, e cosa succede davvero quando un salto lo modifica direttamente.
- **Architettura di von Neumann** (approfondita nel pannello dedicato): perché istruzioni e dati condividono la stessa memoria, cosa questo rende possibile (programmi che si auto-modificano, caricamento di codice da disco) e quale rischio di sicurezza introduce.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — motore della CPU giocattolo con generazione della traccia fase-per-fase

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
