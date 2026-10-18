# Catena di certificati: perché il browser si fida di un sito

Un esploratore interattivo di come il browser decide se fidarsi del certificato HTTPS di un sito: non lo valuta da solo, ma risale una catena di firme — dal certificato del sito, alla CA Intermedia che lo ha firmato, fino a una Root CA già registrata nel "trust store" del browser.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Tre certificati rappresentati come card: la Root CA (autofirmata), la CA Intermedia (firmata dalla Root) e il certificato del sito `esempio.it` (firmato dalla CA Intermedia), ciascuno con soggetto, emittente e "firmato con la chiave privata di: X".
- Una verifica passo-passo, con "▶ Avvia" (automatica) o "Passo singolo →" (manuale): il browser riceve il certificato del sito, verifica la sua firma con la chiave pubblica della CA Intermedia, poi verifica la firma della CA Intermedia con la chiave pubblica della Root CA, infine controlla che la Root CA sia nel trust store — se tutti i passi riescono, la connessione è sicura.
- Uno scenario selezionabile che simula un punto di rottura: firma del sito non valida, firma della CA Intermedia non valida, oppure Root CA non presente nel trust store. In ogni caso la catena si interrompe esattamente a quel passo, mostrato in rosso, con il motivo preciso per cui la connessione risulta non sicura.

## Concetti didattici illustrati

- **Catena di fiducia (chain of trust)**: fidarsi di un certificato significa fidarsi di tutta la catena di firme che risale fino a una radice conosciuta, non solo dell'ultimo anello.
- **Firma digitale e chiavi pubblica/privata**: ogni certificato è firmato con la chiave privata di chi lo emette, e chiunque può verificarne la firma con la chiave pubblica corrispondente.
- **Trust store del browser**: l'insieme delle Root CA che il browser considera fidate a priori, su cui si fonda tutta la catena.
- **Cosa significa davvero l'avviso "la connessione non è privata"**: un fallimento in un punto preciso della catena di verifica, non necessariamente un attacco in corso.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica della catena di verifica e animazione passo-passo

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
