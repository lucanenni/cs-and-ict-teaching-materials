# Pascalina

Un simulatore della calcolatrice meccanica costruita da Blaise Pascal nel 1642: sei ruote decimali che sommano girando in avanti, con un vero meccanismo di riporto a cascata (il "sautoir") animato passo dopo passo.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Sei ruote decimali (da 10⁵ a 10⁰) che rappresentano un numero da 0 a 999999.
- **Somma un numero**: inserisci un addendo e guarda la macchina girare le ruote uno scatto alla volta, cifra per cifra, esattamente come avrebbe fatto un operatore reale.
- **Ruota a mano**: il pulsante "+1" sotto ogni ruota simula un singolo scatto manuale — utile per osservare da vicino il momento esatto in cui una ruota passa da 9 a 0 e fa scattare il riporto sulla ruota successiva.
- **Riporto a cascata**: sommando a partire da 999999 il riporto si propaga attraverso tutte e sei le ruote in un colpo solo, fino a superare l'ultima — la macchina segnala l'overflow invece di produrre un risultato sbagliato.

## Concetti didattici illustrati

- **Il riporto come meccanismo, non come regola astratta**: la stessa operazione che si fa a mano sulla carta (quando una colonna supera 9, si riporta 1 alla colonna successiva) qui è un vero ingranaggio che scatta fisicamente.
- **Rappresentazione a capacità fissa e overflow**: con un numero fisso di ruote, esiste un valore massimo rappresentabile — un'idea che anticipa di secoli l'overflow nei registri a bit fissi dei computer moderni.
- **Sottrazione tramite complemento** (approfondito nel pannello dedicato): la Pascalina sapeva solo sommare, ma permetteva di sottrarre leggendo una seconda serie di cifre incise (il complemento a 9) — lo stesso principio del complemento a due usato oggi dai processori in binario.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — motore delle ruote decimali con riporto a cascata e animazione

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
