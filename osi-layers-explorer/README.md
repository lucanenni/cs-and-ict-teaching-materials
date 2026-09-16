# Incapsulamento a strati (OSI / TCP-IP)

Un esploratore interattivo dell'incapsulamento di rete: scrivi un messaggio e guardalo scendere la pila a 5 livelli del modello TCP/IP, guadagnando un header a ogni passo, per poi risalire sul destinatario perdendoli uno alla volta, nell'ordine esattamente contrario.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un messaggio scritto a mano e un protocollo di trasporto scelto (TCP o UDP, con la relativa differenza spiegata nel testo).
- I 5 livelli del modello TCP/IP (Applicazione, Trasporto, Rete, Collegamento, Fisico), con quello attivo evidenziato passo dopo passo.
- Una barra che mostra esattamente cosa sta "viaggiando" in quel momento: cresce di un header colorato a ogni livello disceso, diventa un'unica striscia di bit al livello Fisico, e si restringe di nuovo salendo sul destinatario, fino a riconsegnare il messaggio originale intatto.
- Un interruttore per mostrare anche la corrispondenza tra i 5 livelli TCP/IP e i 7 livelli del modello OSI.

## Concetti didattici illustrati

- **Incapsulamento e decapsulamento**: ogni livello aggiunge un proprio header senza conoscere il contenuto di quello che avvolge, e il destinatario lo rimuove nell'ordine inverso.
- **La responsabilità di ciascun livello**: porte (Trasporto), indirizzi IP e instradamento tra reti diverse (Rete), indirizzi MAC nella rete locale (Collegamento).
- **La relazione tra modello OSI e modello TCP/IP** (approfondito nel pannello dedicato): perché uno ha 7 livelli e l'altro 5, e perché si studiano entrambi.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — generazione dei passi di incapsulamento/decapsulamento e disegno della barra dei segmenti

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
