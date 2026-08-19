# Sommatore binario

Uno strumento interattivo che collega due argomenti già trattati separatamente in questa raccolta — le porte logiche e la rappresentazione binaria dei numeri — mostrando come poche porte, messe insieme nel modo giusto, riescano davvero a fare un'addizione.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

**1. Semisommatore**
- Due porte (XOR per la somma, AND per il riporto) sommano due singoli bit A e B, con tabella di verità a 4 righe.

**2. Sommatore completo**
- Aggiunge un riporto in ingresso (Cin) ai due bit A e B, per poter essere concatenato ad altri sommatori. I 5 passi mostrati corrispondono esattamente ai due semisommatori interni più la porta OR finale che li unisce, con tabella di verità a 8 righe.

**3. Somma di due numeri**
- Componi due numeri binari a 4 bit e guarda l'addizione propagarsi colonna per colonna, dalla meno significativa (a destra) alla più significativa (a sinistra), con il riporto in uscita di ogni colonna che diventa il riporto in ingresso della successiva.
- Se il riporto trabocca oltre l'ultima colonna, la pagina lo segnala esplicitamente come **overflow**, mostrando sia il risultato matematico corretto sia il valore (sbagliato) che si otterrebbe con lo spazio a disposizione.

## Concetti didattici illustrati

- **Composizione di circuiti**: circuiti complessi si costruiscono combinando circuiti più semplici già noti (qui, sommatori completi fatti di semisommatori).
- **Riporto (carry)**: lo stesso meccanismo dell'addizione in colonna a mano, applicato al binario.
- **Overflow**: cosa succede quando un risultato non ci sta nello spazio di bit disponibile — un problema reale e concreto in ogni linguaggio di programmazione con interi a dimensione fissa.
- Collegamento diretto con [logic-gates-simulator](../logic-gates-simulator/) (le singole porte) e [binary-number-explorer](../binary-number-explorer/) (la rappresentazione binaria dei numeri).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia, incluso il linguaggio visivo dei circuiti (porte, fili, interruttori) condiviso con logic-gates-simulator
- [script.js](script.js) — logica di semisommatore, sommatore completo e sommatore a più bit (incluse le fasi dell'animazione a riporto propagante)

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
