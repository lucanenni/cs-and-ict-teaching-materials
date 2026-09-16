# Load balancer: Round Robin vs Least Connections

Un confronto diretto tra due strategie di bilanciamento del carico: le stesse otto richieste, con gli stessi tempi di arrivo, distribuite su tre server prima con Round Robin e poi con Least Connections — per vedere cosa succede davvero quando una richiesta dura molto più a lungo delle altre.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Una sequenza fissa di 8 richieste (con tempi di arrivo e durate diverse, inclusa una molto più lunga delle altre), eseguita in parallelo con le due strategie a confronto.
- Un'animazione a tick (play/pausa/passo singolo) che avanza il tempo per entrambe le strategie insieme, mostrando le connessioni attive su ciascun server in tempo reale.
- Un riepilogo finale con il picco massimo di connessioni simultanee per server: Round Robin sovraccarica un server che stava già gestendo la richiesta lunga, mandandogli comunque nuove richieste per pura rotazione; Least Connections se ne accorge e le smista sui server più liberi.

## Concetti didattici illustrati

- **Round Robin**: semplice, prevedibile, ma "cieco" al carico reale di ciascun server.
- **Least Connections**: si adatta al carico effettivo, ma richiede che il bilanciatore tenga traccia dello stato dei server in tempo reale.
- **I limiti di "contare le connessioni"** (approfondito nel pannello dedicato): perché anche Least Connections non è sempre la scelta giusta, se le richieste hanno pesi molto diversi tra loro.

## Nota sulla correttezza

La simulazione è stata verificata in Node (non inclusa nel progetto pubblicato): l'assegnazione di Round Robin segue sempre l'ordine ciclico fisso indipendentemente dal carico; ogni scelta di Least Connections è stata confrontata con un ricalcolo indipendente delle connessioni attive di ciascun server in quell'istante, verificando che scelga sempre un server al minimo. Il pareggio tra server è risolto a rotazione (non sempre a favore dello stesso server), per una distribuzione realistica quando più server sono ugualmente liberi.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — pianificazione delle richieste, le due strategie di bilanciamento e l'animazione a tick

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
