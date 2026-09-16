# Strategie di backup

Uno strumento interattivo che confronta backup completo, incrementale e differenziale sugli stessi dati, con numeri concreti su spazio occupato e costo di ripristino — non solo definizioni astratte — più un verificatore interattivo della classica regola del 3-2-1.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Un verificatore della **regola del 3-2-1**: indica quante copie hai, quali tipi di supporto usi e se una copia è fuori sede, e la pagina ti dice se la tua configurazione la soddisfa (e cosa manca, se non la soddisfa).
- Una settimana simulata di modifiche a 6 file (sempre lo stesso schema, per poter confrontare le tre strategie sugli stessi identici dati): sposta lo slider del giorno e guarda quali file cambiano.
- Una tabella mostra, giorno per giorno, quanti file backup completo/incrementale/differenziale copierebbero, più quanti backup (e quanti file in totale) servirebbero per ripristinare lo stato di quel giorno con ciascuna strategia.

## Concetti didattici illustrati

- **Compromesso spazio/tempo di ripristino**: il backup completo è il più semplice da ripristinare ma il più pesante; l'incrementale è il più leggero giorno per giorno ma il più lento da ripristinare (serve l'intera catena); il differenziale sta nel mezzo.
- **La regola del 3-2-1** come standard pratico, verificabile con criteri oggettivi invece che a sensazione.

## Verifica dei calcoli

Lo schema di modifiche è deterministico (non casuale), proprio per poter verificare i numeri a mano: con lo schema usato, le dimensioni giorno per giorno sono incrementale = [6,2,1,3,1,2,1] e differenziale = [6,2,3,5,5,6,6], per un totale settimanale di 42 file (completo), 16 (incrementale) e 33 (differenziale) — verificato sia con un calcolo indipendente in Node sia dal vivo nella pagina.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — simulazione delle tre strategie di backup e verifica della regola 3-2-1

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
