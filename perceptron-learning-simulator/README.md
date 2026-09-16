# Il percettrone che impara

Un percettrone impara a separare due classi di punti su un piano, un aggiornamento alla volta: a ogni passo osserva un solo punto e, se lo classifica male, sposta leggermente la propria retta di separazione verso di esso.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md). Completa idealmente [artificial-neuron-simulator](../artificial-neuron-simulator/): lì i pesi si impostano a mano, qui si osserva come un algoritmo li impari da solo.

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un dataset di 24 punti generato casualmente ma sempre linearmente separabile (due classi, colori diversi).
- "Passo singolo" fa valutare al percettrone un solo punto: lo classifica bene (nessuna modifica) o male (i pesi si aggiornano e la retta si sposta).
- "Avvia" esegue automaticamente i passi in sequenza, a velocità regolabile, finché il percettrone non converge (un giro completo su tutti i punti senza errori).
- Il pannello di stato mostra i pesi correnti, quanti aggiornamenti sono stati fatti finora e l'accuratezza attuale sull'intero dataset.
- "Nuovo dataset" genera un nuovo problema da zero, con una nuova retta "vera" nascosta da scoprire.

## Concetti didattici illustrati

- Il **percettrone** come algoritmo di apprendimento supervisionato più semplice: impara da esempi etichettati, un esempio alla volta.
- La differenza tra **impostare** i pesi di un neurone a mano (vedi [artificial-neuron-simulator](../artificial-neuron-simulator/)) e farli **imparare** da un algoritmo che minimizza gli errori.
- Il concetto di **separabilità lineare**: due classi che possono essere divise da una retta (o, in più dimensioni, da un iperpiano).
- L'idea di **convergenza**: un algoritmo di apprendimento che si ferma quando non ha più nulla da correggere.
- Il **tasso di apprendimento** (learning rate) come parametro che regola quanto "aggressivo" è ogni aggiornamento.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — generazione del dataset, algoritmo del percettrone e disegno sul canvas

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
