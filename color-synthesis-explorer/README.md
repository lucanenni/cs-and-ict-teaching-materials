# Sintesi additiva e sottrattiva del colore

Uno strumento interattivo che mostra perché uno schermo e una stampante mescolano i colori in modi opposti: tre cerchi sovrapposti (rosso/verde/blu o ciano/magenta/giallo) con l'intensità regolabile, per vedere dal vivo come nascono i colori delle zone di sovrapposizione.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

**Sintesi additiva (luce)** — tre cerchi rosso, verde e blu su sfondo nero, come i sotto-pixel di uno schermo. Si parte dal buio e si *aggiunge* luce: più canali accendi, più ci si avvicina al bianco.

**Sintesi sottrattiva (pigmenti)** — tre cerchi ciano, magenta e giallo su sfondo bianco, come gli inchiostri di una stampante. Si parte dalla luce piena e la si *toglie* via via: più inchiostro aggiungi, più ci si avvicina al nero.

In entrambe le modalità, gli slider regolano l'intensità di ciascun canale e una legenda mostra il colore esatto (e il suo valore RGB) di ogni zona di sovrapposizione, aggiornata dal vivo.

## Concetti didattici illustrati

- **Sintesi additiva vs sottrattiva**: due modelli di colore opposti, usati rispettivamente da dispositivi che emettono luce (schermi, proiettori) e da dispositivi che la riflettono/assorbono (stampa, pittura).
- **RGB** come colori primari della luce e **CMY** come colori primari dei pigmenti — e perché sono "complementari" tra loro.
- Perché la stampa a colori usa in realtà **CMYK** (con il nero separato) invece del solo CMY.

## Nota tecnica

Le sovrapposizioni sono generate con i blend mode CSS `mix-blend-mode: screen` (sintesi additiva) e `mix-blend-mode: multiply` (sintesi sottrattiva): sono le stesse formule usate nei software di grafica per simulare rispettivamente la mescolanza di luce e di pigmenti, quindi il colore che si vede è calcolato davvero, non solo indicativo. La legenda sotto ai cerchi calcola gli stessi valori in JavaScript per mostrarli anche come numeri.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica di miscelazione dei colori, disegno dei cerchi e della legenda

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
