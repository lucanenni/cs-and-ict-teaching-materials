# CS and ICT teaching materials

Una raccolta di piccoli progetti didattici, pensati per spiegare concetti di informatica e IA a studenti delle scuole superiori. Ogni progetto è indipendente, statico (HTML/CSS/JS senza build tool, salvo diversa indicazione) e vive nella propria sottocartella con un proprio README.

🔗 **Indice online (GitHub Pages):** https://lucanenni.github.io/cs-and-ict-teaching-materials/

## Progetti

- [llm-token-visualizer](llm-token-visualizer/) — simulatore che mostra come un LLM genera testo un token alla volta, con probabilità e percorsi alternativi.
- [artificial-neuron-simulator](artificial-neuron-simulator/) — simulazione interattiva di un neurone artificiale: input pesati, bias e funzioni di attivazione.
- [perceptron-learning-simulator](perceptron-learning-simulator/) — un percettrone che impara da solo, un aggiornamento alla volta, a separare due classi di punti.
- [attention-visualizer](attention-visualizer/) — mostra a quali parole di una frase un modello "presta attenzione" per costruirne il significato.
- [word-embedding-explorer](word-embedding-explorer/) — esplora la somiglianza tra parole e le analogie vettoriali (es. re − uomo + donna = regina).
- [bias-in-data-simulator](bias-in-data-simulator/) — mostra come un modello impari a ripetere un'ingiustizia presente nei propri dati di addestramento.
- [rules-vs-ai-chatbot](rules-vs-ai-chatbot/) — due chatbot a confronto: uno a regole rigide, uno probabilistico simulato — con una vera allucinazione "in diretta".

## Come contribuire un nuovo progetto

1. Crea una nuova sottocartella con un nome descrittivo in kebab-case (es. `nome-progetto/`).
2. Aggiungi al suo interno un `README.md` che spieghi cosa fa il progetto, come avviarlo e quali concetti didattici illustra.
3. Aggiungi una riga nell'elenco "Progetti" qui sopra.
4. Aggiungi una card corrispondente in [index.html](index.html), la home page pubblicata su GitHub Pages.

## Licenza

Il repository è distribuito con licenza [MIT](LICENSE).
