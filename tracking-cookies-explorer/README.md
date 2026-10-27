# Cookie, fingerprinting e tracking pixel: chi ti osserva mentre navighi

Tre siti fittizi indipendenti che incorporano tutti lo stesso script di un network pubblicitario fittizio ("AdNetworkXYZ"): una navigazione passo-passo mostra come un singolo cookie di terze parti permetta di riconoscere lo stesso browser da un sito all'altro e di costruire un profilo di interessi. Due sezioni separate mostrano poi un tracking pixel invisibile in un'email e il fingerprinting del browser.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- **Navigazione sui tre siti** (▶ Avvia / Passo singolo, abilitato fin dal caricamento della pagina): la visita a NegozioScarpe.it, in cui lo script di AdNetworkXYZ scrive un nuovo cookie di terze parti e registra "interesse: scarpe"; la visita a BlogRicette.it, dove lo stesso script legge lo stesso cookie, riconosce lo stesso browser e aggiunge "interesse: ricette"; la visita a NotizieSport.it, dove il cookie viene letto di nuovo e il profilo ormai costruito porta a mostrare una pubblicità di scarpe. Ogni passo mostra esattamente cosa viene scritto, letto o dedotto, e il profilo che si costruisce progressivamente lato network pubblicitario.
- **Tracking pixel**: un'email fittizia con un'immagine 1×1 invisibile incorporata. Il pulsante "📧 Apri l'email" simula l'apertura e rivela la richiesta di rete che parte comunque, senza alcun clic, con i dati che il server di tracciamento registra (IP simulato, user agent, data e ora).
- **Fingerprinting del browser**: un elenco di caratteristiche apparentemente innocue del dispositivo (risoluzione, fuso orario, lingua, font installati, user agent) e una spiegazione di come la loro combinazione specifica permetta di identificare lo stesso dispositivo anche senza cookie.
- Un pannello finale su cookie di prima vs terze parti, perché il fingerprinting è più difficile da bloccare, e cosa prevede il GDPR in materia di consenso ai cookie.

## Concetti didattici illustrati

- **Cookie di prima parte vs di terze parti**: i primi sono impostati dal sito visitato per il proprio funzionamento (es. login); i secondi sono impostati da un servizio esterno incorporato in più siti, e proprio per questo permettono di riconoscere lo stesso browser da un sito all'altro.
- **Costruzione progressiva di un profilo di tracciamento**: come interessi registrati su siti diversi, ma collegati dallo stesso identificativo, si combinano in un profilo usato poi per scegliere la pubblicità da mostrare.
- **Tracking pixel**: come un'immagine invisibile possa registrare l'apertura di un'email (o di una pagina) senza alcuna azione consapevole da parte di chi la apre.
- **Fingerprinting del browser**: perché la combinazione di caratteristiche innocue è spesso sufficiente a identificare un dispositivo in modo quasi univoco, e perché questo rende il fingerprinting più difficile da bloccare rispetto ai semplici cookie.
- **Il GDPR e il consenso ai cookie** (approfondito nel pannello dedicato): perché esiste il banner dei cookie, e i suoi limiti nel proteggere anche dal fingerprinting.

## Nota sulla correttezza

La costruzione del profilo di tracciamento (funzioni `visitSite` e `chooseAd`, usate da `buildTrackingSteps` per generare la sequenza di stati mostrata passo per passo) è stata verificata in Node (non incluso nel progetto pubblicato) su ogni visita della sequenza: la prima visita crea sempre un nuovo cookie, le visite successive riconoscono sempre lo stesso cookie esistente senza ricrearlo, il profilo si aggiorna aggiungendo un interesse nuovo senza mai perdere quelli già registrati né duplicarli, e la pubblicità finale corrisponde sempre al primo interesse registrato nel profilo.

## Struttura dei file

- [index.html](index.html) — markup della pagina (le tre sezioni più il pannello di approfondimento)
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica di costruzione del profilo, generazione dei passi e rendering delle tre sezioni

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
