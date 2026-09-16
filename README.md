# CS and ICT teaching materials

Una raccolta di piccoli progetti didattici, pensati per spiegare concetti di informatica e IA a studenti delle scuole superiori. Ogni progetto è indipendente, statico (HTML/CSS/JS senza build tool, salvo diversa indicazione) e vive nella propria sottocartella con un proprio README.

🔗 **Indice online (GitHub Pages):** https://lucanenni.github.io/cs-and-ict-teaching-materials/

L'indice online è organizzato per argomento: la home page mostra le categorie, ciascuna con una propria sotto-pagina in [topics/](topics/) che elenca i progetti corrispondenti (le categorie più numerose sono a loro volta divise in sotto-argomenti). Qui sotto trovi l'elenco completo, piatto, per riferimento rapido.

## Progetti

### 🤖 Intelligenza Artificiale

- [llm-token-visualizer](llm-token-visualizer/) — simulatore che mostra come un LLM genera testo un token alla volta, con probabilità e percorsi alternativi.
- [artificial-neuron-simulator](artificial-neuron-simulator/) — simulazione interattiva di un neurone artificiale: input pesati, bias e funzioni di attivazione.
- [perceptron-learning-simulator](perceptron-learning-simulator/) — un percettrone che impara da solo, un aggiornamento alla volta, a separare due classi di punti.
- [gradient-descent-simulator](gradient-descent-simulator/) — una pallina scende un paesaggio d'errore, mostrando l'effetto del tasso di apprendimento e il rischio dei minimi locali.
- [overfitting-underfitting-simulator](overfitting-underfitting-simulator/) — regola la complessità di un modello e guarda l'errore su dati di addestramento vs dati mai visti divergere.
- [attention-visualizer](attention-visualizer/) — mostra a quali parole di una frase un modello "presta attenzione" per costruirne il significato.
- [word-embedding-explorer](word-embedding-explorer/) — esplora la somiglianza tra parole e le analogie vettoriali (es. re − uomo + donna = regina).
- [markov-text-generator](markov-text-generator/) — un generatore di testo "alla vecchia maniera" che guarda solo l'ultima parola o due, per contrasto con l'attenzione.
- [bias-in-data-simulator](bias-in-data-simulator/) — mostra come un modello impari a ripetere un'ingiustizia presente nei propri dati di addestramento.
- [confusion-matrix-explorer](confusion-matrix-explorer/) — sposta la soglia di decisione di un filtro anti-spam e guarda matrice di confusione, precisione e richiamo cambiare dal vivo.
- [rules-vs-ai-chatbot](rules-vs-ai-chatbot/) — due chatbot a confronto: uno a regole rigide, uno probabilistico simulato — con una vera allucinazione "in diretta".

### 💾 Rappresentazione dei dati

- [binary-number-explorer](binary-number-explorer/) — accendi e spegni i bit e guarda il numero cambiare tra binario, decimale ed esadecimale.
- [text-encoding-explorer](text-encoding-explorer/) — scrivi del testo e scopri quanti byte serve davvero rappresentarlo in UTF-8.
- [pixel-art-rgb-explorer](pixel-art-rgb-explorer/) — dipingi una griglia di pixel e vedi il valore RGB esatto di ognuno.
- [color-synthesis-explorer](color-synthesis-explorer/) — cerchi RGB/CMY sovrapponibili per esplorare la sintesi additiva (luce) e sottrattiva (pigmenti) del colore.
- [baudot-code-explorer](baudot-code-explorer/) — come si scriveva testo con soli 5 bit, prima di ASCII e Unicode: il codice dei vecchi telescriventi.
- [huffman-coding-explorer](huffman-coding-explorer/) — perché dare codici più corti alle lettere più frequenti fa risparmiare spazio, senza perdere nemmeno un bit.
- [cones-rods-explorer](cones-rods-explorer/) — perché bastano tre colori per ingannare l'occhio umano — un pixel non riproduce mai la luce vera.
- [color-palette-explorer](color-palette-explorer/) — come si costruiscono combinazioni di colori che stanno bene insieme — e come si verifica se sono leggibili.
- [qr-barcode-explorer](qr-barcode-explorer/) — come si impacchetta del testo in barre o quadratini — e la differenza tra rilevare un errore e correggerlo.
- [baudot-album-cover-explorer](baudot-album-cover-explorer/) — un vero easter egg discografico: la copertina di X&Y dei Coldplay traduce il titolo in blocchi colorati col codice Baudot.
- [image-resolution-explorer](image-resolution-explorer/) — da un'immagine di oggi fino alle vecchie schede grafiche dei primi PC — quanti pixel e colori servono davvero.
- [ieee754-explorer](ieee754-explorer/) — come 32 bit rappresentano sia numeri minuscoli sia enormi — al prezzo di non poter essere sempre esatti.
- [compression-comparison-explorer](compression-comparison-explorer/) — tre modi di comprimere lo stesso testo, ognuno bravo a sfruttare un tipo diverso di ripetizione.

