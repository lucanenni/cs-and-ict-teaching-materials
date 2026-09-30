# Il codice Baudot

Uno strumento interattivo che mostra come si rappresentava il testo prima di ASCII e Unicode: il **codice Baudot** (nella sua revisione standard, ITA2), usato dai telescriventi per oltre mezzo secolo, che riesce a codificare lettere, cifre e punteggiatura con soli **5 bit** grazie a un trucco — due "stati" diversi che danno significati diversi agli stessi codici.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

**Modalità "Tavola dei codici"**
- Accendi e spegni i 5 bit e scegli lo stato "Lettere" (LTRS) o "Cifre" (FIGS): lo stesso identico codice a 5 bit assume un significato completamente diverso a seconda dello stato attivo.
- La tavola completa dei 32 codici mostra entrambi i significati fianco a fianco, con i codici di controllo (NULL, CR, LF, BEL) e i due codici speciali di cambio-stato (LTRS, FIGS) evidenziati.

**Modalità "Codifica un testo"**
- Scrivi un testo e guarda la sequenza di blocchi da 5 bit generata, con i codici LTRS/FIGS inseriti automaticamente **solo quando serve davvero** un cambio di stato.
- Un confronto numerico mostra quanti bit in più costa alternare lettere e cifre nello stesso testo rispetto a scriverle separate, e come si confronta con l'ASCII a 7 bit fissi (che non ha bisogno di alcun cambio di stato).
- Caratteri non previsti dal codice Baudot (accenti, punteggiatura non supportata, emoji) vengono segnalati e scartati — proprio come dovrebbe fare un vero telescrivente dell'epoca, che non li avrebbe saputo trasmettere.
- Un chip "X&Y 🎵" collega il tutto a un caso reale: la copertina dell'album *X&Y* dei Coldplay (2005) traduce proprio quelle tre lettere in una fila di blocchi colorati, una colonna per carattere, seguendo il codice Baudot.

## Concetti didattici illustrati

- **Codifica a lunghezza fissa**: a differenza di UTF-8 (vedi [text-encoding-explorer](../text-encoding-explorer/)), ogni carattere Baudot occupa sempre esattamente 5 bit.
- **Stato nascosto nella comunicazione**: lo stesso codice può significare cose diverse a seconda di un "contesto" che va tracciato separatamente — un'idea che torna in molti protocolli e formati.
- **Compromessi di progettazione**: pochi bit per carattere risparmiano spazio, ma il prezzo è la necessità di codici di cambio-stato che, se il testo alterna spesso lettere e cifre, possono costare più bit di quanti se ne risparmino.
- Un confronto concreto, con numeri reali, tra una codifica storica a stato e le codifiche moderne autosufficienti.

## Nota sui dati

La tavola dei codici usata è l'**ITA2** (International Telegraph Alphabet No. 2), la revisione standard del codice Baudot originale, così come compare nella maggior parte delle fonti di riferimento moderne. Le lettere e le cifre della tavola sono coerenti tra le fonti consultate; alcuni simboli di punteggiatura nella colonna "Cifre" (es. il carattere per il simbolo di valuta) variavano storicamente da un paese o costruttore all'altro — qui si è scelta una delle varianti più diffuse.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — tavola del codice ITA2, logica di codifica del testo (inclusi i cambi di stato automatici) e disegno dell'interfaccia

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
