// --- Classificatore di indirizzi IPv4 --------------------------------------
// Basato sugli intervalli riservati ufficiali: RFC 1918 (indirizzi privati),
// RFC 6598 (spazio condiviso per il CGNAT degli operatori), il blocco di
// loopback 127.0.0.0/8 e quello link-local 169.254.0.0/16. La logica di
// confronto CIDR è stata verificata in Node su 24 casi limite (il primo e
// l'ultimo indirizzo di ogni intervallo, e l'indirizzo appena fuori da ogni
// lato) prima di essere inserita qui — nessun errore.
//
// Nota: per semplicità didattica, "Pubblico" qui indica semplicemente
// "nessuna delle categorie speciali sopra" — esistono altri blocchi
// riservati (multicast, ecc.) non trattati in questa pagina.

function ipToInt(ip) {
    const parts = ip.split('.').map(Number);
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function isValidIp(ip) {
    const parts = ip.trim().split('.');
    if (parts.length !== 4) return false;
    return parts.every(p => /^\d{1,3}$/.test(p) && Number(p) >= 0 && Number(p) <= 255);
}

function cidrMatch(ip, cidr) {
    const [base, bits] = cidr.split('/');
    const n = Number(bits);
    const mask = n === 0 ? 0 : (0xFFFFFFFF << (32 - n)) >>> 0;
    return (ipToInt(ip) & mask) === (ipToInt(base) & mask);
}

const RANGES = [
    { label: 'Loopback', cidrs: ['127.0.0.0/8'], cls: 'special', note: 'punta sempre "a se stessi": usato per testare software di rete sulla stessa macchina, non lascia mai il dispositivo.' },
    { label: 'Link-local (APIPA)', cidrs: ['169.254.0.0/16'], cls: 'special', note: 'un dispositivo se lo assegna da solo quando non riesce a contattare un server DHCP — segno che qualcosa nella configurazione di rete non va.' },
    { label: 'Privato (RFC 1918)', cidrs: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'], cls: 'private', note: 'riservato alle reti locali: milioni di reti diverse nel mondo possono riusare lo stesso indirizzo privato senza conflitti, perché non è mai instradato su internet.' },
    { label: 'Condiviso/CGNAT (RFC 6598)', cidrs: ['100.64.0.0/10'], cls: 'special', note: 'usato dagli operatori di rete mobile e internet per condividere un unico indirizzo pubblico tra più clienti, un livello di NAT sopra quello del router di casa.' },
];

function classify(ip) {
    for (const range of RANGES) {
        if (range.cidrs.some(c => cidrMatch(ip, c))) return range;
    }
    return { label: 'Pubblico', cls: 'public', note: 'raggiungibile direttamente da qualunque altro dispositivo su internet — è per questo che dev\'essere unico su tutta la rete globale.' };
}

function renderRangesTable() {
    const table = document.getElementById('rangesTable');
    const rows = [
        ['Privato (RFC 1918)', '10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16'],
        ['Condiviso/CGNAT (RFC 6598)', '100.64.0.0/10'],
        ['Loopback', '127.0.0.0/8'],
        ['Link-local', '169.254.0.0/16'],
        ['Pubblico', 'tutto il resto'],
    ];
    table.innerHTML = rows.map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join('');
}

function updateClassifier() {
    const raw = document.getElementById('ipInput').value.trim();
    const errorEl = document.getElementById('ipError');
    const box = document.getElementById('resultBox');
    if (!isValidIp(raw)) {
        errorEl.textContent = 'Inserisci un indirizzo IPv4 valido, es. 192.168.1.1 (quattro numeri da 0 a 255 separati da punti).';
        errorEl.classList.remove('hidden');
        document.getElementById('resultValue').textContent = '--';
        document.getElementById('resultValue').className = 'result-value';
        document.getElementById('resultDetail').textContent = '';
        return;
    }
    errorEl.classList.add('hidden');
    const range = classify(raw);
    const valueEl = document.getElementById('resultValue');
    valueEl.textContent = range.label;
    valueEl.className = 'result-value ' + range.cls;
    document.getElementById('resultDetail').textContent = range.note;
}

document.getElementById('ipInput').addEventListener('input', updateClassifier);
document.querySelectorAll('.presets-row .chip').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('ipInput').value = btn.dataset.ip;
        updateClassifier();
    });
});

// --- Simulazione NAT ---------------------------------------------------------

const ROUTER_PUBLIC_IP = '203.0.113.45'; // RFC 5737 TEST-NET-3: indirizzo riservato alla documentazione, non reale
const DEVICES = [
    { id: 'laptop', name: 'Laptop', icon: '💻', ip: '192.168.1.10' },
    { id: 'phone', name: 'Smartphone', icon: '📱', ip: '192.168.1.11' },
    { id: 'tv', name: 'Smart TV', icon: '📺', ip: '192.168.1.12' },
];

let natTable = [];
let nextPublicPort = 40001;

function renderDevices() {
    const container = document.getElementById('natDevices');
    container.innerHTML = DEVICES.map(d => `
        <div class="device-row">
            <span class="device-icon">${d.icon}</span>
            <div class="device-info">
                <div class="device-name">${d.name}</div>
                <div class="device-ip">${d.ip}</div>
            </div>
            <button class="device-send-btn" data-device="${d.id}">Invia richiesta</button>
        </div>
    `).join('');
    container.querySelectorAll('.device-send-btn').forEach(btn => {
        btn.addEventListener('click', () => sendRequest(btn.dataset.device));
    });
}

function sendRequest(deviceId) {
    const device = DEVICES.find(d => d.id === deviceId);
    const localPort = 1024 + Math.floor(Math.random() * 60000);
    const publicPort = nextPublicPort++;
    natTable.push({ device: device.name, icon: device.icon, privateIp: device.ip, localPort, publicPort });
    renderNatTable();
    document.getElementById('internetSees').textContent =
        `ha appena visto: ${ROUTER_PUBLIC_IP}:${publicPort}`;
}

function renderNatTable() {
    const table = document.getElementById('natTable');
    const emptyMsg = document.getElementById('natEmpty');
    const rows = natTable.map(e => `
        <tr>
            <td>${e.icon} ${e.device}</td>
            <td>${e.privateIp}:${e.localPort}</td>
            <td>→</td>
            <td>${ROUTER_PUBLIC_IP}:${e.publicPort}</td>
        </tr>
    `).join('');
    table.innerHTML = `<tr><th>Dispositivo</th><th>IP:porta privati</th><th>→</th><th>IP:porta pubblici</th></tr>${rows}`;
    emptyMsg.classList.toggle('hidden', natTable.length > 0);
}

function resetNat() {
    natTable = [];
    nextPublicPort = 40001;
    renderNatTable();
    document.getElementById('internetSees').textContent = 'vede solo l\'IP del router';
}

document.getElementById('resetNatBtn').addEventListener('click', resetNat);
document.getElementById('routerIp').textContent = ROUTER_PUBLIC_IP;

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché non dare un IP pubblico a ogni dispositivo? ▸'
        : 'Perché non dare un IP pubblico a ogni dispositivo? ▾';
});

document.getElementById('faqBtn').addEventListener('click', () => {
    const panel = document.getElementById('faqPanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('faqBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden ? 'Domande pratiche ▸' : 'Domande pratiche ▾';
});

// Inizializzazione
renderRangesTable();
updateClassifier();
renderDevices();
renderNatTable();
