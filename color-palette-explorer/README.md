# Palette di colori

Uno strumento interattivo per costruire combinazioni di colori armoniose (teoria del colore) e verificarne oggettivamente la leggibilità con un vero calcolo del rapporto di contrasto WCAG.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Scegli una tonalità, saturazione e luminosità di base, poi genera una palette secondo cinque schemi classici: complementare, analoghi, triade, tetrade, monocromatica.
- La sezione "Verifica di contrasto" calcola il vero rapporto di contrasto WCAG tra due colori qualsiasi (dalla palette, o bianco/nero), mostrando se superano le soglie ufficiali AA/AAA per testo normale e testo grande.
- Prova a confrontare due colori complementari (stessa luminosità, tonalità opposte): il contrasto può risultare bassissimo, nonostante le tinte sembrino "opposte" — un promemoria che armonia estetica e leggibilità sono due cose diverse.

## Concetti didattici illustrati

- **Ruota dei colori e schemi armonici**: come costruire combinazioni bilanciate ruotando la tonalità di un angolo fisso.
- **Rapporto di contrasto WCAG**: calcolato secondo la formula ufficiale (luminanza relativa da sRGB, poi rapporto tra la più chiara e la più scura), non stimato a occhio.
- **Accessibilità come requisito oggettivo**: due colori possono essere in perfetta armonia cromatica e allo stesso tempo illeggibili insieme.

## Verifica dei calcoli

La formula di luminanza relativa e contrasto è stata verificata contro due valori di riferimento noti: nero su bianco dà esattamente 21:1 (il massimo teorico), e il grigio `#767676` su bianco dà circa 4.54:1 — il grigio "di confine" comunemente citato come il più chiaro che supera ancora, per un pelo, la soglia AA di 4.5:1 per testo normale.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — conversione HSL→RGB→hex, generazione degli schemi armonici e calcolo del contrasto WCAG

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
