# Codici a barre e codici 2D

Uno strumento interattivo che mostra come si impacchetta del testo in barre o in una griglia di quadratini — e, soprattutto, la differenza cruciale tra **rilevare** un errore e riuscire davvero a **correggerlo**.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

**Codice a barre (1D)**
- Ogni carattere diventa una sequenza fissa di 9 elementi, di cui 3 "larghi" e 6 "stretti", più un carattere di checksum finale.
- Danneggiando un elemento a caso e provando a decodificare, il carattere colpito risulta semplicemente **illeggibile**: un codice a barre non ha ridondanza per ricostruire cosa c'era prima.

**Codice 2D con correzione d'errore**
- Una griglia ispirata ai QR code, con tre pattern di ricerca agli angoli per l'orientamento.
- I dati sono protetti da un vero **codice di Hamming (7,4)**: clicca su un quadratino dei dati per invertirlo, poi decodifica — se il danno è contenuto (un bit per blocco), il testo torna esatto, corretto automaticamente.

## Concetti didattici illustrati

- **Rilevamento vs correzione d'errore**: un checksum dice *che* c'è un errore; un codice come Hamming può anche dire *dov'è* e ripararlo da solo.
- **Ridondanza**: perché aggiungere bit "extra" (apparentemente ridondanti) rende i dati resistenti ai danni fisici.
- **Pattern di ricerca**: perché i codici 2D hanno bisogno di un modo per essere localizzati e orientati prima ancora di essere letti.

## Nota di trasparenza sui dati

Il **codice a barre** di questa pagina usa un alfabeto e una tabella di corrispondenza generati algoritmicamente (tutte le combinazioni di 3 elementi larghi su 9), **non lo standard reale Code 39/UPC**: un tentativo di verificare la tabella ufficiale contro una fonte esterna ha prodotto un risultato internamente incoerente (lunghezze diverse, pattern duplicati), quindi si è scelto di costruire uno schema originale, coerente per costruzione, piuttosto che rischiare di pubblicare dati sbagliati spacciandoli per uno standard reale. Il **codice 2D** è ispirato ai QR code nell'aspetto (pattern di ricerca agli angoli) ma usa una disposizione dei dati e una correzione d'errore (Hamming, non Reed-Solomon) semplificate: non è leggibile da un vero lettore di QR code. L'algoritmo di correzione Hamming(7,4) stesso, però, è reale ed è stato verificato esaustivamente (tutte le 16 combinazioni di 4 bit, con ogni possibile singolo bit danneggiato) prima di essere usato nella pagina.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — generazione del codice a barre, disegno della griglia 2D e implementazione del codice di Hamming (7,4)

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