### 🌐 Reti e sicurezza

- [network-packet-journey](network-packet-journey/) — cosa succede davvero, passo dopo passo, quando il browser carica un sito: dal DNS al server e ritorno.
- [caesar-cipher-explorer](caesar-cipher-explorer/) — cifra e decifra messaggi a mano, poi guarda quanto è facile romperli per forza bruta.
- [hash-avalanche-explorer](hash-avalanche-explorer/) — cambia un solo carattere in un testo e guarda il suo hash SHA-256 diventare completamente diverso.
- [diffie-hellman-explorer](diffie-hellman-explorer/) — come due persone si accordano su un segreto condiviso comunicando solo in chiaro, davanti a chiunque le stia ascoltando.
- [public-key-cryptography-explorer](public-key-cryptography-explorer/) — come chiudere un messaggio in modo che solo una persona precisa possa aprirlo — e come funziona una firma digitale.
- [two-factor-auth-explorer](two-factor-auth-explorer/) — un vero generatore di codici usa e getta (TOTP), calcolato nel browser con lo stesso algoritmo delle app di autenticazione.
- [blockchain-explorer](blockchain-explorer/) — perché modificare un solo blocco nel passato "rompe" tutta la catena che viene dopo.
- [ip-subnetting-explorer](ip-subnetting-explorer/) — come un indirizzo IP si divide in una parte "di rete" e una "di host" — e cosa significa scrivere /24.
- [public-private-ip-explorer](public-private-ip-explorer/) — perché milioni di case possono avere tutte lo stesso 192.168.1.1 — e come un router condivide un solo IP pubblico tra più dispositivi (NAT).
- [malware-types-explorer](malware-types-explorer/) — non tutto il software dannoso funziona allo stesso modo — e come fa un antivirus a riconoscerlo.
- [backup-strategy-explorer](backup-strategy-explorer/) — quanto spazio serve, e quanto costa ripristinare, con tre modi diversi di fare backup — con numeri veri.
- [session-token-auth-explorer](session-token-auth-explorer/) — come un sito "si ricorda" che hai fatto login — sessioni con cookie contro token firmati.
- [simplified-des-explorer](simplified-des-explorer/) — la struttura del vero DES — permutazioni, S-box, round Feistel — su un solo byte: seguila passo dopo passo.
- [tls-handshake-explorer](tls-handshake-explorer/) — la sequenza reale dei messaggi che aprono un canale https://, con un vero scambio di chiavi ECDHE e una vera cifratura finale.
- [dns-domain-explorer](dns-domain-explorer/) — scomponi un nome di dominio nei suoi livelli e guarda un resolver DNS risolverlo passo dopo passo, per deleghe successive.
- [dhcp-explorer](dhcp-explorer/) — guarda la trattativa a quattro messaggi (DORA) con cui un dispositivo ottiene un indirizzo IP — e cosa succede quando il pool finisce.
- [nat-explorer](nat-explorer/) — guarda come un router traduce ogni connessione in uscita in un unico IP pubblico — e perché un pacchetto non richiesto viene scartato.
- [traceroute-explorer](traceroute-explorer/) — scopri, un hop alla volta, tutti i router attraversati da un pacchetto sfruttando il campo TTL, esattamente come fa il comando reale.
- [osi-layers-explorer](osi-layers-explorer/) — scrivi un messaggio e guardalo scendere la pila a 5 livelli guadagnando un header a ogni passo, poi risalire sul destinatario perdendoli uno a uno.
- [password-strength-simulator](password-strength-simulator/) — cosa rende davvero difficile indovinare una password — e cosa, sorprendentemente, non basta.
- [arp-explorer](arp-explorer/) — scopri come un dispositivo trova il MAC associato a un IP sulla rete locale — una domanda in broadcast, una risposta di chi lo possiede.
- [firewall-rules-explorer](firewall-rules-explorer/) — un pacchetto testato contro una lista di regole, che si ferma alla prima corrispondenza — e come l'ordine può vanificare una regola più specifica.
- [load-balancer-explorer](load-balancer-explorer/) — le stesse richieste distribuite su 3 server con due strategie a confronto, per vedere cosa succede quando una richiesta dura più delle altre.
- [cdn-cache-explorer](cdn-cache-explorer/) — guarda una richiesta viaggiare fino all'origine la prima volta, e tornare quasi istantanea dalla cache le volte successive — finché non scade.

