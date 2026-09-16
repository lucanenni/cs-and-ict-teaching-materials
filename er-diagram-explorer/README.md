# Diagrammi ER: cardinalità e tabelle

Un esploratore interattivo di diagrammi entità-relazione: tre scenari (biblioteca, scuola, e-commerce), ciascuno con una relazione 1:1, una 1:N e una N:M — clicca su una cardinalità per vedere la spiegazione e le tabelle SQL che ne derivano davvero.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Tre scenari selezionabili, ciascuno con 4-5 entità disegnate come tabelle con i loro attributi (chiave primaria evidenziata).
- Le relazioni tra entità adiacenti, etichettate con la loro cardinalità (1:1, 1:N, N:M): cliccandole si evidenziano le due entità coinvolte e appare un pannello con la spiegazione a parole e le tabelle SQL risultanti.
- Esempi progressivamente più ricchi di tabella "ponte" per le relazioni N:M: una senza attributi propri, una con un attributo (il voto di uno studente in una materia), una con due (quantità e prezzo unitario di un prodotto in un ordine) — il caso classico della riga d'ordine.

## Concetti didattici illustrati

- **Le tre cardinalità** e cosa significano in termini di righe collegabili tra due tabelle.
- **Dove va la chiave esterna**: sempre sul lato "N" per una 1:N, in una tabella a parte con due chiavi esterne per una N:M.
- **Le tabelle associative (ponte)** possono avere attributi propri, che non appartengono a nessuna delle due entità collegate ma alla relazione stessa (approfondito nel pannello dedicato).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — dati dei tre scenari, disegno del diagramma (linee SVG posizionate via calcolo, non misurate) e generazione del testo SQL

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
