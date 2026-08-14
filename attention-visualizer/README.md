# Attenzione, semplificata

Uno strumento interattivo che mostra, in modo intuitivo, cos'è il meccanismo di **attenzione** dei modelli linguistici moderni: per ogni parola di una frase, quanto il modello "guarda" ciascun'altra parola per costruirne il significato in contesto.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md). Si affianca a [llm-token-visualizer](../llm-token-visualizer/): lì si vede *come* un LLM genera testo token per token, qui si vede *su cosa* si basa per farlo.

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Tre frasi di esempio, ciascuna pensata per mostrare un fenomeno diverso che l'attenzione riesce a catturare.
- Cliccando su una parola, le altre parole della frase si colorano con un'intensità proporzionale al peso di attenzione che quella parola riceve dalla parola selezionata.
- Sotto la frase, un elenco ordinato mostra le percentuali esatte e una breve nota che spiega cosa sta succedendo in quell'esempio specifico.

I tre esempi:

1. **A cosa si riferisce "era"?** — mostra come l'attenzione risolva un riferimento ambiguo ("Il gatto... sul tappeto... era morbido": chi è morbido?).
2. **Accordo tra aggettivo e sostantivo** — mostra come articoli e aggettivi "si aggancino" al sostantivo con cui devono concordare.
3. **Dipendenze a lunga distanza** — mostra come un verbo possa restare collegato al proprio soggetto anche quando sono separati da molte parole, cosa che un modello basato solo sulla vicinanza (come un semplice n-gram) non riuscirebbe a fare altrettanto bene.

## Nota sui dati

I pesi di attenzione mostrati **non provengono da un vero modello**: sono stati scelti a mano per essere didatticamente chiari (ogni riga somma comunque, per costruzione, al 100%, proprio come farebbe una vera softmax). Il meccanismo illustrato — e la formula descritta nel pannello "Come si calcolano davvero questi pesi?" — è però quello realmente usato dai Transformer.

## Concetti didattici illustrati

- Il meccanismo di **attenzione** (attention) come combinazione pesata delle altre parole di una frase.
- L'idea di **query, key e value**, i tre ruoli che ogni parola assume nel calcolo dell'attenzione.
- Perché l'attenzione supera i limiti dei modelli basati solo su parole vicine (n-gram/Markov): può collegare parole a qualunque distanza nella frase.
- Collegamento diretto con fenomeni linguistici concreti: risoluzione di riferimenti, accordo grammaticale, dipendenze sintattiche a lunga distanza.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — dati degli esempi, generazione delle matrici di attenzione e interazione

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
