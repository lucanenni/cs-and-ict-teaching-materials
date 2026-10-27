# Riconoscere una fake news

Un esercizio di riconoscimento con 8 notizie completamente inventate (temi neutri: alimentazione, scienza, cronaca locale fittizia), 4 attendibili e 4 false. Per ciascuna si decide prima se sembra vera o falsa, poi si scoprono gli indizi che la rivelano o la fonte che la rende verificabile.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- 8 "notizie" mostrate una alla volta, ciascuna con titolo, breve corpo, fonte citata e data, in un formato simile a un breve articolo.
- Per ciascuna, scelta prima di vedere la risposta: "✓ Attendibile" o "⚠ Probabilmente falsa".
- Dopo la scelta, la valutazione corretta: per le notizie false, 2-3 indizi specifici (fonte inventata, titolo clickbait che non corrisponde al contenuto, nessun dato verificabile a supporto, foto decontestualizzata, data riciclata, affermazione che contraddice fatti scientifici di base); per le notizie vere, cosa le rende verificabili (fonte con nome plausibile, nessuna delle red flag precedenti).
- Punteggio progressivo ("Notizia N di 8") e riepilogo finale con l'elenco degli errori di valutazione, se presenti.
- Un pulsante "↺ Ricomincia" per rifare l'esercizio.

## Concetti didattici illustrati

- **Gli indizi tipici di una fake news**: fonte inventata o non verificabile, titolo sensazionalistico scollegato dal contenuto reale, assenza di dati o fonti a supporto di affermazioni importanti, immagini decontestualizzate, date "riciclate", affermazioni in contraddizione con fatti scientifici di base.
- **Controlli pratici di verifica** (pannello "Come controllare una notizia?"): cercare altre fonti indipendenti sullo stesso fatto, controllare la data di pubblicazione reale, fare una ricerca inversa delle immagini sospette, diffidare dei titoli che puntano soprattutto sull'emozione.
- **Perché le notizie false si diffondono più in fretta** (approfondimento nel pannello dedicato): lo studio di Vosoughi, Roy e Aral (MIT, 2018, pubblicato su *Science*) su milioni di notizie condivise su Twitter ha trovato che il falso si diffonde più velocemente, più ampiamente e più in profondità del vero, proprio perché tende a essere più sorprendente ed emotivamente intenso.

## Scelta di interazione

Come in [netiquette-explorer](../netiquette-explorer/) e [phishing-awareness-explorer](../phishing-awareness-explorer/), niente pattern "Avvia"/"Passo singolo": per ogni notizia si risponde una sola volta e si vede subito il verdetto completo con tutti gli indizi, più adatto a un esercizio di riconoscimento di casi isolati che a una sequenza temporale da animare.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — dati delle notizie, logica di valutazione e punteggio, rendering

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
