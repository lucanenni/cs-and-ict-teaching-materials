# CRC e checksum

Un messaggio di 2 byte ("CS"), il suo checksum semplice e il suo CRC-8 calcolato con una vera divisione binaria modulo-2, e un simulatore di trasmissione: si può introdurre un errore nel messaggio "ricevuto" e osservare se checksum e CRC se ne accorgono — incluso un caso costruito apposta in cui il checksum fallisce ma il CRC rileva l'errore.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Il messaggio trasmesso di default: i byte `0x43` e `0x53` (i caratteri "C" ed "S"), con il relativo checksum e CRC-8 calcolati e mostrati come "bit/byte di controllo" inviati insieme ai dati.
- Un messaggio "ricevuto", inizialmente identico, i cui bit si possono flippare singolarmente cliccandoli, oppure con due pulsanti rapidi: "Introduci un errore su 1 bit" (un singolo bit flippato — rilevato da entrambe le tecniche) e "Introduci un errore 'invisibile' al checksum (2 bit)" (due bit flippati, costruito apposta per mostrare il limite del checksum).
- Due riquadri di verifica che confrontano checksum e CRC trasmessi con quelli ricalcolati sul messaggio ricevuto, segnalando con un colore (verde/rosso) se l'errore viene rilevato.
- Una divisione binaria passo-passo (con controlli "▶ Avvia" / "Passo singolo →" / "↺ Ricomincia") che mostra come si arriva al CRC-8 del messaggio ricevuto, posizione per posizione.

## Concetti didattici illustrati

- **Checksum semplice usato**: XOR di tutti i byte del messaggio. È il più semplice schema di rilevamento errori, ma ha un punto debole strutturale: se lo stesso bit (stessa posizione) si flippa in due byte diversi, i due effetti si annullano a vicenda nello XOR e il checksum risultante resta identico, nonostante il messaggio sia cambiato.
- **CRC-8 usato**: polinomio `x^8 + x^2 + x + 1` (binario `1 0000 0111`). Il messaggio, con 8 zeri di padding aggiunti in coda, viene diviso modulo 2 per questo polinomio; il resto della divisione è il CRC. Mescolando tutti i bit del messaggio in un unico calcolo, il CRC è molto più sensibile a schemi di errore come quello sopra.
- **Il caso didattico "checksum cieco, CRC no"**: flippando il bit più significativo (indice 0 e indice 8 nella stringa di bit, cioè il bit più significativo di ciascun byte) il checksum XOR resta `0b00010000` invariato in entrambi i casi (per costruzione matematica: flippare lo stesso bit in entrambi gli operandi di uno XOR non cambia il risultato), mentre il CRC-8 passa da `0xDA` a `0xE5` — rilevando l'errore che il checksum ha "lasciato passare". Questo caso è stato verificato con uno script Node dedicato prima di essere inserito nella UI.
- **Rilevare vs correggere**: sia il checksum che il CRC permettono solo di accorgersi che qualcosa non va, non di capire quale bit sia sbagliato. Il destinatario che nota una discrepanza può solo scartare il messaggio e chiedere una ritrasmissione (approfondito nel pannello: esistono codici a correzione d'errore, più costosi in termini di ridondanza, che permettono anche di riparare l'errore senza ritrasmettere).

## Note di progettazione

- Il messaggio di default ("CS") è volutamente breve (2 byte, 16 bit) per rendere leggibile sia la divisione binaria passo-passo che il confronto bit a bit.
- `bytesToBitString`, `bitStringToBytes`, `xorChecksum`, `flipBit` e `crc8Divide` sono funzioni pure (nessun accesso al DOM), esportate con `module.exports` in Node. Sono state verificate con un test Node dedicato (non incluso nel progetto pubblicato) che: (1) confronta il risultato di `crc8Divide` con un'implementazione di riferimento indipendente (registro a scorrimento CRC-8/ATM-HEC) su 6 messaggi diversi, trovando sempre lo stesso resto; (2) conferma che il flip dello stesso bit in entrambi i byte lascia invariato il checksum XOR per ogni posizione da 0 a 7, e cerca (trovandolo già alla prima posizione) un caso in cui il CRC rileva comunque la differenza.
- Il pulsante "Passo singolo" della divisione binaria funziona fin dal caricamento della pagina, prima di cliccare "Avvia", seguendo lo stesso pattern di inizializzazione (render eseguito una volta alla creazione) usato in [database-locking-explorer](../database-locking-explorer/).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica di checksum/CRC e animazione della divisione binaria

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
