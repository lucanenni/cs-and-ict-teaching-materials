# Memoria cache

Un simulatore reale di cache a mappatura diretta: 64 indirizzi di memoria principale, blocchi da 4, 8 linee di cache — con tre pattern di accesso che mostrano quanto conta la località dei dati.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Una cache reale a mappatura diretta: indice = (indirizzo ÷ dimensione blocco) mod numero linee, tag = indirizzo ÷ (dimensione blocco × numero linee).
- **Sequenziale**: 16 accessi consecutivi (0..15) — solo il primo accesso a ogni blocco è un miss, gli altri tre sono hit gratis. Hit rate: 75%.
- **Sparsa**: 16 accessi a indirizzi lontani tra loro — quasi nessun blocco viene mai riusato prima di essere sostituito. Hit rate: 6%.
- **In conflitto**: alternanza tra due indirizzi (0 e 32) che, pur essendo diversi, puntano alla stessa linea di cache — ogni accesso sfratta quello precedente nonostante il riuso. Hit rate: 0%, un caso di "thrashing" da miss di conflitto.

## Nota sulla correttezza

La logica di simulazione (calcolo di indice e tag, hit/miss, sostituzione del blocco) è stata verificata in Node prima di essere inserita in pagina: sequenziale → 12 hit / 4 miss (75%), sparsa → 1 hit / 15 miss (6.3%), in conflitto → 0 hit / 8 miss (0%) — valori poi ri-confermati dal vivo nel browser.

## Concetti didattici illustrati

- **Il principio di località**: i programmi tendono a riusare dati vicini nel tempo e nello spazio, ed è l'unica ragione per cui una cache funziona.
- **Blocchi, non singoli indirizzi**: un miss carica sempre l'intero blocco che contiene l'indirizzo richiesto, scommettendo che gli indirizzi vicini verranno usati presto.
- **Miss di conflitto vs miss di capacità vs miss a freddo** (approfonditi nel pannello dedicato): tre ragioni distinte per cui una cache può fallire, illustrate dal pattern "in conflitto".

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — simulatore della cache a mappatura diretta con generazione della traccia passo-passo

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
