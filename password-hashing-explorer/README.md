# Password hashing e salt: perché due hash uguali sono un problema

Un esploratore interattivo di cosa succede quando più account condividono la stessa password, calcolando hash SHA-256 reali nel browser con e senza salt casuale per account.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Cinque utenti di esempio, tre dei quali condividono la stessa password (`password123`), per rendere evidente il problema.
- Una tabella "senza salt": l'hash SHA-256 della sola password. Gli utenti con la stessa password ottengono un hash identico, evidenziato con lo stesso colore — esattamente il punto debole che un attaccante sfrutta con una tabella precalcolata (rainbow table) o trovando un solo hash in una fuga di dati.
- Una tabella "con salt": un salt casuale e diverso per ogni utente (mostrato in chiaro, perché è pubblico) viene concatenato alla password prima dell'hash. Anche gli utenti con la stessa password in chiaro ottengono ora hash completamente diversi, senza alcun duplicato.
- Un pulsante per rigenerare i salt casuali e vedere che gli hash cambiano di nuovo, pur restando sempre tutti diversi tra loro.

## Nota sulla scelta implementativa

Gli hash sono calcolati con SHA-256 reale, tramite `crypto.subtle.digest`, l'API nativa del browser — non una funzione hash "giocattolo" scritta a mano, per mostrare un algoritmo realmente usato nel mondo reale senza bisogno di librerie esterne. Va comunque chiarito (ed è spiegato nel pannello di approfondimento) che SHA-256 da solo non è la scelta giusta per le password reali: è troppo veloce da calcolare, il che favorisce gli attacchi a forza bruta. Per questo esistono funzioni pensate apposta per essere lente, come bcrypt, scrypt o Argon2.

## Concetti didattici illustrati

- **Hashing delle password**: perché si salva l'hash e non la password in chiaro.
- **Il problema delle rainbow table**: senza salt, password identiche producono hash identici, rendendo triviale identificare altri account con la stessa password non appena se ne scopre uno.
- **Il salt**: pubblico, diverso per ogni record, serve a rendere unico ogni hash anche a parità di password — non a rallentare il calcolo.
- **Perché il salt non basta**: approfondito nel pannello dedicato, con un rimando a bcrypt/scrypt/Argon2 come soluzione al problema della velocità di calcolo.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — calcolo degli hash (con e senza salt) e rilevazione dei duplicati

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
