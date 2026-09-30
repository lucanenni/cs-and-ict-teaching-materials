# Gerarchia dei domini (DNS)

Un esploratore interattivo della struttura di un nome di dominio (radice, TLD, dominio di secondo livello, sottodomini) e di come un resolver DNS lo risolve, un passo alla volta, seguendo una catena di deleghe invece di consultare un'unica tabella gigante.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un campo di testo in cui scrivere un nome di dominio (o sceglierne uno tra i cinque preimpostati), con la scomposizione dal vivo nelle sue etichette: sottodominio, dominio di secondo livello e TLD, riconoscendo anche i TLD composti più comuni come `.co.uk`.
- Un diagramma verticale che mostra i quattro livelli della gerarchia, dalla radice (`.`) fino al nome host completo.
- Un'animazione passo-passo (play/pausa, passo singolo, reset) della risoluzione DNS: dal resolver alla radice, dalla radice ai server del TLD, dai server del TLD al server autoritativo del dominio, fino alla risposta finale con un indirizzo IP (inventato a scopo didattico).

## Concetti didattici illustrati

- **Struttura gerarchica di un nome di dominio**: perché si legge da destra a sinistra, e la differenza tra un dominio registrato e un sottodominio creato liberamente da chi lo possiede.
- **Risoluzione per deleghe successive**: nessun singolo server DNS conosce la risposta finale; ognuno sa solo a chi rivolgersi al passo successivo.
- **Limiti del modello semplificato** (approfondito nel pannello dedicato): perché la vera Public Suffix List dei browser è più complessa della piccola lista di TLD composti usata qui, con l'esempio di `github.io`, e come questa pagina si relaziona a [network-packet-journey](../network-packet-journey/), dove il DNS è invece una singola scatola nera.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — parsing del dominio, generazione dei passi di risoluzione e logica dell'animazione

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
