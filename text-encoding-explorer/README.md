# Dal testo ai byte

Scrivi una frase e guarda, carattere per carattere, come viene tradotta in numeri: il suo code point Unicode e i byte esatti della sua codifica UTF-8 — inclusi in binario.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un campo di testo: ogni carattere scritto genera una scheda con il carattere stesso, il suo code point Unicode (es. `U+00E0`) e i byte della sua codifica UTF-8, in esadecimale e in binario.
- Un conteggio dal vivo di caratteri contro byte totali, con una nota quando i due numeri non coincidono.
- Alcuni esempi pronti ("Ciao", "Città", un emoji, caratteri giapponesi) per vedere subito il contrasto tra caratteri che occupano 1 byte e caratteri che ne occupano di più.

## Concetti didattici illustrati

- **Unicode** come standard che assegna un numero univoco (code point) a ogni carattere di ogni alfabeto/sistema di scrittura del mondo, emoji incluse.
- **UTF-8** come codifica a lunghezza variabile: da 1 a 4 byte per carattere, retrocompatibile con il vecchio ASCII.
- Perché lettere accentate, altri alfabeti ed emoji "pesano" di più, in termini di byte, delle lettere semplici dell'alfabeto latino.

## Nota tecnica

I byte mostrati sono calcolati con l'API standard del browser `TextEncoder`, non con un'implementazione fatta a mano: sono quindi la codifica UTF-8 reale, non solo un'approssimazione didattica.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — analisi del testo carattere per carattere e calcolo della codifica

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
