# Binario, decimale, esadecimale

Un convertitore interattivo tra sistemi numerici: accendi e spegni i singoli bit e guarda il numero cambiare in tempo reale in decimale, binario ed esadecimale — oppure scrivi un numero e guarda i bit accendersi da soli.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Una fila di bit accendibili (8 o 16, a scelta), ciascuno etichettato con il proprio valore posizionale (128, 64, 32...).
- I valori equivalenti in decimale, binario ed esadecimale, aggiornati ad ogni click.
- La somma posizionale esplicita ("128×1 + 64×0 + ... = 160"), per rendere visibile *perché* quella sequenza di bit vale quel numero.
- Un campo per scrivere un numero (decimale o esadecimale) e vedere i bit corrispondenti accendersi automaticamente.
- Un'interpretazione opzionale "con segno" (complemento a due), per capire come si rappresentano i numeri negativi.

## Concetti didattici illustrati

- La **notazione posizionale**: ogni sistema numerico (decimale, binario, esadecimale) è solo un modo diverso di scrivere la stessa quantità.
- Perché l'**esadecimale** è comodo per rappresentare byte in modo compatto (1 cifra esadecimale = esattamente 4 bit).
- Il **complemento a due**, la tecnica quasi universale con cui i computer rappresentano i numeri negativi, e perché permette di sommare numeri positivi e negativi con la stessa identica addizione binaria.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica di conversione tra sistemi numerici e gestione dei bit

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
