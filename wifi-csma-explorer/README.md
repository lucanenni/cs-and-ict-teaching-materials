# Wi-Fi e CSMA/CA

Un esploratore interattivo di come più dispositivi Wi-Fi si dividono lo stesso canale radio senza parlarsi tra loro: ascolto del canale, attesa casuale (backoff) e cosa succede quando due dispositivi vogliono trasmettere nello stesso momento.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- Fino a 4 dispositivi (Laptop, Smartphone, Smart TV, Console) disegnati intorno a un canale Wi-Fi condiviso, non a un cavo: la radio è un mezzo broadcast, non punto a punto.
- Caselle di controllo per scegliere quali dispositivi "vogliono trasmettere" in questo scenario; cambiando la selezione si genera subito un nuovo scenario.
- Simulazione passo-passo di CSMA/CA, slot per slot: ogni dispositivo che vuole trasmettere ascolta il canale, sceglie un'attesa casuale (backoff), e aspetta che il conto alla rovescia arrivi a zero a canale libero prima di trasmettere davvero.
- Se durante l'attesa un altro dispositivo inizia a trasmettere, il conto alla rovescia si blocca: il dispositivo aspetta che il canale torni libero e riparte con un backoff nuovo e più lungo (la finestra di contesa raddoppia a ogni tentativo, come nell'802.11 reale).
- Un riquadro in evidenza spiega perché il Wi-Fi non può usare CSMA/CD (rilevamento collisione) come l'Ethernet via cavo: una radio half-duplex non riesce ad ascoltare il canale mentre trasmette lei stessa, quindi deve evitare la collisione in anticipo invece di rilevarla a posteriori.
- Con 2 o più dispositivi selezionati si vede, passo dopo passo, come backoff casuali diversi fanno quasi sempre trasmettere un dispositivo alla volta — e, più raramente, cosa succede nel caso limite in cui due backoff coincidono (collisione vera).
- "Passo singolo →" e "▶ Avvia" (con pausa automatica a fine scenario), più "🔀 Nuovo scenario" per generarne un altro con la stessa selezione di dispositivi.

## Concetti didattici illustrati

- **CSMA/CA vs CSMA/CD**: perché l'Ethernet via cavo può rilevare una collisione mentre avviene, e perché una radio Wi-Fi half-duplex non può, e deve quindi *evitarla* invece di *rilevarla*.
- **Carrier sense**: ascoltare il canale prima di trasmettere, ma senza che basti da solo a evitare le collisioni.
- **Backoff casuale ed esponenziale**: perché l'attesa è casuale (per non far ripartire tutti insieme) e perché si allunga a ogni tentativo andato male (per rendere sempre più improbabile una nuova collisione quando il canale è conteso).
- **Mezzo condiviso**: il canale radio è un'unica risorsa che tutti i dispositivi nel raggio si dividono, a differenza di un cavo dedicato punto a punto.

## Nota sulla correttezza

La logica della simulazione (`buildScenario` in `script.js`) è stata verificata a parte in Node su 600 esecuzioni casuali (2, 3 e 4 dispositivi, 200 semi diversi ciascuna): in nessun caso due trasmissioni si sovrappongono nel tempo, ogni dispositivo che vuole trasmettere ci riesce sempre, e la simulazione termina sempre entro un numero ragionevole di slot.

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia e del diagramma a canale condiviso
- [script.js](script.js) — simulazione di CSMA/CA e logica dell'animazione

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
