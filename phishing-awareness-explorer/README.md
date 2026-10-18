# Riconoscere un tentativo di phishing

Un esploratore interattivo con 8 email completamente inventate (nessun marchio o servizio reale), presentate una alla volta in un formato simile a un client email: per ciascuna occorre decidere se è legittima o un tentativo di phishing PRIMA di vedere la risposta, che poi rivela gli indizi specifici.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- 8 "email" fittizie, mostrate una alla volta con mittente, oggetto, corpo del messaggio e, quando presente, un link o un allegato visibile — 4 legittime e 4 di phishing.
- Per ciascuna email, due pulsanti — "✓ Legittima" e "⚠ Phishing" — per scegliere PRIMA di vedere qualunque indizio. Dopo la scelta, la pagina rivela subito la classificazione corretta e, per le email di phishing, l'elenco degli indizi specifici presenti in quella email (2-4 per email, diversi combinazioni tra loro: dominio del mittente quasi identico ma sbagliato, link visibile diverso dall'indirizzo reale a cui porterebbe, urgenza artificiale, richiesta diretta di dati sensibili, errori grammaticali vistosi, allegato con doppia estensione sospetta). Per le email legittime, una spiegazione di perché non ci sono indizi sospetti.
- Un contatore "Email N di 8" con il punteggio parziale, aggiornato ad ogni risposta.
- Un riepilogo finale con il punteggio totale e l'elenco delle email classificate male, con la risposta data e quella corretta per ciascuna.
- Un pulsante "↺ Ricomincia" nel riepilogo per rifare l'esercizio da capo.

## Scelta di interazione (nessun pattern "Avvia"/"Passo singolo")

Questo progetto NON usa un pannello a passi con pulsanti "Avvia"/"Passo singolo": per ogni email l'utente risponde una sola volta e vede subito tutti gli indizi insieme. È una scelta deliberata — qui non c'è una sequenza temporale da animare (come il susseguirsi di passi di un episodio o di uno scenario), quindi un'interazione diretta "rispondi → vedi il risultato completo" è più chiara e più vicina a come si valuterebbe davvero un'email ricevuta.

## Concetti didattici illustrati

- **Perché il phishing funziona nonostante sembri "ovvio" col senno di poi**: fa leva deliberatamente su urgenza, paura o curiosità per spingere ad agire prima di fermarsi a pensare.
- **I controlli pratici più utili**: controllare il vero indirizzo del mittente carattere per carattere (non solo il nome visualizzato); passare il mouse sul link senza cliccare per vedere l'URL di destinazione reale prima di decidere; diffidare sempre di richieste urgenti di dati personali o di pagamenti via email.
- **Indizi concreti e ricorrenti**: dominio del mittente quasi identico a uno plausibile, discrepanza tra il testo del link e l'indirizzo reale a cui porta, urgenza artificiale, richieste dirette di password o dati di pagamento, errori grammaticali vistosi, allegati con estensioni doppie sospette (es. `.pdf.exe`).

## Nota importante sul contenuto

Tutte le email sono fittizie: nomi di fantasia generici ("ServizioPagamenti", "La Tua Banca", "Lotteria Fortunata", un collega e una scuola immaginari), nessun marchio reale, nessun vero indirizzo o URL funzionante. Il contenuto è puramente illustrativo, a scopo educativo e difensivo: nessun link è cliccabile e nessun allegato è reale.

## Nota sulla correttezza

Le funzioni pure `classify`, `computeScore` e `getWrongAnswers` sono state verificate a parte in Node (non incluso nel progetto pubblicato) su casi costruiti a mano: classificazione corretta e sbagliata su email legittime e di phishing, e calcolo di punteggio ed elenco degli errori su una sequenza di risposte mista.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — dati delle 8 email, logica di classificazione e interazione

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
