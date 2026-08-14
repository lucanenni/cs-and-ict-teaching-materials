# Somiglianza tra parole

Uno strumento interattivo che mostra il concetto di **embedding**: perché i modelli linguistici rappresentano le parole come punti in uno spazio matematico, dove le parole con significato simile finiscono vicine — e perché anche le *relazioni* tra parole diventano vettori sommabili.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

**Modalità "Esplora parole vicine"**
- 17 parole (animali, meteo, royalty, persone) posizionate su un piano 2D.
- Cliccando su una parola, si evidenziano le 4 parole più vicine con un indice di somiglianza percentuale — mostrando che il modello raggruppa parole semanticamente correlate senza che nessuno gliel'abbia detto esplicitamente.

**Modalità "Analogie tra vettori"**
- Il celebre esempio *re − uomo + donna = regina*: sottraendo e sommando i vettori delle parole si ottiene un punto che è, in questo caso, **esattamente** la posizione di "regina".
- Un secondo esempio (*principessa − ragazza + ragazzo*) mostra un risultato molto vicino ma non perfetto — proprio come succede spesso con gli embedding reali.

## Nota sui dati

Le posizioni delle parole **non provengono da un vero modello**: sono state scelte a mano (in sole 2 dimensioni, per poterle disegnare) in modo da formare cluster semantici chiari e far tornare esattamente la prima analogia. Un vero modello usa centinaia di dimensioni e impara le posizioni da miliardi di parole di testo — ma il fenomeno del clustering semantico e dell'aritmetica vettoriale è reale e ben documentato fin dal paper originale di word2vec (Mikolov et al., 2013).

## Concetti didattici illustrati

- **Embedding**: rappresentare parole come vettori numerici in uno spazio con molte dimensioni.
- **Similarità semantica come vicinanza spaziale**: il significato "geometrico" della somiglianza tra parole.
- **Aritmetica vettoriale sulle relazioni di significato**: le differenze tra vettori possono codificare relazioni (genere, ruolo) applicabili ad altre coppie di parole.
- Limiti del metodo: le analogie non sono sempre perfette, anche nei modelli reali.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — dati delle parole, disegno SVG del grafico e calcolo di similarità/analogie

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
