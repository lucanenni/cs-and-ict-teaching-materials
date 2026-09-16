# Porte logiche

Accendi e spegni gli input di una porta logica (AND, OR, NOT, XOR, NAND, NOR) e guarda l'output cambiare dal vivo, con la tabella di verità completa sempre visibile e la riga corrente evidenziata — più un piccolo circuito a due porte per vedere come si combinano.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un menu per scegliere tra le sei porte logiche di base (AND, OR, NOT, XOR, NAND, NOR).
- Interruttori per ogni input: il circuito e l'indicatore di output si aggiornano dal vivo.
- La tabella di verità completa della porta scelta, con la riga corrispondente alla combinazione di input attuale sempre evidenziata.
- Un esempio di **circuito combinato** — `(A AND B) OR C` — per vedere come due porte semplici collegate in sequenza costruiscono un comportamento più complesso.

## Concetti didattici illustrati

- Le **porte logiche di base** come mattoni fondamentali di ogni circuito digitale e, in ultima analisi, di ogni computer.
- La **tabella di verità** come modo sistematico per descrivere il comportamento di una funzione logica.
- Come porte semplici si **combinano** per costruire funzioni logiche più complesse.
- Perché NAND e NOR sono porte speciali: da sole bastano a costruire qualunque altro circuito logico.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — definizione delle porte logiche, disegno del circuito e generazione della tabella di verità

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
