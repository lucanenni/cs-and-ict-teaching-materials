# Sessioni, cookie e token

Uno strumento interattivo che mostra come un sito "si ricorda" che hai fatto login — dato che ogni richiesta HTTP è, di per sé, senza memoria di quelle precedenti — confrontando due approcci reali: sessioni con cookie e token firmati (stile JWT).

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

**Sessione con cookie**
- Il "login" crea una riga nella tabella delle sessioni del server (un ID casuale → nome utente) e dà quell'ID al browser come cookie.
- Modifica il cookie a mano e prova a inviarlo: senza una voce corrispondente nella tabella del server, la richiesta viene rifiutata — un ID di sessione non significa nulla da solo.
- Il logout cancella la riga dal server: il vecchio cookie, anche se ancora presente nel browser, smette immediatamente di funzionare.

**Token firmato (JWT-style)**
- Il "login" genera un vero token in tre parti (intestazione, contenuto, firma), con una firma **HMAC-SHA256 reale** calcolata con la Web Crypto API — non simulata.
- Il contenuto è leggibile da chiunque (solo codificato, non cifrato): prova a "manomettere" il ruolo nel token e osserva che la firma resta quella vecchia, perché solo il server conosce il segreto necessario per calcolarne una nuova che corrisponda — la verifica lo scopre subito.

## Concetti didattici illustrati

- **Statelessness di HTTP**: perché serve un meccanismo esplicito per "ricordare" un login tra una richiesta e l'altra.
- **Stato lato server vs stato lato client**: due filosofie opposte per risolvere lo stesso problema, con compromessi diversi (approfonditi nel pannello dedicato).
- **Autenticità tramite firma, non segretezza tramite cifratura**: un token firmato non nasconde il proprio contenuto, garantisce solo che non sia stato alterato da chi non conosce il segreto.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — tabella delle sessioni simulata, generazione e verifica di token firmati con HMAC-SHA256 reale (Web Crypto API)

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
