# L'effetto valanga di un hash

Cambia anche un solo carattere in un testo e guarda il suo hash SHA-256 diventare completamente diverso — l'"effetto valanga" che rende gli hash utili per verificare l'integrità di file e password.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Due caselle di testo, quasi identiche di default: il loro hash SHA-256 (64 cifre esadecimali) si calcola e si mostra dal vivo.
- Ogni cifra dell'hash è colorata in verde se coincide con la stessa posizione nell'altro hash, in rosso se no — visivamente, quasi tutto rosso, anche quando i testi differiscono per un solo carattere.
- Una percentuale di coincidenza tra i due hash, con una nota sul perché anche testi completamente diversi condividono per puro caso circa il 6% delle cifre.
- Alcuni esempi pronti: una piccola differenza di punteggiatura, una cifra diversa in un numero, e — per contrasto — due testi identici (che producono lo stesso identico hash).

## Concetti didattici illustrati

- Le **funzioni hash crittografiche**: trasformano un ingresso di lunghezza qualsiasi in un'uscita di lunghezza fissa, sempre la stessa per lo stesso ingresso.
- L'**effetto valanga**: una proprietà chiave delle buone funzioni hash, per cui piccolissime differenze in ingresso producono uscite completamente diverse e imprevedibili.
- Applicazioni pratiche: verifica dell'integrità di un file scaricato, memorizzazione sicura delle password (mai in chiaro), collegamento tra i blocchi di una blockchain.

## Nota tecnica

L'hash è calcolato con l'API standard del browser `crypto.subtle.digest` (Web Crypto API), non con un'implementazione fatta a mano: è quindi un vero SHA-256, identico a quello che produrrebbe qualunque altro strumento.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — calcolo asincrono degli hash e confronto carattere per carattere

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
