# Identità digitale: cosa si vede, cosa si deduce

Un esploratore interattivo di 8 decisioni progressive di condivisione sui social: dopo ogni scelta di condividere un'informazione, un pannello mostra le deduzioni via via più precise che chi guarda da fuori può ricavare combinandola con quelle già condivise. Un indicatore di esposizione e un riepilogo finale mostrano il "profilo ricostruibile" risultante dalle scelte fatte.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- 8 decisioni presentate una alla volta, come un post o un modulo da compilare (posizione attuale, vero nome o nickname, foto del diploma con la scuola, data di nascita in un sondaggio, tag della città, foto di famiglia che mostra la casa, turno di lavoro dei genitori, orari degli allenamenti), ciascuna con due pulsanti: "Condividi" / "Non condividere".
- Dopo ogni scelta di condivisione, il pannello "Cosa può dedurre chi guarda da fuori" si aggiorna con deduzioni scritte a mano per ogni combinazione plausibile (es. scuola + città → "si sa in quale scuola e città trovarti nelle ore scolastiche"; aggiungendo la data di nascita → si può stimare età e classe). Le deduzioni più specifiche sostituiscono quelle più generiche sullo stesso tema, così il pannello resta leggibile invece di accumulare frasi ridondanti.
- Un indicatore di "livello di esposizione" (Basso/Medio/Alto, con colore) che cresce con il numero di informazioni condivise.
- Un riepilogo finale con il "profilo ricostruibile" risultante e un pulsante per ricominciare da capo con scelte diverse, per confrontare gli esiti.

## Nota sull'interazione

Questo progetto non usa il pattern "Avvia / Passo singolo": ogni decisione produce una reazione immediata (il pannello delle deduzioni si aggiorna non appena si clicca "Condividi" o "Non condividere"), quindi non c'è un'animazione temporizzata da avviare o far avanzare un passo alla volta. La prima decisione e tutti i pannelli sono già pronti al semplice caricamento della pagina.

## Concetti didattici illustrati

- **La combinazione delle informazioni conta più del singolo dato**: ogni informazione condivisa da sola sembra poco significativa, ma messa insieme ad altre permette deduzioni molto più precise.
- **Il diritto all'oblio**: la possibilità di chiedere la rimozione di informazioni obsolete o non più rilevanti su di sé.
- **Il consenso informato**: sapere davvero a cosa si acconsente condividendo, non solo chi vede il post ma con cosa potrà essere combinato in futuro.
- **"Non ho nulla da nascondere" non basta** (approfondito nel pannello dedicato): il punto non è nascondere qualcosa di sbagliato, ma mantenere il controllo su come le informazioni vengono combinate e usate da altri.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — decisioni, regole di deduzione combinata e logica di esposizione

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
