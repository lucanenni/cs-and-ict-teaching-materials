# DES semplificato (S-DES)

Un'implementazione reale e verificata di S-DES (Simplified DES, Edward Schaefer 1996): la versione didattica in miniatura del Data Encryption Standard, che ne conserva la struttura — permutazioni, espansione, S-box, round Feistel — su un solo byte, per poterla seguire passo dopo passo.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un testo in chiaro di 8 bit e una chiave di 10 bit, modificabili bit per bit.
- La generazione delle due sottochiavi K1 e K2 dalla chiave originale (permutazione P10, rotazioni, permutazione di riduzione P8).
- I due round di cifratura per esteso: permutazione iniziale (IP), espansione (EP), XOR con la sottochiave, le due S-box, la permutazione P4, lo scambio dei nibble tra un round e l'altro, e la permutazione finale (IP⁻¹).
- Una modalità **Decifra** che usa esattamente lo stesso algoritmo con le sottochiavi scambiate di ordine.

## Nota sulla correttezza

L'implementazione è stata verificata bit per bit contro l'esempio numerico completo di riferimento (chiave `1101001101`, testo in chiaro `10101010` → K1 = `11011010`, K2 = `10001101`, testo cifrato `00111001`, con ogni valore intermedio di ogni passo) prima di essere inserita in questa pagina, oltre che su 2000 cicli di cifratura+decifratura con chiavi e testi casuali (la decifratura deve sempre restituire esattamente il testo di partenza).

## Concetti didattici illustrati

- **Struttura di Feistel**: solo metà del blocco viene trasformata a ogni round attraverso funzioni non invertibili (le S-box), poi ricombinata con l'altra metà tramite XOR — un design che rende l'intero round invertibile anche se le sue parti non lo sono.
- **Key schedule**: come una singola chiave genera sottochiavi diverse per round diversi, tramite permutazioni e rotazioni.
- **Simmetria cifratura/decifratura**: nei cifrari di Feistel, decifrare è identico a cifrare — cambia solo l'ordine delle sottochiavi.
- **In cosa un algoritmo reale è più complesso** (approfondito nel pannello dedicato): S-DES condivide la struttura ma non la sicurezza del vero DES (8 bit contro 64, 10 bit di chiave contro 56, 2 round contro 16).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — motore S-DES completo (key schedule, permutazioni, S-box, round Feistel) con traccia passo-passo

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
