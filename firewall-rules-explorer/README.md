# Regole firewall: l'ordine conta

Un esploratore interattivo delle liste di regole firewall (ACL): guarda un pacchetto testato contro le regole in ordine, fermandosi alla prima che corrisponde — e scopri come una regola "ALLOW" troppo generica, messa nel posto sbagliato, può vanificare una regola "DENY" più specifica scritta subito dopo.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Cinque regole di esempio (con supporto reale alla notazione CIDR, es. `192.168.1.0/24`), riordinabili con le frecce su/giù.
- Cinque pacchetti di prova selezionabili, con l'animazione passo-passo (regola per regola, o "valuta tutte insieme") di come il firewall li testa.
- Il caso chiave: un pacchetto da un IP "sospetto" sulla porta 443 viene **consentito** nell'ordine iniziale delle regole, perché una regola `ALLOW` generica sulla porta 443 lo intercetta prima della regola `DENY` specifica per quell'IP. Riordinando le regole (portando il `DENY` più in alto) e ritestando lo stesso pacchetto, il risultato cambia in tempo reale.

## Concetti didattici illustrati

- **Valutazione in ordine, "prima corrispondenza vince"**: le regole successive a un match non vengono nemmeno guardate.
- **Politica predefinita ("default deny")**: cosa succede quando nessuna regola corrisponde.
- **Perché l'ordine delle regole è parte della sicurezza tanto quanto le regole stesse** (approfondito nel pannello dedicato), e perché i firewall a lista non riordinano automaticamente per specificità.

## Nota sulla correttezza

Le funzioni di confronto IP/CIDR (`ipToInt`, `ipMatches`) sono state verificate in Node (non incluso nel progetto pubblicato) su casi limite: prefissi `/0`, `/24`, `/32`, indirizzi ai bordi di una sottorete, IP esatti senza CIDR e il valore speciale `any`. La valutazione delle regole è stata verificata su tutti e cinque i pacchetti di prova nell'ordine iniziale, e sullo scenario di riordinamento chiave (spostare la regola `DENY` sull'IP sospetto in cima capovolge correttamente l'esito da `ALLOW` a `DENY`).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — regole, confronto CIDR, valutazione passo-passo e riordinamento

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
