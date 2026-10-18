# SQL injection: perché non si concatenano mai gli input in una query

Un login simulato, completamente lato client, che mostra perché concatenare direttamente l'input dell'utente dentro una query SQL è pericoloso — e come i parametri/placeholder eliminano il problema alla radice.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un piccolo form di login (nome utente e password) collegato a una tabellina finta di 3 utenti tenuta in memoria — nessun vero database, nessuna query reale: tutto è JavaScript che costruisce una stringa e poi valuta se "autentica" qualcuno.
- **Modalità concatenata (vulnerabile)**: la query viene mostrata come verrebbe costruita incollando letteralmente l'input nella stringa SQL. Un pulsante compila i campi con un tentativo classico (`' OR '1'='1' --`): la pagina mostra passo-passo come cambia la clausola WHERE effettivamente valutata e perché l'accesso viene concesso senza nessuna password valida.
- **Modalità parametrizzata (sicura)**: lo stesso identico input viene invece passato come valore separato (placeholder `$1`/`$2`), mai interpretato come sintassi SQL. Lo stesso tentativo di attacco qui non trova nessuna corrispondenza e il login fallisce correttamente.
- Un selettore per passare tra le due modalità con lo stesso input, per un confronto diretto.

## Concetti didattici illustrati

- **SQL injection**: come un input non trattato come dato puro può alterare la struttura logica di una query.
- **Query parametrizzate**: perché separare sintassi e dati fin dall'inizio elimina il problema, invece di limitarsi a renderlo "più difficile".
- **Perché il filtraggio manuale dell'input non è una soluzione affidabile** (approfondito nel pannello dedicato).

## Nota sulla correttezza

Le funzioni `evaluateConcatenatedQuery` e `evaluateParameterizedQuery` sono state verificate in Node (non incluso nel progetto pubblicato) su tre casi: credenziali corrette (autenticazione riuscita in entrambe le modalità), password sbagliata (fallita correttamente in entrambe) e un tentativo di SQL injection (`' OR '1'='1' --`), che in modalità concatenata autentica l'accesso senza alcuna password valida, mentre in modalità parametrizzata viene correttamente bloccato con zero corrispondenze.

## Nota di sicurezza

Questa è una simulazione didattica isolata lato client: nessun database reale, nessun server, nessuna query realmente eseguita contro un sistema vero è coinvolto in nessun punto del codice (vedi il commento in testa a [script.js](script.js)).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica delle due modalità di valutazione della query

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
