# Il viaggio di un pacchetto

Un'animazione passo-passo di cosa succede davvero, dietro le quinte, quando il browser carica un sito: dalla risoluzione del nome a dominio fino alla risposta del server e ritorno.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un diagramma con quattro tappe: il browser, un server DNS, un router e il server del sito.
- "Passo singolo" avanza di una tappa alla volta; "Avvia" esegue l'intera sequenza in automatico.
- Ad ogni passo, il diagramma evidenzia dove si trova il pacchetto e un pannello spiega cosa sta succedendo in quel momento — dalla richiesta dell'indirizzo IP al DNS, fino al ritorno della pagina al browser.
- Due siti di esempio selezionabili (it.wikipedia.org e www.istruzione.it), con i loro **veri** indirizzi IP verificati tramite una risoluzione DNS effettiva al momento in cui è stato scritto il progetto — non inventati.

## Concetti didattici illustrati

- Il **DNS** come "rubrica telefonica" di internet, che traduce nomi di dominio in indirizzi IP.
- Il concetto di **pacchetto** e di instradamento (routing) attraverso più nodi intermedi.
- Il ciclo **richiesta/risposta** (request/response) che sta alla base di quasi ogni comunicazione in rete.

## Nota didattica

Il diagramma semplifica volutamente una rete reale, che ha molti più nodi intermedi e percorsi possibili. Il DNS, in particolare, in realtà non fa da tramite per il traffico dati di ritorno dal server (si occupa solo della risoluzione iniziale del nome): qui la sequenza visiva passa comunque per quella posizione nel diagramma per mantenere un unico percorso semplice da seguire, ma il testo di ogni passo descrive sempre con precisione cosa succede davvero. Il passo del DNS è inoltre trattato come un'unica scatola nera: la catena reale di server interrogati in cascata (radice, TLD, autoritativo) è scomposta passo passo in [dns-domain-explorer](../dns-domain-explorer/).

Gli indirizzi IP restituiti dal DNS in questa simulazione sono reali, ma non eterni: molti siti (specialmente quelli dietro una CDN) possono rispondere con IP diversi nel tempo o a seconda della posizione geografica di chi interroga.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — sequenza dei passi e logica di riproduzione

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
