# NAT: un solo IP pubblico per tutta la rete

Un esploratore interattivo della traduzione degli indirizzi (NAT/NAPT): guarda come un router traduce ogni connessione in uscita di più dispositivi con IP privati in un unico IP pubblico, popolando una vera tabella di corrispondenza — e perché un pacchetto non richiesto dall'esterno viene scartato.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un dispositivo e una destinazione su internet selezionabili, e un pulsante che avvia l'animazione a passi (play/pausa/passo singolo) dell'intera andata e ritorno: richiesta in uscita, traduzione dell'indirizzo al router, arrivo (tradotto) a destinazione, risposta, e consegna al dispositivo giusto grazie alla tabella.
- Una tabella di traduzione NAT che si popola a ogni connessione, con IP:porta privata, IP:porta pubblica e destinazione — ogni riga chiudibile a mano.
- Una sezione "pacchetto dall'esterno": prova una porta corrispondente a una connessione già aperta (viene inoltrata) o una mai aperta (viene scartata), per vedere concretamente perché il NAT lascia entrare solo le risposte a connessioni iniziate da dentro.

## Concetti didattici illustrati

- **NAT/NAPT**: come un solo indirizzo IP pubblico può servire contemporaneamente più dispositivi, grazie anche alla traduzione della porta oltre che dell'indirizzo.
- **La tabella di traduzione come stato necessario**: il router deve "ricordarsi" ogni connessione aperta per poter instradare correttamente le risposte.
- **Perché una connessione dall'esterno viene normalmente bloccata** (approfondito nel pannello dedicato), e cos'è — e perché serve — il port forwarding.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — generazione dei passi di traduzione, gestione della tabella NAT e verifica dei pacchetti in ingresso

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
