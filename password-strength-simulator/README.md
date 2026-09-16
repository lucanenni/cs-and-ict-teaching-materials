# Forza ed entropia delle password

Uno strumento interattivo che mostra cosa rende davvero difficile indovinare una password — e cosa, sorprendentemente, non basta da solo: il puro calcolo matematico dell'entropia, senza considerare quanto una password sia prevedibile.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser. **Tutto il calcolo avviene localmente**, nessun dato lascia mai il browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Scrivendo (o scegliendo) una password, la pagina calcola in tempo reale l'alfabeto usato, lo **spazio delle possibilità** e l'**entropia** in bit, con una barra di forza complessiva.
- Le password comuni o riconducibili a pattern prevedibili (parole di dizionario tipiche, sequenze come "1234", caratteri ripetuti) vengono segnalate esplicitamente come deboli, **anche se il loro punteggio di entropia sarebbe alto** — proprio per mostrare il limite del calcolo puramente matematico.
- Uno slider di "velocità dell'attaccante" (da un tentativo al secondo a mano, fino a un supercomputer) converte lo spazio delle possibilità in un tempo medio di attacco a forza bruta, in unità comprensibili (secondi, anni, "volte l'età dell'universo"...).
- Un confronto diretto tra una password corta e densa di simboli e una passphrase di quattro parole casuali più lunga mostra concretamente come la **lunghezza** batta la pura varietà di caratteri.

## Concetti didattici illustrati

- **Spazio delle chiavi ed entropia**: come misurare quante password diverse sono possibili con un dato alfabeto e una data lunghezza, e perché l'entropia (una scala logaritmica) è un modo comodo di esprimere la stessa idea.
- **Attacco a forza bruta vs attacco a dizionario**: la matematica dell'entropia assume un attaccante che prova tutto alla cieca; gli attacchi reali provano prima le password più comuni e i pattern più prevedibili, rendendo insicure anche password "matematicamente" forti se sono scelte in modo tipico.
- **Lunghezza contro complessità**: perché una passphrase di più parole casuali è spesso più sicura — e più facile da ricordare — di una password corta piena di simboli.
- Buone pratiche implicite: password uniche, lunghe, generate casualmente (o gestite con un password manager) battono qualunque regola mnemonica basata su "maiuscole, simboli, numeri".

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — analisi dell'alfabeto, calcolo di spazio delle possibilità/entropia, rilevamento di password comuni e stima del tempo di attacco

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
