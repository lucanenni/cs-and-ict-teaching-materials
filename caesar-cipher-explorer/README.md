# Il cifrario di Cesare

Cifra e decifra messaggi a mano con uno dei cifrari più antichi della storia, poi guarda quanto è facile romperlo provando tutte le 26 combinazioni possibili in pochi secondi.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un campo di testo e uno slider per lo spostamento (shift, da 0 a 25): il testo cifrato/decifrato si aggiorna dal vivo.
- Una mappa completa dell'alfabeto che mostra a colpo d'occhio a quale lettera cifrata corrisponde ciascuna lettera in chiaro, per lo spostamento scelto.
- Una sezione "Prova a romperlo": inserito un testo cifrato, un pulsante mostra tutti e 26 i possibili tentativi di decifratura in una volta sola — la dimostrazione pratica di quanto sia debole questo tipo di cifrario.

## Concetti didattici illustrati

- Il **cifrario a sostituzione monoalfabetica**, uno dei più antichi schemi crittografici della storia.
- Il concetto di **chiave** (qui, lo spostamento) e di **spazio delle chiavi** (le 26 possibilità).
- Perché un piccolo spazio delle chiavi rende un cifrario vulnerabile ad attacchi per **forza bruta**, e perché la crittografia moderna si basa invece su spazi delle chiavi enormi.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica di cifratura/decifratura e dimostrazione a forza bruta

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
