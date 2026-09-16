# Generatore di testo "alla vecchia maniera"

Un generatore di testo a **catena di Markov**: guarda solo l'ultima parola (o le ultime due) già scritte e sceglie la prossima in base a quanto spesso quella sequenza compariva in un piccolo testo di esempio. Nessuna attenzione, nessun contesto lungo — il tipo di modello che si usava prima dei Transformer.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md). Pensato come contrasto diretto con [attention-visualizer](../attention-visualizer/) e [llm-token-visualizer](../llm-token-visualizer/): mostra concretamente perché guardare solo le ultime parole non basta.

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un piccolo testo di partenza (leggibile aprendo il pannello dedicato), da cui il modello ha contato quali parole seguono ciascuna parola (o coppia di parole).
- Una parola alla volta, il testo generato cresce: ad ogni passo si vede la distribuzione di probabilità delle parole possibili, calcolata direttamente dalle frequenze osservate nel testo originale.
- Si può scegliere la "memoria" del modello — **1 parola** (bigram) o **2 parole** (trigram) — e vedere come una memoria più lunga renda il testo generato leggermente più coerente.
- In modalità deterministica il modello sceglie sempre la parola più probabile (spesso finendo per ripetersi in un ciclo); disattivandola, sceglie a caso in base alle probabilità.

## Concetti didattici illustrati

- **Modelli n-gram / catene di Markov**: come si generava testo automaticamente prima dei modelli basati su attenzione.
- Perché guardare solo un contesto molto corto porta a testo che vaga senza filo logico o che si blocca in un ciclo ripetitivo.
- Il ruolo della **quantità di contesto** nella qualità della generazione — un'introduzione intuitiva al motivo per cui l'attenzione (che può guardare l'intera frase) ha rappresentato un salto di qualità enorme.
- Differenza tra generazione **deterministica** (sempre la scelta più probabile) e **probabilistica** (campionamento casuale pesato).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — corpus, costruzione del modello n-gram e logica di generazione

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
