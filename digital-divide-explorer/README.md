# Il divario digitale: non solo una questione di connessione

Un esploratore interattivo che confronta, fianco a fianco, come due famiglie con risorse digitali diverse affrontano lo stesso compito concreto — un'interrogazione a distanza, una richiesta a un portale della pubblica amministrazione, un colloquio di lavoro — a parità di impegno e capacità delle persone coinvolte.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Due famiglie a confronto: la **Famiglia Bianchi** (fibra, un dispositivo a testa, genitori a loro agio con la tecnologia) e la **Famiglia Rossi** (solo dati mobili con un pacchetto limitato, un unico smartphone condiviso tra 3 fratelli, genitori poco pratici con le piattaforme digitali).
- Tre scenari selezionabili: "Interrogazione a distanza e compito online", "Richiedere un certificato alla pubblica amministrazione" e "Colloquio di lavoro in videochiamata". Per ciascuno, un racconto passo-passo ("Avvia" o "Passo singolo") di cosa succede in parallelo nelle due famiglie — tempi di attesa, turni per l'unico dispositivo disponibile, difficoltà con un'interfaccia mai vista prima.
- Un esito finale diverso per le due famiglie, a parità di preparazione della persona coinvolta: ogni volta i Bianchi concludono il compito senza intoppi, mentre i Rossi incontrano un ostacolo tecnico o organizzativo che rallenta o complica l'esito, pur avendo messo lo stesso impegno.

## Concetti didattici illustrati

- **Le tre dimensioni del divario digitale**, approfondite nel pannello dedicato: (1) l'accesso all'infrastruttura (avere o non avere una connessione adeguata), (2) il possesso di dispositivi adeguati (un solo smartphone condiviso tra più persone è un ostacolo concreto anche con buona connessione), (3) le competenze digitali (saper usare davvero gli strumenti, non solo possederli).
- **Il divario non è un giudizio sulle persone**: in ogni scenario, le persone coinvolte hanno lo stesso impegno e la stessa capacità — le differenze di esito dipendono da fattori strutturali, non da merito.
- **Perché non basta un solo intervento**: regalare un dispositivo in più affronta solo una delle tre dimensioni, lasciando intatte le altre due.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — scenari fissi a due colonne e animazione passo-passo

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
