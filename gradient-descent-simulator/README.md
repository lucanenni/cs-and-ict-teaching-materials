# La discesa del gradiente

Una pallina scende, un passo alla volta, lungo un paesaggio d'errore verso il punto più basso — mostrando cosa succede quando il tasso di apprendimento è troppo alto, troppo basso, o quando ci si può bloccare in un minimo che non è il migliore possibile.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md). Completa idealmente [perceptron-learning-simulator](../perceptron-learning-simulator/): lì si vede *cosa* impara un algoritmo, qui si vede *come* — il meccanismo di ottimizzazione usato da praticamente tutte le reti neurali.

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un grafico con **due valli**: una più profonda (il minimo globale) e una meno profonda (un minimo locale), separate da una piccola collina.
- Cliccando in un punto del grafico, la pallina riparte da lì.
- "Passo singolo" fa fare un solo passo di discesa del gradiente; "Avvia" esegue i passi automaticamente, a velocità regolabile.
- Uno slider regola il **tasso di apprendimento**: troppo basso e la discesa è lentissima, troppo alto e la pallina rimbalza da un lato all'altro (o esce del tutto dal grafico).
- A seconda del punto di partenza, la pallina può fermarsi nella valle sbagliata: il pannello di stato lo segnala esplicitamente.

## Concetti didattici illustrati

- **Discesa del gradiente**: l'algoritmo di ottimizzazione più usato per allenare modelli di machine learning, incluse le reti neurali.
- Il **gradiente** (la derivata) come indicatore della direzione di salita più ripida — e perché ci si muove nella direzione opposta.
- Il **tasso di apprendimento** (learning rate) come parametro critico: troppo piccolo è inefficiente, troppo grande è instabile.
- **Minimi locali vs minimo globale**: perché il punto di partenza (l'inizializzazione dei pesi, in una vera rete) può determinare a quale soluzione si arriva.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — la funzione d'errore, l'algoritmo di discesa del gradiente e il disegno sul canvas

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
