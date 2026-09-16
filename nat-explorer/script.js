// --- Simulazione di NAT/NAPT (traduzione indirizzo e porta) ----------------
// Tutti gli indirizzi "pubblici" usati qui appartengono a intervalli
// riservati alla documentazione (RFC 5737: 203.0.113.0/24, 198.51.100.0/24):
// non corrispondono a nessun host reale su internet.
const ROUTER_PUBLIC_IP = '203.0.113.5';

const DEVICES = [
    { name: 'Laptop', ip: '192.168.1.10', icon: '💻' },
    { name: 'Smartphone', ip: '192.168.1.11', icon: '📱' },
    { name: 'Smart TV', ip: '192.168.1.12', icon: '📺' },
    { name: 'Console', ip: '192.168.1.13', icon: '🎮' }
];

const REMOTES = [
    { name: 'Sito web', ip: '198.51.100.10', port: 443, icon: '🌍' },
    { name: 'Server email', ip: '198.51.100.20', port: 25, icon: '✉️' },
    { name: 'Videochiamata', ip: '198.51.100.30', port: 443, icon: '📹' }
];

function buildConnectionSteps(device, remote, privatePort, publicPort) {
    return [
        { active: ['device'], edge: null, text: `<strong>${device.name}</strong> vuole contattare <strong>${remote.name}</strong> (${remote.ip}:${remote.port}).` },
        { active: ['device', 'router'], edge: 'device-router', text: `Il pacchetto in uscita arriva al router, con mittente <strong>${device.ip}:${privatePort}</strong>.` },
        { active: ['router'], edge: null, text: `Il router non può usare ${device.ip} su internet: è un indirizzo privato. Sostituisce il mittente con il proprio IP pubblico e una porta pubblica libera — <strong>${ROUTER_PUBLIC_IP}:${publicPort}</strong> — e registra la corrispondenza nella tabella NAT.` },
        { active: ['router', 'internet'], edge: 'router-internet', text: `${remote.name} riceve il pacchetto tradotto: per lui il mittente è solo <strong>${ROUTER_PUBLIC_IP}:${publicPort}</strong>. Non sa nulla del dispositivo o della rete privata dietro.` },
        { active: ['router', 'internet'], edge: 'router-internet', text: `${remote.name} risponde a <strong>${ROUTER_PUBLIC_IP}:${publicPort}</strong>.` },
        { active: ['router'], edge: null, text: `Il router consulta la tabella NAT: la porta pubblica ${publicPort} corrisponde a <strong>${device.ip}:${privatePort}</strong>.` },
        { active: ['device', 'router'], edge: 'device-router', text: `La risposta arriva a <strong>${device.name}</strong>, che non ha mai saputo nulla della traduzione.` }
    ];
}

let state = {
    deviceIdx: 0,
    remoteIdx: 0,
    natTable: [],
    nextId: 1,
    privatePortCounter: 51000,
    publicPortCounter: 40001,
    steps: [],
    current: 0,
    isPlaying: false,
    interval: null,
    speed: 1300,
    pendingRow: null,
    applied: false
};

function renderChips() {
    const deviceChips = document.getElementById('deviceChips');
    deviceChips.innerHTML = '';
    DEVICES.forEach((d, i) => {
        const chip = document.createElement('button');
        chip.className = 'chip' + (i === state.deviceIdx ? ' active' : '');
        chip.textContent = `${d.icon} ${d.name}`;
        chip.addEventListener('click', () => { state.deviceIdx = i; renderChips(); updateTopDiagram(); });
        deviceChips.appendChild(chip);
    });

    const remoteChips = document.getElementById('remoteChips');
    remoteChips.innerHTML = '';
    REMOTES.forEach((r, i) => {
        const chip = document.createElement('button');
        chip.className = 'chip' + (i === state.remoteIdx ? ' active' : '');
        chip.textContent = `${r.icon} ${r.name}`;
        chip.addEventListener('click', () => { state.remoteIdx = i; renderChips(); updateTopDiagram(); });
        remoteChips.appendChild(chip);
    });
}

function updateTopDiagram() {
    const device = DEVICES[state.deviceIdx];
    const remote = REMOTES[state.remoteIdx];
    document.getElementById('deviceIcon').textContent = device.icon;
    document.getElementById('deviceLabel').textContent = device.name;
    document.getElementById('deviceSub').textContent = device.ip;
    document.getElementById('internetIcon').textContent = remote.icon;
    document.getElementById('internetLabel').textContent = remote.name;
    document.getElementById('internetSub').textContent = remote.ip;
}

