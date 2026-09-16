# Scambio di chiavi Diffie-Hellman

Uno strumento interattivo che mostra come due persone possano accordarsi su un segreto condiviso comunicando **solo in chiaro**, davanti a chiunque le stia ascoltando — il problema alla base di ogni connessione sicura su internet (HTTPS incluso).

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Alice e Bob si accordano pubblicamente su un numero primo p e un generatore g, poi scelgono ciascuno un segreto (a, b) e mandano pubblicamente solo g elevato al proprio segreto, modulo p — muovendo gli slider si vede in tempo reale ogni valore, pubblico o segreto, con il calcolo esatto.
- La pagina mostra che Alice e Bob arrivano, con calcoli speculari, esattamente allo stesso segreto condiviso — pur non avendoselo mai scambiato direttamente.
- Una sezione dedicata a "Eve" (l'osservatrice che vede tutto il traffico pubblico) prova a violare lo scambio per forza bruta, tentando ogni possibile esponente uno per uno finché non trova un valore che corrisponde a quello pubblico di Alice — animato passo passo, con il numero di tentativi necessari.
- Numeri pubblici diversi (primi piccoli, per poter seguire il calcolo a mente) sono selezionabili con un pulsante, per esplorare più casi.

## Concetti didattici illustrati

- **Scambio di chiavi**: come stabilire un segreto condiviso su un canale insicuro, senza mai trasmettere il segreto stesso.
- **Funzioni unidirezionali**: l'elevamento a potenza modulare è facile da calcolare in un verso, ma calcolarne l'inverso (il **logaritmo discreto**) è computazionalmente difficile — è proprio questa asimmetria a rendere sicuro lo scambio.
- **Sicurezza per dimensione delle chiavi, non per segretezza del metodo**: con numeri piccoli Eve riesce a violarlo in pochi tentativi (lo si vede con i propri occhi); con numeri primi reali da migliaia di bit, lo stesso identico attacco richiederebbe più tempo dell'età dell'universo.
- Il "vero" meccanismo che rende sicuro lo scambio (la matematica modulare), distinto dalla popolare spiegazione a colori/vernici mescolate, qui usata solo come aiuto visivo dichiarato esplicitamente come tale.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — elevamento a potenza modulare, logica dello scambio e dell'attacco a forza bruta di Eve

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
