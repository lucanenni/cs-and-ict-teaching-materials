# VPN e tunneling: due reti private collegate attraverso Internet

Un esploratore interattivo di come una VPN site-to-site collega due reti private geograficamente lontane attraverso Internet pubblico. Mostra passo per passo l'incapsulamento e la cifratura di un pacchetto da parte dei gateway VPN, cosa vede davvero un osservatore sul tratto pubblico del tunnel, e perché lo stesso pacchetto, inviato senza VPN, viene semplicemente scartato.

Fa parte della raccolta [cs-and-ict-teaching-materials](../README.md).

## Come si usa

Il progetto è statico, non richiede build né server: basta aprire [index.html](index.html) nel browser.

In alternativa, da questa cartella:

```bash
python3 -m http.server 8000
```

e poi visita `http://localhost:8000`.

## Cosa mostra

- **Scenario con VPN**: un PC dell'Ufficio A (192.168.1.10) manda un pacchetto a un PC dell'Ufficio B (192.168.2.20). Passo per passo: il pacchetto con IP privati arriva al gateway VPN di A; il gateway lo incapsula dentro un nuovo pacchetto cifrato con gli IP pubblici dei due gateway; il pacchetto incapsulato viaggia su Internet pubblico (un riquadro dedicato mostra esattamente cosa vedrebbe un osservatore su questo tratto: solo gli IP pubblici e dati cifrati, mai gli indirizzi privati o il contenuto reale); il gateway VPN di B decifra e decapsula, recuperando il pacchetto originale intatto; il pacchetto arriva al PC di destinazione con gli IP privati originali.
- **Scenario senza VPN**: lo stesso PC prova a mandare un pacchetto con lo stesso indirizzo privato di destinazione direttamente su Internet, senza alcun incapsulamento. Il pacchetto viene scartato perché un indirizzo privato non è instradabile su Internet pubblico — lo stesso motivo per cui un singolo dispositivo privato ha bisogno del NAT per uscire su Internet da solo.
- Entrambi gli scenari si eseguono passo per passo, con "▶ Avvia" (animazione automatica) o "Passo singolo →" (un passo alla volta), e si possono far ripartire con "↺ Ricomincia".

## Concetti didattici illustrati

- **Incapsulamento**: un pacchetto privato viene "avvolto" dentro un nuovo pacchetto con intestazione pubblica, che Internet sa instradare normalmente.
- **Cifratura del tunnel**: oltre a incapsulare, la VPN cifra il contenuto, così chi intercetta il traffico sul tratto pubblico non può leggere né gli indirizzi privati né i dati reali.
- **Due reti private che "sembrano" la stessa LAN**: grazie al tunnel, i dispositivi delle due reti si parlano usando i propri IP privati come se fossero sulla stessa rete locale, anche se sono separati da tutto Internet.
- **Indirizzi privati non instradabili**: senza un tunnel (o un NAT), un pacchetto con IP privato di destinazione non può attraversare Internet pubblico — i router di Internet non saprebbero dove mandarlo.

## Nota sulla correttezza

Le funzioni `encapsulate`, `decapsulate` e `observerView` sono state verificate a parte con uno script Node (non incluso nel progetto pubblicato) su più combinazioni di indirizzi: `decapsulate(encapsulate(pacchetto))` restituisce sempre il pacchetto originale invariato, e la vista dell'osservatore su un pacchetto incapsulato non contiene mai, in nessun caso testato, gli indirizzi privati originali né i dati reali — solo gli IP pubblici dei gateway e la stringa di dati cifrati. È stata verificata anche la funzione `isPrivateIp` sui range privati (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) contro alcuni IP pubblici, incluso il caso limite 172.32.0.0 (fuori dal range privato 172.16-172.31, correttamente classificato come pubblico).

## Struttura dei file

- [index.html](index.html) — markup della pagina
- [style.css](style.css) — stile dell'interfaccia
- [script.js](script.js) — logica di incapsulamento/decapsulamento e animazione dei due scenari

## Licenza

Vedi la [LICENSE](../LICENSE) del repository principale.
