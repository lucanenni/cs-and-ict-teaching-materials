# Il codice Baudot nella copertina di X&Y

Uno strumento interattivo dedicato a un vero easter egg discografico: la copertina dell'album *X&Y* dei Coldplay (2005) traduce il titolo in blocchi colorati seguendo il codice Baudot. Qui puoi costruire il tuo blocco con qualunque parola e provare a decifrarlo.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Scrivi una parola breve: ogni carattere diventa una colonna di 5 blocchi (colorato = 1, vuoto = 0), esattamente come il meccanismo usato nella copertina reale.
- Il preset "X&Y" ricostruisce l'esempio vero: X (letto dall'alto: 10111), un cambio di stato FIGS (11011), il simbolo & (01011), un cambio di stato LTRS (11111), Y (10101). Le colonne si disegnano dall'alto verso il basso nell'ordine che corrisponde a quanto riportano più fonti sulla copertina reale (vedi nota sotto) — il valore del codice Baudot stesso resta quello standard, cambia solo la direzione di lettura visiva.
- Uno switch nasconde le etichette, per provare a decifrare il codice a occhio prima di vedere la soluzione.

## Concetti didattici illustrati

- Applicazione pratica del codice Baudot già visto in [baudot-code-explorer](../baudot-code-explorer/), inclusi i cambi di stato LTRS/FIGS necessari per rappresentare simboli come "&".
- Come una **convenzione arbitraria** (blocco = 1, vuoto = 0) trasformi un'immagine in dati, e viceversa — la stessa idea alla base di ogni rappresentazione digitale.

## Nota sulla direzione di lettura

Lo standard ITA2 elenca il codice di ogni carattere come "bit1 bit2 bit3 bit4 bit5" (es. X = 11101). Più fonti che descrivono la copertina reale, però, riportano X come leggibile "10111" scorrendo la colonna dall'alto verso il basso — l'esatto codice letto in direzione opposta (11101 rovesciato è 10111). Questa pagina disegna quindi le colonne dall'alto al basso nell'ordine rovesciato, per rispecchiare quanto descritto per la copertina reale, verificato incrociando tre fonti indipendenti: [Grunge](https://www.grunge.com/258033/the-hidden-truth-behind-coldplays-x-y-album-cover/), [NME](https://www.nme.com/news/music/coldplay-506-1368729) e [Design Observer](https://designobserver.com/decoding-coldplays-xy/). Il valore del codice Baudot sottostante, e quindi la decodifica di questa pagina, restano corretti in ogni caso: cambia solo l'orientamento del disegno.

## Nota su originalità e diritti

Questa pagina **non riproduce la copertina reale** dell'album (colori, layout e title-art specifici sono opera dello studio Tappin Gofton): ricrea solo il *meccanismo* di codifica — un fatto tecnico, verificabile e di dominio pubblico — con una propria griglia e una propria palette di colori generata algoritmicamente.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — tavola ITA2 (identica a quella verificata in baudot-code-explorer), codifica e decodifica del testo

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
