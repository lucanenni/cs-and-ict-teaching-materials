# IP pubblico e IP privato

Un classificatore reale di indirizzi IPv4 (privato, pubblico, loopback, link-local, CGNAT) più una simulazione interattiva del NAT: tre dispositivi domestici, un solo router, un solo indirizzo pubblico.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un classificatore che, dato un indirizzo IPv4, dice se è **privato** (RFC 1918), **pubblico**, **loopback**, **link-local** o **condiviso/CGNAT** (RFC 6598), con l'intervallo esatto che lo determina.
- Una tabella di **confronto diretto** (chi assegna l'indirizzo, unicità, visibilità, se cambia nel tempo, effetto sulla sicurezza, quantità disponibile, uso tipico) tra IP pubblico e IP privato.
- Una simulazione di **NAT** (Network Address Translation): tre dispositivi con indirizzo privato ("Invia richiesta") condividono lo stesso indirizzo pubblico del router — la tabella di traduzione mostra come ogni richiesta riceva una porta pubblica diversa, e cosa vede davvero il server esterno.
- Una sezione di **domande pratiche**: come si trova il proprio IP privato e pubblico, perché l'IP pubblico può cambiare (dinamico vs statico), e come raggiungere da fuori casa un dispositivo con IP privato (port forwarding, VPN).

## Nota sulla correttezza

Gli intervalli usati sono quelli ufficiali: RFC 1918 (indirizzi privati), RFC 6598 (spazio condiviso per il CGNAT), il blocco di loopback 127.0.0.0/8 e quello link-local 169.254.0.0/16 — verificati via ricerca prima dell'implementazione. La logica di confronto CIDR è stata verificata in Node su 24 casi limite (il primo e l'ultimo indirizzo di ogni intervallo, e l'indirizzo appena fuori da ogni lato) prima di essere inserita in pagina. L'indirizzo pubblico del router nella simulazione (203.0.113.45) usa l'intervallo RFC 5737 riservato alla documentazione — non è un indirizzo reale. La cifra "circa 17,9 milioni di indirizzi privati" nella tabella di confronto è la somma esatta delle tre dimensioni RFC 1918 (2²⁴ + 2²⁰ + 2¹⁶).

## Concetti didattici illustrati

- **Perché esistono indirizzi "privati"**: milioni di reti diverse possono riusare lo stesso indirizzo (es. 192.168.1.1) senza conflitti, perché non lasciano mai la rete locale.
- **NAT**: come un router traduce indirizzo e porta privati in indirizzo e porta pubblici, e come usa una tabella per instradare correttamente le risposte in arrivo.
- **Esaurimento di IPv4 e CGNAT** (approfondito nel pannello dedicato): perché il NAT è nato, perché non basta più da solo per alcuni operatori, e perché la soluzione a lungo termine è IPv6.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — classificatore CIDR e simulazione della tabella NAT

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