function clearDiagramHighlight() {
    document.querySelectorAll('.node').forEach(n => n.classList.remove('active', 'blocked'));
    document.getElementById('edge-device-router').classList.remove('active');
    document.getElementById('edge-router-internet').classList.remove('active');
}

function renderNatTable() {
    const body = document.getElementById('natBody');
    body.innerHTML = '';
    state.natTable.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="device-name">${row.deviceIcon} ${row.deviceName}</td>
            <td>${row.privateIp}:${row.privatePort}</td>
            <td>${ROUTER_PUBLIC_IP}:${row.publicPort}</td>
            <td>${row.remoteName} (${row.remoteIp}:${row.remotePort})</td>
            <td><button class="close-btn" data-id="${row.id}">Chiudi</button></td>
        `;
        body.appendChild(tr);
    });
    document.getElementById('emptyText').classList.toggle('hidden', state.natTable.length > 0);
    body.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => closeConnection(Number(btn.dataset.id)));
    });
}

function closeConnection(id) {
    state.natTable = state.natTable.filter(r => r.id !== id);
    renderNatTable();
}

function renderStep() {
    const hasSteps = state.steps.length > 0;
    document.getElementById('playPauseBtn').disabled = !hasSteps;
    document.getElementById('stepBtn').disabled = !hasSteps || state.current >= state.steps.length - 1;
    document.getElementById('connectBtn').disabled = hasSteps && state.current < state.steps.length - 1;

    if (!hasSteps) return;

    const step = state.steps[state.current];
    clearDiagramHighlight();
    step.active.forEach(id => document.getElementById('node-' + id).classList.add('active'));
    if (step.edge) document.getElementById('edge-' + step.edge).classList.add('active');

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

    if (atEnd && !state.applied) applyOutcome();
}

function applyOutcome() {
    state.applied = true;
    state.natTable.push(state.pendingRow);
    renderNatTable();
}

function connectNewConnection() {
    stopPlaying();
    document.getElementById('inboundResult').className = 'inbound-result';
    document.getElementById('inboundResult').textContent = '';

    const device = DEVICES[state.deviceIdx];
    const remote = REMOTES[state.remoteIdx];
    const privatePort = state.privatePortCounter++;
    const publicPort = state.publicPortCounter++;

    state.pendingRow = {
        id: state.nextId++,
        deviceName: device.name,
        deviceIcon: device.icon,
        privateIp: device.ip,
        privatePort,
        publicPort,
        remoteName: remote.name,
        remoteIp: remote.ip,
        remotePort: remote.port
    };
    state.steps = buildConnectionSteps(device, remote, privatePort, publicPort);
    state.current = 0;
    state.applied = false;

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
    if (state.isPlaying) { stopPlaying(); renderStep(); }
    else startPlaying();
}

function findUnusedPublicPort() {
    let port = 60000;
    while (state.natTable.some(r => r.publicPort === port)) port++;
    return port;
}

function showInboundResult(matched, row, port) {
    clearDiagramHighlight();
    const el = document.getElementById('inboundResult');
    document.getElementById('node-internet').classList.add('active');
    if (matched) {
        document.getElementById('node-router').classList.add('active');
        document.getElementById('node-device').classList.add('active');
        el.className = 'inbound-result ok';
        el.textContent = `✓ Porta pubblica ${port} trovata in tabella: il router la inoltra a ${row.deviceName} (${row.privateIp}:${row.privatePort}).`;
    } else {
        document.getElementById('node-router').classList.add('blocked');
        el.className = 'inbound-result blocked';
        el.textContent = `✗ Porta pubblica ${port}: nessuna corrispondenza nella tabella NAT. Il router scarta il pacchetto.`;
    }
}

document.getElementById('connectBtn').addEventListener('click', connectNewConnection);
document.getElementById('playPauseBtn').addEventListener('click', playPause);
document.getElementById('stepBtn').addEventListener('click', () => { stopPlaying(); advance(); });

document.getElementById('tryActiveBtn').addEventListener('click', () => {
    if (state.natTable.length === 0) {
        document.getElementById('inboundResult').className = 'inbound-result blocked';
        document.getElementById('inboundResult').textContent = 'Nessuna connessione ancora aperta: avviane una prima qui sopra.';
        return;
    }
    const row = state.natTable[Math.floor(Math.random() * state.natTable.length)];
    showInboundResult(true, row, row.publicPort);
});

document.getElementById('tryRandomBtn').addEventListener('click', () => {
    const port = findUnusedPublicPort();
    showInboundResult(false, null, port);
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché questo protegge (un po\') la rete interna? ▸'
        : 'Perché questo protegge (un po\') la rete interna? ▾';
});

renderChips();
updateTopDiagram();
renderNatTable();
renderStep();
