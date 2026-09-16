# Crittografia a chiave pubblica

Uno strumento interattivo che spiega **come funziona** la crittografia a chiave pubblica (asimmetrica) — non un algoritmo specifico come RSA, ma il meccanismo concettuale che sta dietro sia alla cifratura di un messaggio sia alla firma digitale.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

**Modalità "Messaggio segreto"**
- Bob genera una coppia di chiavi: una serratura pubblica (che pubblica apertamente) e una chiave privata (che tiene solo per sé).
- Alice chiude un messaggio con la serratura pubblica di Bob — una volta chiusa, nemmeno lei può più riaprirla.
- Il messaggio chiuso viaggia sul canale pubblico (Eve lo vede, ma non può aprirlo) fino a Bob, l'unico che possiede la chiave privata corrispondente.

**Modalità "Firma digitale"**
- Mostra il meccanismo esattamente opposto: Alice firma un messaggio con la **propria chiave privata**, e chiunque può verificare quella firma con la sua chiave **pubblica**, già nota a tutti.
- Una firma valida garantisce sia l'autenticità (viene davvero da Alice) sia l'integrità (nessuno l'ha alterato).

Un riquadro di confronto contrappone la crittografia simmetrica (una sola chiave condivisa, veloce ma serve scambiarla in segreto in anticipo — il problema risolto da [diffie-hellman-explorer](../diffie-hellman-explorer/)) a quella asimmetrica, e spiega come nella pratica (es. HTTPS) si usino insieme.

## Concetti didattici illustrati

- **Coppia di chiavi asimmetriche**: due chiavi collegate matematicamente ma con ruoli complementari e non intercambiabili.
- **Due usi distinti e complementari**: cifratura (chiave pubblica chiude, privata apre) e firma digitale (chiave privata firma, pubblica verifica) — la direzione delle chiavi si inverte tra i due casi, un punto spesso confuso che questa pagina rende esplicito mettendoli a confronto diretto.
- **Perché risolve il problema dello scambio di chiavi**: niente segreto da concordare in anticipo, a differenza della crittografia simmetrica.
- **Funzioni unidirezionali**: lo stesso principio già visto in [diffie-hellman-explorer](../diffie-hellman-explorer/) — un'operazione facile da fare in un verso e difficile da invertire senza un'informazione aggiuntiva.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — definizione dei passi delle due scene (messaggio segreto e firma digitale) e logica di riproduzione passo-passo

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