### 🔢 Logica

- [logic-gates-simulator](logic-gates-simulator/) — accendi e spegni gli input e guarda come ogni porta logica (AND, OR, NOT, XOR...) decide l'output.
- [finite-state-machine-explorer](finite-state-machine-explorer/) — un semaforo e un distributore automatico, per capire come un sistema cambia stato in risposta agli eventi.
- [binary-adder-simulator](binary-adder-simulator/) — come poche porte logiche, messe insieme, riescono a fare un'addizione — un bit alla volta.
- [regex-automaton-explorer](regex-automaton-explorer/) — dietro ogni espressione regolare c'è un vero automa a stati: guardalo "pensare" un carattere alla volta.
- [turing-machine-explorer](turing-machine-explorer/) — un nastro, una testina e una tabella di regole: il modello con cui si definisce cosa significa "calcolabile".
- [karnaugh-map-explorer](karnaugh-map-explorer/) — clicca una tabella di verità e guarda un'espressione booleana minimizzarsi dal vivo, con i raggruppamenti colorati sulla mappa.

### 🖥️ Hardware

- [pc-assembly-simulator](pc-assembly-simulator/) — monta e smonta virtualmente un PC, componente per componente, con stile schematico/realistico e una modalità quiz.
- [pascalina-simulator](pascalina-simulator/) — nel 1642 una macchina sommava girando ruote dentate: guarda scattare il riporto quando una ruota passa da 9 a 0.
- [cpu-cycle-explorer](cpu-cycle-explorer/) — una CPU giocattolo esegue davvero un programma, fase per fase: preleva l'istruzione, capisce cosa significa, ne esegue l'effetto.
- [cache-memory-explorer](cache-memory-explorer/) — una cache reale a mappatura diretta: guarda hit e miss cambiare a seconda di quanto un programma riusa gli indirizzi vicini.

### 🧮 Algoritmi

- [sorting-algorithm-visualizer](sorting-algorithm-visualizer/) — guarda bubble, selection, insertion e quick sort confrontare e scambiare valori, un passo alla volta.
- [pathfinding-visualizer](pathfinding-visualizer/) — disegna dei muri su una griglia e guarda BFS e DFS esplorarla alla ricerca di un percorso.
- [recursion-tree-visualizer](recursion-tree-visualizer/) — guarda una funzione ricorsiva (fattoriale, Fibonacci) scomporsi in chiamate più piccole, un passo alla volta.
- [complexity-growth-explorer](complexity-growth-explorer/) — sei classi di complessità a confronto, da O(1) a O(2ⁿ), e perché la differenza conta moltissimo.
- [game-of-life-explorer](game-of-life-explorer/) — quattro regole semplicissime, applicate a milioni di celle, bastano a generare comportamenti complessi.
- [dijkstra-shortest-path-explorer](dijkstra-shortest-path-explorer/) — erba, fango, acqua, muri: guarda l'algoritmo trovare sempre il percorso di costo totale più basso, non quello con meno passi.
- [manhattan-distance-explorer](manhattan-distance-explorer/) — sposta due punti su una griglia e confronta la distanza "a isolati" con quella in linea d'aria.

