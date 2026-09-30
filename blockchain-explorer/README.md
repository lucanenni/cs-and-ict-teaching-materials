# Blockchain: una catena di hash

Uno strumento interattivo che mostra il meccanismo alla base di una blockchain — non le criptovalute, ma la struttura dati: perché concatenare blocchi tramite hash rende difficile alterare la storia senza che si noti.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser. Gli hash SHA-256 sono calcolati **davvero**, con la Web Crypto API del browser (`crypto.subtle.digest`), non simulati.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Una catena di 4 blocchi, ciascuno con dati modificabili, un nonce e l'hash del blocco precedente incluso nel proprio hash.
- Un blocco è "minato" (valido) solo se il suo hash inizia con "00": trovarlo richiede provare molti nonce diversi, uno alla volta — il pulsante "Mina" lo fa dal vivo, mostrando i tentativi.
- Modificando i dati di un blocco nel mezzo della catena, il suo hash cambia completamente (effetto valanga) e — siccome ogni blocco successivo dipende da quello — tutta la catena da quel punto in poi diventa invalida, visibile con i blocchi che diventano rossi.
- Ri-minare i blocchi invalidi, in ordine, ripara la catena.

## Concetti didattici illustrati

- **Concatenamento tramite hash**: come collegare record in modo che alterarne uno renda rilevabile qualunque manomissione a valle.
- **Proof of work**: perché richiedere un hash con una proprietà rara (qui, iniziare con "00") rende costoso (in tentativi) produrre un blocco valido, pur essendo banale da verificare una volta trovato.
- **Immutabilità pratica, non assoluta**: qui riparare la catena richiede solo pochi istanti; il pannello di approfondimento spiega perché in una vera blockchain, con migliaia di partecipanti che minano contemporaneamente, altera invece diventa proibitivo con il passare del tempo.
- Collegamento diretto con [hash-avalanche-explorer](../hash-avalanche-explorer/) (lo stesso effetto valanga che rende il meccanismo efficace).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — calcolo SHA-256 reale, logica di mining (ricerca del nonce) e propagazione delle modifiche lungo la catena

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
