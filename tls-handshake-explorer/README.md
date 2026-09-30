# Handshake TLS/HTTPS

Una simulazione passo-passo del vero handshake TLS 1.2 — la sequenza esatta di messaggi che client e server si scambiano prima di aprire un canale cifrato — con uno scambio di chiavi ECDHE reale, tag HMAC "Finished" reali e una vera cifratura AES-GCM finale, tutto calcolato con la Web Crypto API del browser.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- I 9 messaggi dell'handshake TLS 1.2 nel caso comune (senza autenticazione del client), come diagramma di sequenza client/server, rivelati uno alla volta: ClientHello, ServerHello, Certificate, ServerKeyExchange, ServerHelloDone, ClientKeyExchange, Finished (client), Finished (server), Application Data.
- Un vero scambio di chiavi **ECDHE** (curva P-256, Web Crypto API): due coppie di chiavi effimere generate al volo, un segreto condiviso calcolato indipendentemente da entrambe le "parti" e verificato identico byte per byte.
- Due veri tag **HMAC-SHA256** ("Finished"), calcolati con il segreto appena derivato.
- Una vera cifratura **AES-256-GCM** di un messaggio di esempio, decifrata correttamente dal lato server con lo stesso segreto condiviso.

## Nota sulla correttezza

La sequenza esatta dei messaggi segue [RFC 5246](https://datatracker.ietf.org/doc/html/rfc5246) §7.3 ("Basic Handshake"), verificata direttamente sul testo della RFC prima di essere implementata. Tutta la crittografia (ECDHE, HMAC, AES-GCM) è calcolata realmente dalla Web Crypto API del browser, non simulata: verificato dal vivo che il segreto condiviso calcolato dal client e quello calcolato dal server coincidano esattamente, che i due tag "Finished" siano identici, e che il testo cifrato con AES-GCM si decifri correttamente restituendo il messaggio originale.

## Concetti didattici illustrati

- **La sequenza reale di un handshake TLS**: chi invia cosa, in che ordine, e perché.
- **Scambio di chiavi effimero (ECDHE) e Perfect Forward Secrecy** (approfondito nel pannello dedicato): perché usare una coppia di chiavi nuova ad ogni connessione, invece della chiave fissa del certificato, protegge le conversazioni passate anche se una chiave viene rubata in futuro.
- **Autenticità tramite "Finished"**: come un hash cifrato dell'intera conversazione fin lì garantisce che nessuno l'abbia alterata lungo la strada.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia (diagramma di sequenza in puro CSS)
- [script.js](script.js) — sequenza dei messaggi, scambio ECDHE, HMAC "Finished" e cifratura AES-GCM reali (Web Crypto API)

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
