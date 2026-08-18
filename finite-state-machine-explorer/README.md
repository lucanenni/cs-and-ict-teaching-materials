# Macchina a stati finiti

Due esempi interattivi di macchina a stati finiti: un semaforo (un ciclo fisso, senza scelte) e un distributore automatico (dove le transizioni dipendono da quali monete inserisci).

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

**Semaforo** — tre stati (Rosso, Verde, Giallo) collegati in un ciclo fisso: "Passo successivo" avanza sempre nello stesso ordine, indipendentemente da qualsiasi altra cosa.

**Distributore automatico** — tre stati (In attesa, Credito parziale, Pronto), ma qui le transizioni dipendono dall'evento: inserire monete aumenta il credito e può cambiare stato, "Annulla" riporta sempre a "In attesa" restituendo il credito, e "Preleva" è disponibile solo quando lo stato è "Pronto".

## Concetti didattici illustrati

- Una **macchina a stati finiti** (FSM) come sistema che si trova sempre in uno tra un numero limitato di stati, e cambia stato solo in risposta a eventi precisi.
- La differenza tra transizioni **fisse** (il semaforo, sempre lo stesso ciclo) e transizioni **condizionate dall'evento** (il distributore, dove l'input determina il prossimo stato).
- L'idea che alcune azioni siano disponibili solo in certi stati (es. "Preleva" solo quando pronto) — un principio alla base di moltissima logica di programmazione reale (pulsanti disabilitati, form che si sbloccano, ecc.).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica dei due esempi di macchina a stati

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
