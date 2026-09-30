# Automa per espressioni regolari

Uno strumento interattivo con un vero motore di espressioni regolari (non un motore preconfezionato del browser): un'espressione regolare digitata viene compilata in un automa a stati non deterministico (NFA) tramite la costruzione di Thompson, poi simulata carattere per carattere.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Scrivi un'espressione regolare (supporta concatenazione, `|`, `*`, `+`, `?`, raggruppamento con parentesi) e una stringa da verificare.
- L'animazione mostra, carattere per carattere, l'**insieme** di stati dell'automa ancora "vivi" — non un solo percorso, ma tutte le possibilità aperte contemporaneamente, esattamente come funziona davvero un NFA.
- Un pannello di prova rapida testa automaticamente alcune varianti della stringa (troncata, con un carattere in più, invertita) per mostrare quanto sia sensibile il risultato.

## Concetti didattici illustrati

- **Automi a stati finiti applicati a un caso reale**: le espressioni regolari, uno degli usi più comuni degli automi, seguito naturale di [finite-state-machine-explorer](../finite-state-machine-explorer/).
- **Non determinismo**: perché seguire un insieme di stati possibili è più semplice che dover "indovinare" un unico percorso, e come i due modelli (NFA e DFA) siano comunque equivalenti in potere espressivo.
- **Costruzione di Thompson**: come una definizione ricorsiva di espressione regolare si traduce meccanicamente in un grafo di stati con transizioni epsilon.

## Verifica del motore

Il parser e la costruzione dell'automa sono stati testati in Node, prima di essere usati nella pagina, con 24 casi (accettazione e rifiuto attesi) su quattro espressioni diverse — inclusi casi limite come `colou?r` che accetta sia "color" sia "colour" ma rifiuta "colouur". Tutti i casi sono risultati corretti.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — parser dell'espressione regolare, costruzione dell'NFA (costruzione di Thompson) e simulazione a insieme di stati

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
