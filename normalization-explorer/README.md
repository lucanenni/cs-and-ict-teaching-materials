# Normalizzazione: dalla ridondanza alle tabelle pulite

Un esploratore interattivo della normalizzazione: parti da un'unica tabella "Ordini" piena di dati ripetuti, guarda concretamente cosa può andare storto, e scomponila passo passo in tabelle separate collegate da chiavi esterne.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Una tabella "Ordini" denormalizzata, con le celle ripetute colorate per gruppo (stesso cliente, stesso prodotto) così la ridondanza salta all'occhio.
- Un elenco concreto delle tre anomalie (aggiornamento, inserimento, cancellazione), con riferimenti alle righe vere della tabella.
- Un pulsante "Simula: Giulia cambia email" che si comporta diversamente a seconda dello stato: sulla tabella ancora denormalizzata aggiorna *una sola* delle due righe di Giulia per errore, creando una vera incoerenza visibile (evidenziata in rosso); una volta estratta la tabella Clienti, lo stesso pulsante aggiorna un'unica riga e tutto resta coerente.
- Due passi di estrazione ("Estrai i clienti", "Estrai i prodotti") che scompongono dal vivo la tabella, fino ad arrivare a tre tabelle pulite (Clienti, Prodotti, Ordini) più un'anteprima che le riunisce con un JOIN, per verificare che nessuna informazione sia andata perduta.

## Concetti didattici illustrati

- **Le tre anomalie da ridondanza** (aggiornamento, inserimento, cancellazione) e perché derivano tutte dallo stesso problema: mescolare fatti indipendenti nella stessa riga.
- **Normalizzazione come separazione di responsabilità**: ogni tabella dovrebbe descrivere un solo tipo di fatto, collegato alle altre tramite chiavi esterne.
- **Il limite di questa semplificazione** (approfondito nel pannello dedicato): perché "2NF" e "3NF" qui sono usate come etichetta didattica per l'idea centrale, non come dimostrazione formale sulle dipendenze funzionali.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — dataset di partenza, logica di estrazione delle tabelle e simulazione dell'anomalia di aggiornamento

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
