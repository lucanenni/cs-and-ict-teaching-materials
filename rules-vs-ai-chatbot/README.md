# Regole contro IA: due chatbot a confronto

Due chatbot, uno accanto all'altro, rispondono allo stesso messaggio in modo molto diverso: uno segue regole fisse e trasparenti, l'altro (un'IA solo *simulata*, non un vero modello) riconosce formulazioni diverse e mostra quanto è "sicuro" di ogni risposta — incluso il momento in cui inventa una risposta plausibile pur di non ammettere di non sapere.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un unico campo di testo (o i pulsanti rapidi suggeriti) invia lo stesso messaggio a entrambi i chatbot contemporaneamente.
- Il **chatbot a regole** risponde solo se il messaggio contiene esattamente una delle parole chiave previste, e mostra sempre quale regola si è attivata (o che nessuna regola ha trovato corrispondenza).
- Il **chatbot "IA"** riconosce anche formulazioni diverse della stessa richiesta (sinonimi, parafrasi) e sceglie tra più risposte possibili, mostrando una percentuale di "sicurezza".
- Prova a chiedere "Quanto fa due più due?" (parafrasato, senza cifre): il chatbot a regole non lo riconosce, l'IA simulata sì — un buon esempio della rigidità delle regole.
- Prova a chiedere "Chi vincerà i mondiali del 2050?": è un evento futuro, impossibile da conoscere. Il chatbot a regole ammette semplicemente di non avere una regola. L'IA simulata, invece, **inventa una risposta plausibile e sicura di sé** — un'illustrazione sicura e controllata di cosa si intende per "allucinazione" nei modelli linguistici reali.

## Concetti didattici illustrati

- Differenza tra un sistema **basato su regole** (if-then, trasparente ma rigido) e un sistema **probabilistico** (più flessibile, ma meno prevedibile).
- Il concetto di **confidenza/sicurezza** di una risposta, e perché un numero alto non garantisce che la risposta sia corretta.
- **Allucinazione**: quando un modello genera un'informazione plausibile ma falsa, invece di ammettere di non sapere — mostrata qui in un contesto sicuro (un risultato sportivo futuro, chiaramente impossibile da conoscere).
- Perché la trasparenza di un sistema a regole (si sa sempre *perché* ha risposto così) è un vantaggio, anche quando è meno potente di un'IA.

## Nota sui dati

Nessuno dei due chatbot usa un vero modello linguistico o si connette a internet: sono entrambi completamente **scriptati** con un piccolo insieme di parole chiave e risposte scritte a mano. Il chatbot "IA" è una *simulazione* pensata per illustrare, in modo sicuro e prevedibile, comportamenti reali dei modelli linguistici (riconoscimento più flessibile, punteggi di confidenza, allucinazioni) — non è esso stesso un modello di intelligenza artificiale.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — categorie di risposta, matching delle parole chiave e logica dei due chatbot

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
