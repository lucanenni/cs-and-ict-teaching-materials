# Dilemmi etici dell'intelligenza artificiale

Un esploratore di 5 scenari realistici in cui un sistema di IA prende o influenza una decisione che riguarda delle persone. Per ciascuno scenario si possono confrontare gli argomenti a favore e contro il suo uso, e si nomina esplicitamente il principio etico più in gioco (trasparenza, responsabilità, equità o sorveglianza/privacy).

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- 5 scenari-dilemma presentati uno alla volta: un algoritmo bancario che nega un prestito senza spiegazioni chiare, un sistema di riconoscimento facciale per le presenze a scuola, un'auto a guida autonoma davanti a un incidente inevitabile, uno scarto automatico dei curriculum, un algoritmo di raccomandazione video che massimizza il tempo di visione.
- Per ciascuno scenario, due colonne con 2-3 argomenti **a favore** e 2-3 argomenti **contro** l'uso di quel sistema, pensate per la discussione e non per un punteggio: non esiste una risposta "corretta" da indovinare.
- Un pannello "Principio etico in gioco" che nomina il principio più rilevante per quello specifico scenario: trasparenza/spiegabilità, responsabilità, equità, oppure sorveglianza e privacy.
- Un selettore che permette di passare liberamente da uno scenario all'altro, tornando in qualsiasi momento a uno scenario già visto.

## Concetti didattici illustrati

- **Trasparenza e spiegabilità**: la differenza tra un sistema che decide bene e un sistema che decide in modo comprensibile — e perché le due cose non coincidono sempre.
- **Responsabilità**: quando una decisione viene delegata a un algoritmo, chi ne risponde in caso di errore non è sempre ovvio (chi lo progetta, chi lo adotta, chi lo supervisiona).
- **Equità**: un sistema può trattare in modo diverso situazioni che, per merito, dovrebbero essere trattate allo stesso modo.
- **Sorveglianza e privacy**: l'uso dell'IA spesso richiede di raccogliere dati personali o biometrici, con domande su consapevolezza e consenso di chi viene osservato.
- La differenza tra un problema **tecnico-statistico** (il bias nei dati di addestramento) e le domande **etiche più ampie** sull'uso, la responsabilità e la trasparenza di un sistema, indipendentemente dalla sua accuratezza — approfondita nel pannello dedicato, in relazione al progetto [bias-in-data-simulator](../bias-in-data-simulator/README.md) della stessa raccolta.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — dati dei 5 scenari e logica di selezione/visualizzazione

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
