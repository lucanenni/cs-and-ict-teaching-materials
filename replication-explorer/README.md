# Replicazione: primario, repliche e lag

Un esploratore interattivo della replicazione dei database: scrivi sul server primario e guarda la modifica propagarsi alle repliche con un ritardo — e cosa succede se leggi da una replica prima che ci sia arrivata.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un primario e due repliche con ritardi di propagazione diversi (una vicina, una lontana), su un orologio simulato che avanza a tick.
- Un campo di scrittura: ogni scrittura va solo al primario e resta "in coda" per ciascuna replica fino al proprio ritardo.
- Un pulsante "Leggi da qui" su ogni nodo, con una cronologia che segnala ogni lettura come AGGIORNATA o STANTIA a seconda di cosa quel nodo conteneva in quel preciso istante.
- Il caso chiave: scrivi un nuovo valore e leggi subito da una replica (stantio), poi fai avanzare il tempo oltre il suo ritardo e rileggi (aggiornato) — la stessa lettura, due risultati diversi solo in base a quando la fai.

## Concetti didattici illustrati

- **Perché le scritture vanno sempre al primario**: è l'unica copia sempre garantita aggiornata.
- **Il lag di replica** e perché repliche diverse possono avere ritardi diversi.
- **Consistenza eventuale vs replica sincrona** (approfondito nel pannello dedicato): perché la maggior parte dei sistemi accetta una breve incoerenza temporanea in cambio di scritture più veloci.

## Nota sulla correttezza

La logica di propagazione (`write`, `applyDuePending`, `advanceClock`, `read`) è stata verificata in Node (non inclusa nel progetto pubblicato) con 20 esecuzioni indipendenti di 200 azioni casuali ciascuna (scritture, avanzamenti di tempo, letture): in ogni lettura l'etichetta AGGIORNATA/STANTIA corrisponde esattamente al confronto reale tra il valore della replica e quello del primario in quell'istante; gli aggiornamenti in coda per ogni replica restano sempre nell'ordine corretto; e, lasciando passare abbastanza tempo senza nuove scritture, tutte le repliche convergono sempre al valore del primario (consistenza eventuale).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — modello di scrittura/propagazione/lettura e interfaccia

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
