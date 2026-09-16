# Overfitting vs underfitting

Uno strumento interattivo che mostra cosa succede quando un modello è troppo semplice (**underfitting**) o troppo complicato (**overfitting**) rispetto ai dati, confrontando l'errore su dati di addestramento con l'errore su dati mai visti.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md). Completa idealmente [perceptron-learning-simulator](../perceptron-learning-simulator/) e [gradient-descent-simulator](../gradient-descent-simulator/): quelli mostrano *come* un modello impara, questo mostra *quanto* è saggio lasciarlo imparare troppo bene i dati che ha davanti.

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- 10 punti di "addestramento" (rumorosi) e 6 punti "mai visti" generati dalla stessa funzione nascosta, ma non usati per adattare il modello.
- Uno slider regola il **grado del polinomio** che il modello usa per interpolare i punti di addestramento: grado 1 è una retta, gradi alti sono curve sempre più flessibili.
- Due barre confrontano l'errore (errore quadratico medio) sui dati di addestramento e sui dati mai visti, con un verdetto testuale (underfitting / overfitting / buon compromesso) che si aggiorna in tempo reale.
- "Nuovi dati" rigenera un nuovo campione casuale, per vedere che il fenomeno non dipende da un caso isolato.

## Concetti didattici illustrati

- **Overfitting**: un modello troppo flessibile che si adatta al rumore dei dati di addestramento invece che al loro andamento reale, e quindi generalizza male su dati nuovi.
- **Underfitting**: un modello troppo rigido per catturare nemmeno l'andamento principale dei dati.
- La differenza cruciale tra **errore di addestramento** ed **errore di generalizzazione** (su dati mai visti) — motivo per cui i modelli si valutano sempre su un insieme di test separato.
- L'idea di **complessità del modello** come parametro da bilanciare, non da massimizzare.

## Nota tecnica

Il fit polinomiale è calcolato con una regressione ai minimi quadrati (equazioni normali, risolte con eliminazione di Gauss-Jordan), lavorando in coordinate x normalizzate per restare numericamente stabile anche ai gradi più alti.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — generazione dei dati, regressione polinomiale e disegno del grafico

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
