# Apprendimento per rinforzo: un agente che impara dai premi

Un esploratore interattivo del Q-learning: un agente si muove su una griglia 5×5 scegliendo le mosse con una politica epsilon-greedy e aggiorna via via una Q-table in base ai premi che riceve, senza che nessuno gli indichi mai la mossa "giusta" in anticipo.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Una griglia 5×5 con una cella di partenza fissa, una cella obiettivo (premio +10) e due celle trappola (premio −10 ciascuna); ogni passo "normale" costa −1, per incentivare percorsi brevi. Se l'agente tenta di uscire dalla griglia, resta semplicemente fermo.
- La **Q-table** sovrapposta alla griglia: in ogni cella, i 4 numeri ai lati (su, giù, sinistra, destra) sono i valori Q stimati per quell'azione da quella cella; il valore più alto (l'azione che l'agente sceglierebbe "a sfruttamento") è evidenziato in blu.
- "Passo singolo" esegue un passo dell'episodio in corso: scelta dell'azione (epsilon-greedy, ε = 0,2), movimento, premio, aggiornamento del valore Q appena usato. Il pannello sotto la griglia registra ogni passo in linguaggio naturale, inclusa la formula applicata.
- "▶ Avvia" esegue l'episodio in corso passo dopo passo con una breve animazione, fino alla conclusione.
- "⚡ Esegui 50 / 200 episodi velocemente" fa girare molti episodi completi senza animazione, aggiornando la Q-table ad ogni passo di ciascuno: dopo, un nuovo episodio passo-passo mostra l'agente scegliere quasi sempre la strada migliore verso l'obiettivo, evitando le trappole.
- "Nuovo episodio" interrompe l'episodio corrente (se incompleto) e ne prepara uno nuovo dalla cella di partenza, senza toccare la Q-table imparata finora. "↺ Azzera Q-table" riparte invece da zero.
- Un contatore "Episodio numero N" e, dopo ogni episodio concluso, un riepilogo dell'esito (obiettivo raggiunto / caduto in trappola / troppi passi) con il premio totale accumulato.

## Scelta di rappresentazione della Q-table

I 4 valori Q di ogni cella sono mostrati **sovrapposti alla griglia stessa** (ai quattro lati della cella, in una mini-disposizione a croce), invece che in una tabella separata: questo permette di vedere a colpo d'occhio sia la forma della griglia (partenza, obiettivo, trappole) sia dove "punta" la politica dell'agente in ogni cella, senza dover far corrispondere manualmente righe di una tabella a celle della griglia.

## Parametri fissi (documentati anche nel pannello di aiuto)

- **α (alpha) = 0,5** — tasso di apprendimento: quanto il nuovo valore osservato sposta la stima precedente.
- **γ (gamma) = 0,9** — fattore di sconto: quanto conta il valore stimato del futuro rispetto al premio immediato.
- **ε (epsilon) = 0,2** — probabilità di scegliere un'azione casuale ("esplorazione") invece dell'azione con il valore Q più alto ("sfruttamento").
- Regola di aggiornamento: `Q(s,a) = Q(s,a) + α × (premio + γ × max(Q(s_nuovo, ·)) − Q(s,a))`.
- Un episodio termina quando l'agente raggiunge l'obiettivo, cade in una trappola, o supera 50 passi.

## Concetti didattici illustrati

- **Apprendimento per rinforzo vs apprendimento supervisionato**: qui non esiste un "insegnante" che indica subito la risposta corretta per ogni situazione. L'agente scopre cosa funziona solo dal premio ricevuto *dopo* aver agito, e a volte capisce il valore di una scelta solo molti passi più tardi rispetto al momento in cui l'ha fatta.
- **Compromesso esplorazione/sfruttamento**: provare occasionalmente azioni nuove (esplorazione) per scoprire se sono migliori, invece di usare sempre e solo quello che si sa già funzionare (sfruttamento) — e perché un po' di esplorazione resta utile anche dopo che l'agente ha già imparato qualcosa.
- **Q-learning**: come un singolo numero per ogni coppia (cella, azione) possa, aggiornato ripetutamente con la stessa semplice regola, finire per codificare un intero percorso verso l'obiettivo.

## Nota sulla correttezza

Le funzioni pure `clampMove`, `getReward`, `updateQ` e `chooseAction` sono state verificate a parte in Node (non incluso nel progetto pubblicato) su casi calcolabili a mano: movimento normale e tentativi di uscita dalla griglia ai bordi, premio corretto su obiettivo/trappola/cella normale, calcolo manuale dell'aggiornamento Q con e senza valore massimo successivo non nullo, e comportamento di `chooseAction` con ε = 0 (sempre greedy) ed ε = 1 (sempre esplorativo). È stato inoltre verificato che, dopo alcune migliaia di episodi simulati, la Q-table converge in modo sensato: ad esempio, dalla cella appena sotto l'obiettivo l'azione con valore Q più alto risulta "su" (verso l'obiettivo), e dalla cella appena a sinistra dell'obiettivo risulta "destra".

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica del Q-learning, rendering della griglia/Q-table e animazione passo-passo

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
