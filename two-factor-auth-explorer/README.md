# Autenticazione a due fattori

Uno strumento interattivo con un **vero generatore TOTP** (Time-based One-Time Password) — lo stesso algoritmo usato da Google Authenticator e app simili, calcolato dal vero nel browser con HMAC-SHA1, non simulato.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un segreto casuale (mostrato in Base32, come farebbe una vera app di autenticazione) genera un codice a 6 cifre che cambia ogni 30 secondi, con una barra che mostra il tempo rimanente.
- Un finto modulo di login mostra la differenza pratica: accedere con la sola password fallisce sempre; serve anche il codice attuale, corretto e non scaduto.
- Le tre categorie classiche di fattori di autenticazione (qualcosa che sai / hai / sei) sono spiegate a confronto, con link agli altri progetti di sicurezza della raccolta.

## Concetti didattici illustrati

- **TOTP (RFC 6238)**: come un sito e un'app possano calcolare in modo indipendente lo stesso codice, senza mai comunicare in tempo reale, combinando un segreto condiviso con l'ora corrente tramite HMAC.
- **Perché un secondo fattore aiuta**: una password rubata da sola non basta più.
- **I limiti del secondo fattore**: il pannello di approfondimento spiega il phishing in tempo reale e perché le passkey (basate su crittografia a chiave pubblica, vedi [public-key-cryptography-explorer](../public-key-cryptography-explorer/)) sono più resistenti.

## Verifica dell'implementazione

L'algoritmo HOTP/TOTP di [script.js](script.js) è stato verificato contro il vettore di test ufficiale RFC 6238 (Appendice B, SHA-1): con il segreto ASCII `12345678901234567890` e contatore 1, produce l'OTP a 8 cifre `94287082`, esattamente come specificato — prima di adattarlo alla versione a 6 cifre usata nell'interfaccia.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — generazione del segreto, algoritmo TOTP (HMAC-SHA1 via Web Crypto API) e logica del login simulato

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
