// --- Simulazione DHCP (DORA) su un pool di indirizzi limitato --------------
const POOL_BASE = '192.168.1.';
const POOL_START = 100;
const POOL_SIZE = 5;

const DEVICE_TYPES = [
    { name: 'Laptop di Marco', icon: '💻' },
    { name: 'Smartphone di Giulia', icon: '📱' },
    { name: 'Tablet di Luca', icon: '📱' },
    { name: 'Stampante di rete', icon: '🖨️' },
    { name: 'Smart TV', icon: '📺' },
    { name: 'Console giochi', icon: '🎮' },
    { name: 'Laptop di Sara', icon: '💻' },
    { name: 'Smartphone di Omar', icon: '📱' }
];

function makePool() {
    const addresses = [];
    for (let i = 0; i < POOL_SIZE; i++) {
        addresses.push({ ip: POOL_BASE + (POOL_START + i), leaseId: null });
    }
    return addresses;
}

// MAC deterministico ma diverso per ogni dispositivo, solo a scopo scenico.
// Il primo byte ha il bit "locally administered" impostato (02), come si fa
// per indirizzi generati localmente invece che assegnati da un produttore.
function macForIndex(i) {
    let seed = (i + 1) * 2654435761 % 4294967296;
    const bytes = [0x02];
    for (let b = 0; b < 5; b++) {
        seed = (seed * 1103515245 + 12345) % 4294967296;
        bytes.push(Math.floor(seed / 4294967296 * 256) % 256);
    }
    return bytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(':');
}

function nextDeviceLabel(index) {
    const base = DEVICE_TYPES[index % DEVICE_TYPES.length];
    const round = Math.floor(index / DEVICE_TYPES.length);
    const name = round > 0 ? `${base.name} #${round + 1}` : base.name;
    return { name, icon: base.icon };
}

function freeAddress(pool) {
    return pool.find(a => a.leaseId === null) || null;
}

// Costruisce la sequenza di passi per un tentativo di connessione, decidendo
// SUBITO se il pool ha un indirizzo libero (senza ancora riservarlo: la
// riserva avviene solo quando l'animazione raggiunge l'ultimo passo, così
// annullare a metà non lascia lo stato a metà cammino).
function buildConnectionSteps(pool, device, mac) {
    const free = freeAddress(pool);
    if (!free) {
        return {
            outcome: 'exhausted',
            steps: [
                { active: ['device'], edge: null, text: `<strong>${device.name}</strong> si collega alla rete, ma il pool DHCP è già completamente assegnato: tutti i ${POOL_SIZE} indirizzi risultano occupati.` },
                { active: ['device', 'dhcp'], edge: 'device-dhcp', text: `<strong>DHCPDISCOVER</strong> — il dispositivo manda comunque la sua richiesta in broadcast, senza sapere ancora se qualcuno risponderà.` },
                { active: ['dhcp'], edge: null, text: `Il server controlla il pool: nessun indirizzo libero da offrire. Non può rispondere con un <strong>DHCPOFFER</strong>.` },
                { active: ['device'], edge: null, text: `Il dispositivo non riceve risposta e, dopo un timeout, riproverà più tardi. Libera un indirizzo disconnettendo un dispositivo dalla tabella per sbloccarlo.` }
            ]
        };
    }
    return {
        outcome: 'assigned',
        ip: free.ip,
        steps: [
            { active: ['device'], edge: null, text: `<strong>${device.name}</strong> si collega alla rete: non ha ancora un indirizzo IP, quindi non può nemmeno inviare un messaggio a un indirizzo preciso.` },
            { active: ['device', 'dhcp'], edge: 'device-dhcp', text: `<strong>DHCPDISCOVER</strong> — il dispositivo manda un messaggio in broadcast: "C'è un server DHCP che può darmi un indirizzo?"` },
            { active: ['device', 'dhcp'], edge: 'device-dhcp', text: `<strong>DHCPOFFER</strong> — il server ha un indirizzo libero nel pool e lo offre: <strong>${free.ip}</strong>.` },
            { active: ['device', 'dhcp'], edge: 'device-dhcp', text: `<strong>DHCPREQUEST</strong> — il dispositivo accetta e lo richiede formalmente, ancora in broadcast: così eventuali altri server DHCP sanno che quell'offerta è stata presa.` },
            { active: ['device', 'dhcp'], edge: 'device-dhcp', text: `<strong>DHCPACK</strong> — il server conferma l'assegnazione e registra il lease: MAC <strong>${mac}</strong> → IP <strong>${free.ip}</strong>, per 24 ore.` }
        ]
    };
}

let state = {
    pool: makePool(),
    leases: [],
    deviceIndex: 0,
    pending: null,
    steps: [],
    current: 0,
    isPlaying: false,
    interval: null,
    speed: 1300,
    applied: false
};

function renderPool() {
    const dots = document.getElementById('poolDots');
    dots.innerHTML = '';
    state.pool.forEach(addr => {
        const dot = document.createElement('div');
        dot.className = 'pool-dot ' + (addr.leaseId === null ? 'free' : 'used');
        dot.textContent = addr.ip;
        dots.appendChild(dot);
    });
    const freeCount = state.pool.filter(a => a.leaseId === null).length;
    document.getElementById('poolCount').textContent = `${freeCount} di ${state.pool.length} liberi`;
}

