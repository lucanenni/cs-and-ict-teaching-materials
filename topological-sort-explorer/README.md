# Ordinamento topologico

Un esploratore interattivo dell'algoritmo di Kahn per l'ordinamento topologico: dato un piccolo grafo diretto aciclico (DAG) di compiti con dipendenze, mostra passo per passo come si costruisce un ordine di esecuzione che rispetta tutti i prerequisiti — e cosa succede quando il grafo contiene, invece, un ciclo.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un grafo di 8 compiti di un flusso di sviluppo software, con dipendenze non banali: "Scrivi i requisiti" non dipende da nulla; da lì partono tre rami paralleli — "Scrivi il codice", "Scrivi la documentazione" e "Configura l'ambiente di staging"; il codice porta a "Scrivi i test" e poi a "Esegui i test" (che dipende sia dal codice che dai test scritti); "Distribuisci" richiede che siano pronti sia i test eseguiti, sia la documentazione, sia l'ambiente; infine "Monitora produzione" dipende dalla distribuzione.
- L'**algoritmo di Kahn**, passo per passo: si calcola il grado entrante (numero di dipendenze non soddisfatte) di ogni compito, si metton in coda i compiti a grado 0, e poi si estrae un compito dalla coda, lo si aggiunge all'ordine finale, e per ogni compito che dipendeva da lui si decrementa il grado entrante — se arriva a 0, entra in coda a sua volta.
- Un pannello del grafo che mostra, in tempo reale, il grado entrante di ogni compito (il numero sul badge), il suo stato (in attesa, pronto/in coda, ordinato), la coda dei "pronti" e l'ordine finale che si costruisce via via.
- Un pulsante "Introduci una dipendenza circolare" che aggiunge un arco artificiale ("Scrivi il codice" dipende anche da "Esegui i test", che dipende però, indirettamente, dal codice stesso): eseguendo lo stesso algoritmo su questo grafo modificato, l'esecuzione si BLOCCA — la coda si svuota mentre restano compiti il cui grado entrante non scende mai a 0, rivelando l'esistenza del ciclo.

## Concetti didattici illustrati

- **L'algoritmo di Kahn**: come si costruisce un ordine topologico tramite grado entrante e una coda di nodi "pronti", decrementando i gradi via via che i prerequisiti si soddisfano.
- **Perché serve un grafo aciclico (DAG)**: in un ciclo, ogni compito del ciclo dipende, anche indirettamente, da un altro compito dello stesso ciclo, quindi nessuno di essi può mai raggiungere grado entrante 0 — l'algoritmo si blocca con un ordine incompleto, ed è esattamente questo blocco il modo in cui l'algoritmo rivela un ciclo.
- **Applicazioni reali**: l'ordine di compilazione dei moduli di un programma che dipendono l'uno dall'altro, la pianificazione di attività con prerequisiti, i prerequisiti dei corsi in un piano di studi.

## Nota sulla correttezza

La logica dell'algoritmo di Kahn (funzione `runKahn` in [script.js](script.js)) è stata verificata in Node (non incluso nel progetto pubblicato): sul grafo normale produce un ordine completo (8/8 compiti) che rispetta ogni singola dipendenza del DAG (verificato con `respectsDependencies`); sullo scenario con la dipendenza circolare produce invece un ordine incompleto (solo i 3 compiti esterni al ciclo vengono ordinati), con i compiti del ciclo ("Scrivi il codice", "Scrivi i test", "Esegui i test") e tutto ciò che ne dipende correttamente segnalati come bloccati, il loro grado entrante finale sempre maggiore di 0.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia e del diagramma del grafo
- [script.js](script.js) — logica pura dell'algoritmo di Kahn (separata e testabile in Node) più l'animazione passo-passo

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
