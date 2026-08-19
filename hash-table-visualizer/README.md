# Tabella hash e collisioni

Uno strumento interattivo che mostra come una **tabella hash** permette di trovare un dato "in un colpo solo" nella maggior parte dei casi, e cosa succede davvero — le **collisioni** — quando due chiavi diverse finiscono nello stesso posto.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Scegli il numero di bucket (contenitori) della tabella, poi inserisci parole: la pagina mostra il calcolo esatto della funzione hash (somma dei codici delle lettere, resto della divisione per il numero di bucket) e in quale bucket la parola finisce.
- Quando due parole diverse producono lo stesso hash, finiscono nello stesso bucket in una **catena**: cercarle richiede di confrontarle una per una all'interno di quella catena, invece del solito confronto "in un colpo solo".
- La modalità "Cerca" mostra passo passo il percorso seguito: calcolo dell'hash, salto diretto al bucket giusto, e — solo se necessario — lo scorrimento della catena confrontando le chiavi una a una.
- Un chip "ROMA, AMOR, MORA, RAMO" mostra un caso limite reale: quattro anagrammi (stesse lettere, ordine diverso) producono sempre lo stesso hash con questa funzione, qualunque sia la dimensione della tabella — un esempio concreto dei limiti di una funzione hash troppo semplice.
- Le statistiche mostrano il **fattore di carico** (chiavi ÷ bucket) e quanti bucket hanno più di una chiave, per collegare visivamente "tabella più piena" a "più probabilità di collisioni".

## Concetti didattici illustrati

- **Funzione hash**: trasformare una chiave arbitraria in un numero (e quindi in una posizione) in modo deterministico e veloce da calcolare.
- **Complessità O(1) "in media"**: perché cercare in una tabella hash è, nella maggior parte dei casi, molto più veloce di scorrere una lista — e perché quella velocità dipende dalla qualità della funzione hash e da quanto la tabella è piena.
- **Collisioni e resolution by chaining**: una delle strategie più semplici per gestire il caso in cui due chiavi condividano lo stesso hash.
- **Limiti di una funzione hash debole**: il caso degli anagrammi mostra concretamente perché servono funzioni hash progettate per distribuire bene anche input molto simili (vedi anche [hash-avalanche-explorer](../hash-avalanche-explorer/) in questa raccolta, che mostra una funzione hash vera, crittografica).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — funzione hash, gestione dei bucket con concatenamento, ricerca animata e disegno dell'interfaccia

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
