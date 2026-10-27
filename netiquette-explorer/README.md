# Netiquette: le regole non scritte del comportamento online

Un esercizio di riconoscimento con 8 messaggi completamente inventati (chat di classe, commento video, email a un professore, canale di lavoro, forum di un gioco online). Per ciascuno si decide prima se è appropriato o no, poi si scopre la valutazione corretta e, per i messaggi problematici, quale regola di netiquette viene violata.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- 8 messaggi mostrati uno alla volta, ciascuno in un formato che somiglia al contesto reale: bolla di chat, commento sotto un video, email, messaggio in un canale di lavoro, post di forum (con, per un caso, i messaggi precedenti del thread già visibili).
- Per ciascun messaggio, due pulsanti — "✓ Va bene" e "⚠ Non va bene" — per scegliere prima di vedere la risposta.
- Dopo la scelta, la valutazione corretta: per i messaggi problematici, la regola di netiquette violata (MAIUSCOLO percepito come urlare, tono aggressivo/flaming, informazioni private condivise senza permesso, registro inadeguato al contesto, pubblicità non richiesta/spam, domanda già risposta senza aver letto sopra); per i messaggi appropriati, una spiegazione di cosa li rende adeguati al contesto.
- Punteggio progressivo ("Messaggio N di 8") e riepilogo finale con l'elenco degli errori di valutazione, se presenti, ciascuno con la relativa spiegazione.
- Un pulsante "↺ Ricomincia" per rifare l'esercizio.

## Concetti didattici illustrati

- **Netiquette**: le convenzioni non scritte che regolano la comunicazione online, diverse da contesto a contesto (una chat tra compagni non è un'email a un insegnante, un forum pubblico non è un canale di lavoro).
- **Perché conta anche se "è solo internet"**: il testo scritto online resta visibile più a lungo e raggiunge più facilmente un pubblico più ampio di quanto si creda, e manca il linguaggio del corpo o il tono di voce che, di persona, aiuta a moderare un messaggio o a capire che non era inteso male (approfondito nel pannello "Come funziona?").
- **Riconoscere forme diverse di comportamento scorretto online**: non è solo "essere scortesi", ma includere errori di registro, violazioni di privacy, spam e mancanza di attenzione a ciò che altri hanno già scritto.

## Scelta di interazione

A differenza di altri progetti della raccolta che usano un pattern "Avvia"/"Passo singolo" (pensato per animare una sequenza nel tempo, come un protocollo di rete o una transazione), qui non c'è nulla da animare: ogni messaggio è un caso isolato da valutare. Per questo, come in [phishing-awareness-explorer](../phishing-awareness-explorer/), l'interazione è diretta — rispondi una volta e vedi subito il feedback completo — invece di un pattern a due fasi (prepara/esegui) che qui aggiungerebbe solo un clic in più senza alcun beneficio didattico.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — dati dei messaggi, logica di valutazione e punteggio, rendering

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
