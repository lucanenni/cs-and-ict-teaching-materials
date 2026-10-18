# Come nasce un albero decisionale

Un esploratore interattivo che costruisce un albero decisionale passo dopo passo su un piccolo dataset didattico ("si gioca o no, in base al tempo?"), mostrando a ogni nodo i punteggi di tutte le feature candidate, la scelta fatta e come si dividono i dati. Una volta costruito, l'albero può classificare un nuovo esempio scelto dall'utente, seguendo il percorso dalla radice alla foglia.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Il dataset di addestramento: 10 giornate con tre feature categoriche (**Tempo**: Sole/Pioggia/Nuvoloso, **Vento**: Sì/No, **Umidità**: Alta/Normale) e la decisione finale **Giocare** (Sì/No) — una versione in italiano del classico dataset "Play Tennis".
- "Avvia" / "Passo singolo" costruiscono l'albero un nodo alla volta (in ampiezza: prima la radice, poi tutti i suoi figli, poi i loro): a ogni passo il pannello mostra il punteggio di ciascuna feature ancora disponibile a quel nodo, quale viene scelta e come si dividono gli esempi secondo i suoi valori, oppure — se il nodo è già puro o non restano feature — perché diventa una foglia.
- L'albero vero e proprio, disegnato nodo per nodo mentre si costruisce, con il conteggio degli esempi e la feature (o la decisione finale, per le foglie) a ogni nodo, e il valore della feature etichettato su ciascun ramo.
- Una volta completata la costruzione, un piccolo modulo per scegliere i valori di un nuovo esempio e classificarlo: la pagina segue passo passo il percorso dalla radice a una foglia, evidenziando i nodi e i rami attraversati, fino alla previsione finale.

## La misura usata: l'impurità di Gini

Ad ogni nodo, per ciascuna feature ancora disponibile, calcoliamo l'**impurità di Gini** di ciascun gruppo che risulterebbe dividendo per quella feature:

```
Gini(gruppo) = 1 − Σ p_c²       (p_c = proporzione di esempi di classe c nel gruppo)
```

Vale 0 quando il gruppo è perfettamente puro (una sola classe) ed è massima quando le classi sono mescolate in parti uguali. Per confrontare le feature fra loro usiamo il **Gini pesato** della divisione, cioè la media dell'impurità di ogni gruppo generato, pesata sulla sua dimensione relativa:

```
GiniPesato(feature) = Σ (|gruppo_v| / |nodo|) × Gini(gruppo_v)      per ogni valore v della feature
```

L'algoritmo scegli sempre la feature con il **Gini pesato più basso**: quella che, in media, separa meglio le classi. Questa misura (anziché, per dire, l'entropia/guadagno informativo usato da altri algoritmi come C4.5) è stata scelta apposta perché il calcolo è più semplice da mostrare passo passo con numeri visibili nella UI (nessun logaritmo, solo frazioni e quadrati) — ma l'idea di fondo, "preferire la divisione che produce i gruppi più puri", è la stessa.

## Scelta di design: divisione multi-via, non binaria

Ogni nodo interno si divide in tanti rami quanti sono i valori distinti della feature scelta tra gli esempi rimasti a quel nodo (per esempio Tempo produce fino a 3 rami: Sole, Pioggia, Nuvoloso), invece delle sole due branche "sì/no" tipiche di molte implementazioni di CART. Per feature categoriche con pochi valori come queste è la scelta più diretta da seguire visivamente, e corrisponde all'albero che la maggior parte dei libri di testo introduttivi disegna a mano per questo tipo di dataset.

## Concetti didattici illustrati

- **Perché si scelgie sempre la feature più informativa prima delle altre**: a ogni nodo l'algoritmo calcola il punteggio di tutte le feature disponibili e prende quella che separa meglio le classi rimaste — è una scelta "golosa" (greedy), fatta localmente a ogni nodo, non una ricerca di tutto l'albero migliore possibile.
- **Nodo puro vs. nodo con feature esaurite**: un ramo si ferma quando tutti gli esempi che vi arrivano hanno la stessa decisione (foglia pura), oppure quando non restano più feature da provare pur non essendo puro (foglia con la classe più frequente lì).
- **Overfitting con dataset più rumorosi o alberi troppo profondi** (approfondito nel pannello dedicato): con dati più numerosi e meno ordinati di questo piccolo esempio, un albero lasciato crescere senza limiti tende a creare rami sempre più specifici solo per separare pochi esempi particolari, imparando a memoria i dati di addestramento invece del pattern generale — un rischio affrontato più in dettaglio altrove in questa raccolta.

## Nota sulla correttezza

Le funzioni `gini`, `scoreFeatures`, `buildTree` e `classify` sono state verificate in Node (test non incluso nel progetto pubblicato): i punteggi delle feature alla radice sono stati confrontati con il calcolo a mano (Tempo = 0.30, Vento ≈ 0.419, Umidità = 0.40 — Tempo vince), la forma esatta dell'albero risultante è stata verificata nodo per nodo contro quella prevista a mano, l'albero classifica correttamente tutti i 10 esempi di addestramento, 3 nuovi esempi sono stati classificati e confrontati col percorso atteso (incluso un esempio che si ferma già alla radice perché Tempo = Nuvoloso è puro), e un caso sintetico verifica che un valore mai visto a un nodo in addestramento ricada correttamente sulla classe maggioritaria di quel nodo.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica dell'albero (Gini, costruzione, classificazione) e disegno/animazione

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
