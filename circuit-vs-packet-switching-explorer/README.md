# Commutazione di circuito vs di pacchetto

Un esploratore interattivo che confronta, sulla stessa piccola rete e sullo stesso scenario di comunicazione, i due modi fondamentali per far viaggiare dati attraverso una rete: riservare prima un canale dedicato end-to-end (commutazione di circuito), oppure spezzare i dati in pacchetti instradati indipendentemente (commutazione di pacchetto).

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Una piccola rete con un mittente, tre nodi intermedi e un destinatario, con due vie parallele possibili tra due dei nodi intermedi.
- Due modalità selezionabili, eseguibili passo-passo ("Avvia"/"Passo singolo") sullo stesso scenario (una "chiamata" di 6 turni, con alcuni silenzi nel mezzo):
  - **Commutazione di circuito**: fase di SETUP che riserva un canale dedicato attraverso tutti i nodi intermedi, poi i dati viaggiano turno per turno senza bisogno di indirizzo (incluse le pause, durante le quali il canale resta comunque riservato e quindi sprecato), infine fase di TEARDOWN che lo libera.
  - **Commutazione di pacchetto**: i dati sono spezzati in pacchetti numerati instradati indipendentemente, che possono prendere percorsi diversi attraverso la rete; un secondo flusso "di un altro utente" condivide contemporaneamente gli stessi collegamenti (multiplexing statistico) — impossibile nella modalità a circuito.
- Un riepilogo finale che confronta tempo di setup/teardown, spreco di banda nei silenzi e possibilità di condivisione del collegamento con altro traffico.

## Concetti didattici illustrati

- **Setup e teardown**: nella commutazione di circuito serve un negoziato preliminare (e uno finale) per riservare e liberare le risorse lungo tutto il percorso, prima che un solo dato possa viaggiare.
- **Banda sprecata**: un canale riservato resta "occupato" anche quando non lo si sta usando (silenzio), a differenza di un collegamento condiviso che in quel momento è libero per altri.
- **Instradamento indipendente e multiplexing statistico**: ogni pacchetto porta il proprio indirizzo e può seguire una strada diversa; più flussi di utenti diversi possono alternarsi sullo stesso collegamento.
- **Perché la storia è andata così**: la rete telefonica tradizionale (PSTN) usava la commutazione di circuito per garantire una qualità costante per tutta la telefonata; Internet usa la commutazione di pacchetto perché sfrutta molto meglio la banda condivisa tra tanti utenti, al prezzo di una latenza più variabile.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica dei due scenari (circuito e pacchetto) e animazione passo-passo

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
