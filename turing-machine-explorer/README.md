# Macchina di Turing

Un simulatore interattivo di macchina di Turing: nastro, testina, tabella di transizioni e controlli passo-passo, con tre macchine pronte all'uso (incremento unario, incremento binario, controllo di palindromia).

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Tre macchine di Turing reali, ciascuna definita dalla propria tabella di transizioni (stato + simbolo letto → simbolo scritto + direzione + nuovo stato), eseguibili passo-passo o in automatico:
  - **Incremento unario**: aggiunge un simbolo "1" al numero rappresentato in unario.
  - **Incremento binario**: calcola n+1 in binario, gestendo correttamente il riporto (compreso il caso "tutti 1" che allunga il numero, es. 111 → 1000).
  - **Palindromo binario**: accetta o rifiuta una stringa binaria a seconda che si legga uguale al contrario, marcando via via le coppie di simboli già confrontate dai due estremi verso il centro.
- Il nastro si aggiorna in tempo reale, con la testina sempre visibile al centro della finestra scorrevole.
- La tabella delle transizioni evidenzia dal vivo la regola che sta per essere applicata al passo successivo.
- La macchina si ferma da sola quando non esiste nessuna regola per lo stato e il simbolo correnti — è così che "sa" di aver finito.

## Nota sulla correttezza

Tutte e tre le macchine sono state verificate esaustivamente al di fuori del browser prima di essere inserite in questa pagina: l'incremento unario e quello binario su tutti i numeri da 0 a 40, il controllo di palindromia su tutte le 1023 stringhe binarie possibili fino a 9 caratteri di lunghezza — nessun errore in nessuno dei tre casi.

## Concetti didattici illustrati

- **Il modello di macchina di Turing**: nastro, testina, stati, tabella di transizioni — il modello formale con cui Alan Turing (1936) definì cosa significhi "calcolabile", anni prima che esistesse un computer elettronico.
- **Determinismo passo-passo**: ogni configurazione (stato, posizione, contenuto del nastro) determina univocamente la successiva.
- **Fermarsi vs non fermarsi**: la macchina si arresta quando non trova una regola applicabile — la base intuitiva del problema della fermata, approfondito nel pannello dedicato.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — motore generico della macchina di Turing e le tre tabelle di transizione

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
