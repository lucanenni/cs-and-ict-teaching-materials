# Ricorsione ingenua vs memoization

Un esploratore interattivo della programmazione dinamica: mostra, fianco a fianco, l'albero delle chiamate di una ricorsione "ingenua" e quello della stessa ricorsione con memoization, sullo stesso identico input (Fibonacci o lo zaino 0/1). Rende visibile quanto spesso la versione ingenua ricalcola da zero gli stessi sottoproblemi, e quanto la memoization lo eviti.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Due problemi a scelta: Fibonacci(n) con n regolabile da 6 a 10, oppure lo zaino 0/1 con 5 oggetti (peso e valore) e capacità fissa.
- I due alberi delle chiamate costruiti in parallelo, passo per passo (con "Passo singolo") oppure in automatico (con "Avvia"): quello ingenuo rifà da capo ogni sottoproblema già visto, quello con memoization lo "taglia" non appena lo ritrova già calcolato, sostituendolo con una semplice lettura dalla tabella.
- Un badge rosso ×N sui nodi dell'albero ingenuo che vengono calcolati più di una volta in totale, per rendere visibile la ripetizione (es. fib(3) calcolato 3 volte dentro fib(6)).
- Due contatori affiancati — chiamate totali per la ricorsione ingenua, chiamate con calcolo reale + letture dalla cache per la memoization — che per fib(8) arrivano a 67 contro 9.
- La tabella di memoization che si popola in diretta mentre l'albero viene costruito, con la riga coinvolta evidenziata nel momento in cui viene letta invece di essere ricalcolata.

## Concetti didattici illustrati

- **Sottoproblemi sovrapposti (overlapping subproblems)**: perché la stessa identica chiamata può comparire molte volte in un albero di ricorsione.
- **Memoization**: come salvare il risultato di ogni sottoproblema al primo calcolo trasformi le chiamate successive in semplici letture da una tabella.
- **Dall'esponenziale al lineare (o pseudo-polinomiale)**: perché evitare il ricalcolo riduce drasticamente il numero di operazioni, e cosa significa "pseudo-polinomiale" nel caso dello zaino 0/1 (approfondito nel pannello dedicato).

## Nota sulla correttezza

La logica di costruzione degli alberi (`buildFibNaive`, `buildFibMemo`, `buildKnapsackNaive`, `buildKnapsackMemo`) è stata verificata in Node (non incluso nel progetto pubblicato): fib(8) produce sempre il risultato corretto 21, con 67 chiamate nella versione ingenua contro 9 chiamate reali con la memoization; fib(6) richiama fib(3) esattamente 3 volte nell'albero ingenuo; la versione dello zaino 0/1 è stata confrontata con un algoritmo indipendente a forza bruta (enumerazione di tutti i sottoinsiemi di oggetti) su diverse combinazioni di oggetti e capacità, trovando sempre lo stesso valore massimo e un numero di chiamate sempre inferiore con la memoization.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica dei due algoritmi, generazione dei fotogrammi e animazione a due colonne

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