### 🗂️ Strutture dati

- [stack-queue-visualizer](stack-queue-visualizer/) — due modi diversi di accumulare ed estrarre elementi: chi esce per primo, l'ultimo arrivato o il primo?
- [binary-search-tree-visualizer](binary-search-tree-visualizer/) — inserisci numeri e guarda una struttura che tiene tutto ordinato e permette di cercare senza controllare ogni elemento.
- [hash-table-visualizer](hash-table-visualizer/) — come trovare un dato in un colpo solo, quasi sempre — e cosa succede quando due chiavi diverse finiscono nello stesso posto.
- [git-branching-explorer](git-branching-explorer/) — il grafo dei commit, un branch alla volta: cosa succede davvero con commit, branch, checkout e merge.
- [priority-queue-heap-explorer](priority-queue-heap-explorer/) — un min-heap binario, come array e come albero allo stesso tempo: guarda inserimento ed estrazione del minimo passo per passo.
- [trie-explorer](trie-explorer/) — la struttura dati dietro l'autocompletamento: digita un prefisso e guarda il percorso corrispondente illuminarsi dal vivo.

### 🗄️ Basi di dati

- [sql-query-explorer](sql-query-explorer/) — scrivi una query su un piccolo database di studenti e voti, ed eseguila davvero: un motore SQL scritto da zero la interpreta ed esegue riga per riga.
- [er-diagram-explorer](er-diagram-explorer/) — tre scenari, ciascuno con una relazione 1:1, una 1:N e una N:M: clicca su una cardinalità per scoprire le tabelle SQL che ne derivano.
- [normalization-explorer](normalization-explorer/) — una tabella piena di dati ripetuti nasconde tre anomalie: guardale dal vivo, poi scomponila passo passo in tabelle separate.
- [index-btree-explorer](index-btree-explorer/) — confronta, contando i confronti reali, una scansione riga per riga con una ricerca guidata da un piccolo albero B.
- [transazioni-acid-explorer](transazioni-acid-explorer/) — due sportelli prelevano dallo stesso conto quasi insieme: guarda un aggiornamento perdersi senza transazioni, e come le transazioni lo evitano.
- [database-locking-explorer](database-locking-explorer/) — due bonifici in direzioni opposte possono aspettarsi a vicenda per sempre — e un ordine di lock coerente lo previene del tutto.
- [query-plan-explorer](query-plan-explorer/) — regola quante righe soddisfano una condizione e guarda il pianificatore scegliere tra scansione completa e ricerca indicizzata.
- [replication-explorer](replication-explorer/) — scrivi sul primario e guarda la modifica propagarsi alle repliche in ritardo — e cosa succede a leggere da una replica troppo presto.

## Come contribuire un nuovo progetto

1. Crea una nuova sottocartella con un nome descrittivo in kebab-case (es. `nome-progetto/`).
2. Aggiungi al suo interno un `README.md` che spieghi cosa fa il progetto, come avviarlo e quali concetti didattici illustra.
3. Aggiungi una riga nell'elenco "Progetti" qui sopra, sotto l'argomento giusto (o creane uno nuovo se non esiste ancora).
4. Aggiungi una card corrispondente nella pagina dell'argomento (o del sotto-argomento, per le categorie divise) in [topics/](topics/) e aggiorna il conteggio progetti nella pagina padre — o crea una nuova pagina argomento + una card per essa in [index.html](index.html), se il progetto apre un argomento nuovo.

## Licenza

Il repository è distribuito con licenza [MIT](LICENSE).