function renderLeases() {
    const body = document.getElementById('leaseBody');
    body.innerHTML = '';
    state.leases.forEach(lease => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="device-name">${lease.icon} ${lease.name}</td>
            <td>${lease.mac}</td>
            <td>${lease.ip}</td>
            <td>24h</td>
            <td><button class="release-btn" data-id="${lease.id}">Disconnetti</button></td>
        `;
        body.appendChild(tr);
    });
    document.getElementById('emptyText').classList.toggle('hidden', state.leases.length > 0);

    body.querySelectorAll('.release-btn').forEach(btn => {
        btn.addEventListener('click', () => releaseLease(Number(btn.dataset.id)));
    });
}

function releaseLease(id) {
    const lease = state.leases.find(l => l.id === id);
    if (!lease) return;
    const addr = state.pool.find(a => a.leaseId === id);
    if (addr) addr.leaseId = null;
    state.leases = state.leases.filter(l => l.id !== id);
    renderPool();
    renderLeases();
}

function renderStep() {
    const hasSteps = state.steps.length > 0;
    document.getElementById('playPauseBtn').disabled = !hasSteps;
    document.getElementById('stepBtn').disabled = !hasSteps || state.current >= state.steps.length - 1;
    document.getElementById('connectBtn').disabled = hasSteps && state.current < state.steps.length - 1;

    if (!hasSteps) {
        document.querySelectorAll('.node').forEach(n => n.classList.remove('active'));
        document.getElementById('edge-device-dhcp').classList.remove('active');
        return;
    }

    const step = state.steps[state.current];
    document.querySelectorAll('.node').forEach(node => {
        const id = node.id.replace('node-', '');
        node.classList.toggle('active', step.active.includes(id));
    });
    document.getElementById('edge-device-dhcp').classList.toggle('active', step.edge === 'device-dhcp');

    document.getElementById('stepPanel').innerHTML =
        `<span class="step-counter">Passo ${state.current + 1} di ${state.steps.length}</span>${step.text}`;

    const atEnd = state.current >= state.steps.length - 1;
    const playBtn = document.getElementById('playPauseBtn');
    if (state.isPlaying) {
        playBtn.textContent = '⏸ Pausa';
    } else if (atEnd) {
        playBtn.textContent = '✓ Fatto';
    } else {
        playBtn.textContent = '▶ Avvia';
    }

    if (atEnd && !state.applied) {
        applyOutcome();
    }
}

function applyOutcome() {
    state.applied = true;
    if (state.pending.outcome !== 'assigned') return;
    const addr = state.pool.find(a => a.ip === state.pending.ip);
    if (!addr || addr.leaseId !== null) return;
    const lease = {
        id: state.pending.leaseCandidateId,
        name: state.pending.device.name,
        icon: state.pending.device.icon,
        mac: state.pending.mac,
        ip: state.pending.ip
    };
    addr.leaseId = lease.id;
    state.leases.push(lease);
    renderPool();
    renderLeases();
}

let nextLeaseId = 1;

function connectNewDevice() {
    stopPlaying();
    const device = nextDeviceLabel(state.deviceIndex);
    const mac = macForIndex(state.deviceIndex);
    state.deviceIndex++;

    const built = buildConnectionSteps(state.pool, device, mac);
    state.pending = { ...built, device, mac, leaseCandidateId: nextLeaseId++ };
    state.steps = built.steps;
    state.current = 0;
    state.applied = false;

    document.getElementById('deviceIcon').textContent = device.icon;
    document.getElementById('deviceLabel').textContent = device.name;

    renderStep();
}

function advance() {
    if (state.current >= state.steps.length - 1) {
        stopPlaying();
        renderStep();
        return;
    }
    state.current++;
    renderStep();
    if (state.current >= state.steps.length - 1) stopPlaying();
}

function startPlaying() {
    if (state.steps.length === 0 || state.current >= state.steps.length - 1) return;
    if (state.interval) clearInterval(state.interval);
    state.isPlaying = true;
    renderStep();
    state.interval = setInterval(advance, state.speed);
}

function stopPlaying() {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
    state.isPlaying = false;
}

function playPause() {
    if (state.isPlaying) {
        stopPlaying();
        renderStep();
    } else {
        startPlaying();
    }
}

function resetAll() {
    stopPlaying();
    state.pool = makePool();
    state.leases = [];
    state.deviceIndex = 0;
    state.pending = null;
    state.steps = [];
    state.current = 0;
    state.applied = false;
    document.getElementById('deviceIcon').textContent = '💻';
    document.getElementById('deviceLabel').textContent = 'Nuovo dispositivo';
    document.getElementById('stepPanel').textContent = 'Premi "Connetti un nuovo dispositivo" per iniziare.';
    document.getElementById('connectBtn').disabled = false;
    renderPool();
    renderLeases();
    renderStep();
}

document.getElementById('connectBtn').addEventListener('click', connectNewDevice);
document.getElementById('playPauseBtn').addEventListener('click', playPause);
document.getElementById('stepBtn').addEventListener('click', () => {
    stopPlaying();
    advance();
});
document.getElementById('resetBtn').addEventListener('click', resetAll);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché un IP è "in prestito" e non permanente? ▸'
        : 'Perché un IP è "in prestito" e non permanente? ▾';
});

renderPool();
renderLeases();
renderStep();
