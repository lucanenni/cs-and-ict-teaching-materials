# Indirizzamento IP e subnetting

Uno strumento interattivo che mostra come un indirizzo IPv4 si divide in una parte "di rete" e una "di host" — e cosa significa concretamente scrivere un prefisso come /24.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Scrivendo un indirizzo IP e un prefisso CIDR (/0-/32), la pagina calcola dal vivo maschera di sottorete, indirizzo di rete, indirizzo di broadcast, primo/ultimo host utilizzabile e numero di host disponibili.
- I 32 bit dell'indirizzo sono disegnati uno per uno, colorati in base a se appartengono alla parte di rete (fissa per tutta la sottorete) o alla parte di host — la posizione del confine si sposta in tempo reale muovendo lo slider del prefisso.
- Un secondo indirizzo permette di verificare se due dispositivi si trovano nella stessa sottorete (stesso indirizzo di rete) o in sottoreti diverse.

## Concetti didattici illustrati

- **Struttura di un indirizzo IPv4**: 32 bit divisi in parte di rete e parte di host.
- **Maschera di sottorete / notazione CIDR**: due modi equivalenti di esprimere lo stesso confine tra le due parti.
- **Indirizzo di rete e di broadcast**: perché non tutti gli indirizzi in una sottorete sono assegnabili a un dispositivo.
- **Instradamento locale**: perché due dispositivi nella stessa sottorete comunicano direttamente, mentre serve un router se sono in sottoreti diverse.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — aritmetica su interi a 32 bit per calcolare maschera, rete, broadcast e range di host

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
