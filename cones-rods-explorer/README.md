# Pixel contro coni e bastoncelli

Uno strumento interattivo che collega la biologia della visione umana alla ragione tecnica per cui gli schermi usano tre soli colori (rosso, verde, blu) per riprodurre qualunque colore percepibile.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

**Perché bastano 3 colori**
- Sposta lo slider di una luce "pura" a una singola lunghezza d'onda e osserva quanto stimola (in modo approssimato, tramite curve gaussiane) i tre tipi di cono dell'occhio (L, M, S).
- Prova a riprodurre le stesse tre barre mescolando rosso, verde e blu: quando ci riesci, la pagina lo conferma — hai trovato un caso di **metamerismo**, la stessa base su cui funziona ogni schermo.

**Densità nella retina**
- Un grafico mostra come coni e bastoncelli sono distribuiti in modo molto diverso nella retina, e perché la visione periferica perde colore.
- Un classico esperimento interattivo per trovare il proprio punto cieco.

**Simulatore di daltonismo**
- Applica matrici di trasformazione comuni per simulare come apparirebbe la stessa immagine test mancando uno dei tre tipi di cono (protanopia, deuteranopia, tritanopia).

## Concetti didattici illustrati

- **Tricromatismo**: l'occhio umano percepisce il colore tramite solo tre tipi di recettore, non misurando la lunghezza d'onda della luce.
- **Metamerismo**: perché combinazioni di luce fisicamente diverse possono apparire identiche.
- Collegamento diretto con [pixel-art-rgb-explorer](../pixel-art-rgb-explorer/) e [color-synthesis-explorer](../color-synthesis-explorer/): il "perché" biologico dietro le tecniche già viste in quei progetti.

## Nota sui dati

Le curve di sensibilità dei coni sono approssimate con funzioni gaussiane a scopo didattico, non sono dati fisiologici precisi. Le matrici di simulazione del daltonismo sono versioni semplificate comunemente usate in strumenti divulgativi, non un modello medico accurato.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — modello semplificato di risposta dei coni, grafico di densità retinica e filtri di simulazione del daltonismo

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
