# CS and ICT teaching materials

Una raccolta di piccoli progetti didattici, pensati per spiegare concetti di informatica e IA a studenti delle scuole superiori. Ogni progetto è indipendente, statico (HTML/CSS/JS senza build tool, salvo diversa indicazione) e vive nella propria sottocartella con un proprio README.

🔗 **Indice online (GitHub Pages):** https://lucanenni.github.io/cs-and-ict-teaching-materials/

L'indice online è organizzato per argomento: la home page mostra le categorie, ciascuna con una propria sotto-pagina in [topics/](topics/) che elenca i progetti corrispondenti. Qui sotto trovi l'elenco completo, piatto, per riferimento rapido.

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

### 🌐 Reti e sicurezza

- [network-packet-journey](network-packet-journey/) — cosa succede davvero, passo dopo passo, quando il browser carica un sito: dal DNS al server e ritorno.
- [caesar-cipher-explorer](caesar-cipher-explorer/) — cifra e decifra messaggi a mano, poi guarda quanto è facile romperli per forza bruta.
- [hash-avalanche-explorer](hash-avalanche-explorer/) — cambia un solo carattere in un testo e guarda il suo hash SHA-256 diventare completamente diverso.

### 🔢 Logica

- [logic-gates-simulator](logic-gates-simulator/) — accendi e spegni gli input e guarda come ogni porta logica (AND, OR, NOT, XOR...) decide l'output.
- [finite-state-machine-explorer](finite-state-machine-explorer/) — un semaforo e un distributore automatico, per capire come un sistema cambia stato in risposta agli eventi.

### 🖥️ Hardware

- [pc-assembly-simulator](pc-assembly-simulator/) — monta e smonta virtualmente un PC, componente per componente, con stile schematico/realistico e una modalità quiz.

### 🧮 Algoritmi

- [sorting-algorithm-visualizer](sorting-algorithm-visualizer/) — guarda bubble, selection, insertion e quick sort confrontare e scambiare valori, un passo alla volta.
- [pathfinding-visualizer](pathfinding-visualizer/) — disegna dei muri su una griglia e guarda BFS e DFS esplorarla alla ricerca di un percorso.
- [recursion-tree-visualizer](recursion-tree-visualizer/) — guarda una funzione ricorsiva (fattoriale, Fibonacci) scomporsi in chiamate più piccole, un passo alla volta.

## Come contribuire un nuovo progetto

1. Crea una nuova sottocartella con un nome descrittivo in kebab-case (es. `nome-progetto/`).
2. Aggiungi al suo interno un `README.md` che spieghi cosa fa il progetto, come avviarlo e quali concetti didattici illustra.
3. Aggiungi una riga nell'elenco "Progetti" qui sopra, sotto l'argomento giusto (o creane uno nuovo se non esiste ancora).
4. Aggiungi una card corrispondente nella pagina dell'argomento in [topics/](topics/) (o crea una nuova pagina argomento + una card per essa in [index.html](index.html), se il progetto apre un argomento nuovo).

## Licenza

Il repository è distribuito con licenza [MIT](LICENSE).
