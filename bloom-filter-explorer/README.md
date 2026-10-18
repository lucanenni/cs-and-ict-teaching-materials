# Bloom filter: verificare l'appartenenza senza memorizzare nulla

Un esploratore interattivo di un Bloom filter: un array di 16 bit e tre funzioni hash semplificate e deterministiche, che permettono di rispondere "probabilmente presente" o "sicuramente assente" senza mai salvare gli elementi veri e propri. Mostra passo per passo il calcolo delle posizioni hash e, con un esempio preparato apposta, un caso riproducibile di falso positivo.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un array di 16 bit, inizialmente tutti a 0, disegnato come una fila di caselle numerate.
- Tre funzioni hash semplici: `h1` (somma dei codici carattere % 16), `h2` (somma dei codici pesati per posizione % 16) e `h3` (una combinazione diversa, con moltiplicatore 31 e lunghezza della parola) — scelte apposta semplici da calcolare a mano e deliberatamente soggette a collisioni su un array così piccolo.
- **➕ Aggiungi elemento**: calcola le tre posizioni hash della parola inserita (mostrando il calcolo completo di ciascuna) e imposta quei bit a 1.
- **🔍 Verifica presenza**: calcola le stesse tre posizioni e controlla i bit corrispondenti; se sono tutti 1 risponde "✓ Probabilmente presente", se almeno uno è 0 risponde "✗ Sicuramente assente".
- Il calcolo si esegue passo per passo con "▶ Avvia" o "Passo singolo →", un hash alla volta.
- **↺ Reset filtro** riporta l'array a tutto zeri.
- Un riquadro "Prova il falso positivo" prepara in un clic il caso dimostrativo descritto sotto.

## Il caso del falso positivo (riproducibile)

Con il filtro resettato e le parole `gatto`, `luna` e `treno` aggiunte (in questo ordine), l'array di bit risultante è `1000100011100001`. Verificando `pane` — **mai aggiunta** al filtro — tutte e tre le sue posizioni hash (4, 0, 8) risultano già a 1 per coincidenza con i bit acceso da `gatto` e `treno`: il filtro risponde quindi "✓ Probabilmente presente", un **falso positivo** dimostrabile e deterministico. Lo stesso succede con `pecora` (posizioni 10, 15, 8). Verificando invece `sole` (posizioni 3, 9, 15), almeno un bit è 0: il filtro risponde correttamente "✗ Sicuramente assente", un vero negativo.

Questo scenario è stato verificato in anticipo con uno script Node standalone (non incluso nel progetto pubblicato), che ha calcolato le posizioni hash esatte per confermare che `pane` e `pecora` producono un falso positivo mentre `sole` non lo produce, prima di essere riprodotto nell'interfaccia con il pulsante "Prepara la demo (gatto, luna, treno)".

## Concetti didattici illustrati

- **Nessun falso negativo**: se il Bloom filter risponde "assente", lo è con certezza — se l'elemento fosse stato davvero aggiunto, ogni bit delle sue posizioni hash sarebbe stato impostato a 1.
- **Falsi positivi possibili**: un elemento mai aggiunto può risultare "probabilmente presente" se, per coincidenza, elementi diversi hanno già acceso tutti i bit giusti — più piccolo è l'array (o meno hash si usano) rispetto al numero di elementi aggiunti, più probabile diventa.
- **Perché si usa comunque** (approfondito nel pannello dedicato): è velocissimo e occupa pochissima memoria rispetto a un elenco completo degli elementi reali, utile per evitare un controllo costoso (su disco, in rete, su un database remoto) nei casi in cui la risposta vera è quasi sempre "no".

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — funzioni hash, logica di aggiunta/verifica e animazione passo per passo

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
