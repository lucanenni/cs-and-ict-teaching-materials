// ===== Esempio 1: Semaforo (ciclo fisso, un solo tipo di evento) =====
const TRAFFIC_STATES = [
    { id: 'rosso', label: 'Rosso', icon: '🔴', color: '#dc2626' },
    { id: 'verde', label: 'Verde', icon: '🟢', color: '#16a34a' },
    { id: 'giallo', label: 'Giallo', icon: '🟡', color: '#eab308' }
];
let trafficIndex = 0;

function renderTraffic() {
    const row = document.getElementById('trafficStatesRow');
    row.innerHTML = '';
    TRAFFIC_STATES.forEach((s, i) => {
        const active = i === trafficIndex;
        const node = document.createElement('div');
        node.className = 'state-node' + (active ? ' active' : '');

        const circle = document.createElement('div');
        circle.className = 'state-circle';
        if (active) {
            circle.style.background = s.color;
            circle.style.borderColor = s.color;
        }
        circle.textContent = s.icon;
        node.appendChild(circle);

        const label = document.createElement('div');
        label.className = 'state-label';
        label.textContent = s.label;
        node.appendChild(label);

        row.appendChild(node);
    });

    const current = TRAFFIC_STATES[trafficIndex];
    const next = TRAFFIC_STATES[(trafficIndex + 1) % TRAFFIC_STATES.length];
    document.getElementById('trafficInfo').innerHTML =
        `Stato attuale: <strong>${current.label}</strong>. Al prossimo passo diventerà: <strong>${next.label}</strong>. Il ciclo si ripete sempre nello stesso ordine.`;
}

document.getElementById('trafficNextBtn').addEventListener('click', () => {
    trafficIndex = (trafficIndex + 1) % TRAFFIC_STATES.length;
    renderTraffic();
});

// ===== Esempio 2: Distributore automatico (transizioni che dipendono dall'input) =====
const PRICE = 1.5;
const VENDING_STATES = [
    { id: 'waiting', label: 'In attesa', icon: '⏳' },
    { id: 'partial', label: 'Credito parziale', icon: '💰' },
    { id: 'ready', label: 'Pronto', icon: '✅' }
];

let vendingState = {
    status: 'waiting',
    credit: 0,
    message: 'Inserisci delle monete per iniziare.'
};

function statusFromCredit(credit) {
    if (credit <= 0) return 'waiting';
    if (credit < PRICE) return 'partial';
    return 'ready';
}

function renderVending() {
    const row = document.getElementById('vendingStatesRow');
    row.innerHTML = '';
    VENDING_STATES.forEach(s => {
        const active = s.id === vendingState.status;
        const node = document.createElement('div');
        node.className = 'state-node' + (active ? ' active' : '');

        const circle = document.createElement('div');
        circle.className = 'state-circle';
        if (active) {
            circle.style.background = '#ca8a04';
            circle.style.borderColor = '#a16207';
        }
        circle.textContent = s.icon;
        node.appendChild(circle);

        const label = document.createElement('div');
        label.className = 'state-label';
        label.textContent = s.label;
        node.appendChild(label);

        row.appendChild(node);
    });

    document.getElementById('creditDisplay').textContent =
        `Credito inserito: ${vendingState.credit.toFixed(2)} € — Prezzo del prodotto: ${PRICE.toFixed(2)} €`;
    document.getElementById('vendingInfo').textContent = vendingState.message;
    document.getElementById('dispenseBtn').disabled = vendingState.status !== 'ready';
}

function insertCoin(amount) {
    vendingState.credit = Math.round((vendingState.credit + amount) * 100) / 100;
    vendingState.status = statusFromCredit(vendingState.credit);
    vendingState.message = vendingState.status === 'ready'
        ? `Hai inserito ${amount.toFixed(2)} €. Credito totale: ${vendingState.credit.toFixed(2)} € — sufficiente! Puoi prelevare.`
        : `Hai inserito ${amount.toFixed(2)} €. Credito totale: ${vendingState.credit.toFixed(2)} €, mancano ancora ${(PRICE - vendingState.credit).toFixed(2)} €.`;
    renderVending();
}

function cancelVending() {
    const refund = vendingState.credit;
    vendingState.credit = 0;
    vendingState.status = 'waiting';
    vendingState.message = refund > 0
        ? `Operazione annullata: restituiti ${refund.toFixed(2)} €.`
        : 'Nessun credito da restituire.';
    renderVending();
}

function dispense() {
    if (vendingState.status !== 'ready') return;
    const change = Math.round((vendingState.credit - PRICE) * 100) / 100;
    vendingState.credit = 0;
    vendingState.status = 'waiting';
    vendingState.message = change > 0
        ? `Prodotto erogato! Resto restituito: ${change.toFixed(2)} €.`
        : 'Prodotto erogato! Nessun resto da restituire.';
    renderVending();
}

document.getElementById('insert50Btn').addEventListener('click', () => insertCoin(0.5));
document.getElementById('insert100Btn').addEventListener('click', () => insertCoin(1));
document.getElementById('cancelBtn').addEventListener('click', cancelVending);
document.getElementById('dispenseBtn').addEventListener('click', dispense);

// ===== Cambio modalità =====
const HELP = {
    traffic: [
        '• Il semaforo ha esattamente 3 stati possibili, e si trova sempre in uno solo di essi alla volta.',
        '• L\'unico "evento" che fa cambiare stato è il passare del tempo: la transizione è sempre la stessa, nello stesso ordine.',
        '• Questo è l\'esempio più semplice di macchina a stati: un ciclo fisso, senza scelte.'
    ],
    vending: [
        '• Il distributore ha 3 stati, ma qui le transizioni dipendono da <strong>quali monete inserisci</strong>: lo stesso stato può portare a stati diversi a seconda dell\'evento.',
        '• "Annulla" riporta sempre allo stato iniziale, da qualunque stato ci si trovi, restituendo il credito.',
        '• "Preleva" è disponibile solo nello stato "Pronto": un pulsante può essere permesso o vietato a seconda dello stato attuale — esattamente come nei veri distributori.'
    ]
};

document.getElementById('trafficModeBtn').addEventListener('click', () => {
    document.getElementById('trafficModeBtn').classList.add('active');
    document.getElementById('vendingModeBtn').classList.remove('active');
    document.getElementById('trafficPanel').classList.remove('hidden');
    document.getElementById('vendingPanel').classList.add('hidden');
    document.getElementById('helpList').innerHTML = HELP.traffic.map(li => `<li>${li}</li>`).join('');
});

document.getElementById('vendingModeBtn').addEventListener('click', () => {
    document.getElementById('vendingModeBtn').classList.add('active');
    document.getElementById('trafficModeBtn').classList.remove('active');
    document.getElementById('vendingPanel').classList.remove('hidden');
    document.getElementById('trafficPanel').classList.add('hidden');
    document.getElementById('helpList').innerHTML = HELP.vending.map(li => `<li>${li}</li>`).join('');
});

// ===== Inizializzazione =====
document.getElementById('helpList').innerHTML = HELP.traffic.map(li => `<li>${li}</li>`).join('');
renderTraffic();
renderVending();
