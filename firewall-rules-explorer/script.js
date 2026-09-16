// --- Valutazione di regole firewall in ordine, con supporto CIDR -----------
const DEFAULT_POLICY = 'DENY';

const INITIAL_RULES = [
    { action: 'ALLOW', srcIp: 'any', port: 443, protocol: 'TCP', desc: 'Consenti HTTPS in entrata' },
    { action: 'ALLOW', srcIp: 'any', port: 80, protocol: 'TCP', desc: 'Consenti HTTP in entrata' },
    { action: 'ALLOW', srcIp: '192.168.1.0/24', port: 22, protocol: 'TCP', desc: 'Consenti SSH solo dalla rete interna' },
    { action: 'DENY', srcIp: '203.0.113.66', port: 'any', protocol: 'any', desc: 'Blocca un IP sospetto conosciuto' },
    { action: 'DENY', srcIp: 'any', port: 23, protocol: 'TCP', desc: 'Blocca Telnet (insicuro)' }
];

const TEST_PACKETS = [
    { srcIp: '198.51.100.20', port: 443, protocol: 'TCP', label: 'Visitatore normale, HTTPS' },
    { srcIp: '203.0.113.66', port: 443, protocol: 'TCP', label: '⚠ IP sospetto, HTTPS' },
    { srcIp: '192.168.1.50', port: 22, protocol: 'TCP', label: 'Rete interna, SSH' },
    { srcIp: '8.8.8.8', port: 22, protocol: 'TCP', label: 'Internet (non interno), SSH' },
    { srcIp: '198.51.100.30', port: 23, protocol: 'TCP', label: 'Tentativo Telnet' }
];

function ipToInt(ip) {
    const parts = ip.split('.').map(Number);
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function ipMatches(packetIp, ruleSrc) {
    if (ruleSrc === 'any') return true;
    if (!ruleSrc.includes('/')) return packetIp === ruleSrc;
    const [base, prefixStr] = ruleSrc.split('/');
    const prefix = parseInt(prefixStr, 10);
    const mask = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0;
    return (ipToInt(packetIp) & mask) === (ipToInt(base) & mask);
}

function ruleMatches(rule, packet) {
    const srcOk = ipMatches(packet.srcIp, rule.srcIp);
    const portOk = rule.port === 'any' || rule.port === packet.port;
    const protoOk = rule.protocol === 'any' || rule.protocol === packet.protocol;
    return srcOk && portOk && protoOk;
}

// Traccia passo-passo: una entry per ogni regola controllata, più un'entry
// finale se si arriva alla politica predefinita senza corrispondenze.
function evaluatePacket(rules, packet) {
    const trace = [];
    for (let i = 0; i < rules.length; i++) {
        const matched = ruleMatches(rules[i], packet);
        trace.push({ ruleIdx: i, matched });
        if (matched) return { trace, action: rules[i].action, matchedIdx: i };
    }
    return { trace, action: DEFAULT_POLICY, matchedIdx: null };
}

let rules = INITIAL_RULES.map(r => ({ ...r }));
let state = { trace: [], current: 0, finalAction: null, packet: null };

function renderRules() {
    const table = document.getElementById('rulesTable');
    const thead = '<thead><tr><th></th><th>Azione</th><th>Sorgente</th><th>Porta</th><th>Protocollo</th><th>Descrizione</th></tr></thead>';
    const rows = rules.map((r, i) => `
        <tr id="rule-${i}">
            <td>
                <button class="move-btn" data-move="up" data-idx="${i}" ${i === 0 ? 'disabled' : ''}>↑</button>
                <button class="move-btn" data-move="down" data-idx="${i}" ${i === rules.length - 1 ? 'disabled' : ''}>↓</button>
            </td>
            <td><span class="action-badge ${r.action.toLowerCase()}">${r.action}</span></td>
            <td>${r.srcIp}</td>
            <td>${r.port}</td>
            <td>${r.protocol}</td>
            <td class="desc">${r.desc}</td>
        </tr>
    `).join('');
    const defaultRow = `<tr><td></td><td><span class="action-badge deny">${DEFAULT_POLICY}</span></td><td colspan="4"><em>Politica predefinita — nessuna regola corrisponde</em></td></tr>`;
    table.innerHTML = thead + '<tbody>' + rows + defaultRow + '</tbody>';

    table.querySelectorAll('.move-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = Number(btn.dataset.idx);
            const dir = btn.dataset.move === 'up' ? -1 : 1;
            const swapWith = idx + dir;
            [rules[idx], rules[swapWith]] = [rules[swapWith], rules[idx]];
            renderRules();
            clearEvaluation();
        });
    });
}

function renderPacketChips() {
    const wrap = document.getElementById('packetChips');
    wrap.innerHTML = '';
    TEST_PACKETS.forEach((p, i) => {
        const chip = document.createElement('button');
        chip.className = 'chip' + (state.packet === p ? ' active' : '');
        chip.innerHTML = `${p.label}<span class="chip-ip">${p.srcIp}:${p.port} (${p.protocol})</span>`;
        chip.addEventListener('click', () => startEvaluation(p));
        wrap.appendChild(chip);
    });
}

function clearEvaluation() {
    state = { trace: [], current: 0, finalAction: null, packet: null };
    document.getElementById('stepPanel').textContent = 'Scegli un pacchetto da testare qui sopra.';
    document.getElementById('resultBanner').className = 'result-banner';
    document.getElementById('resultBanner').textContent = '';
    document.getElementById('stepBtn').disabled = true;
    document.getElementById('playBtn').disabled = true;
    rules.forEach((_, i) => document.getElementById('rule-' + i).classList.remove('checking', 'matched'));
    renderPacketChips();
}

function startEvaluation(packet) {
    const { trace, action, matchedIdx } = evaluatePacket(rules, packet);
    state = { trace, current: 0, finalAction: action, matchedIdx, packet };
    renderPacketChips();
    document.getElementById('stepBtn').disabled = false;
    document.getElementById('playBtn').disabled = false;
    document.getElementById('resultBanner').className = 'result-banner';
    document.getElementById('resultBanner').textContent = '';
    rules.forEach((_, i) => document.getElementById('rule-' + i).classList.remove('checking', 'matched'));
    renderStep();
}

function renderStep() {
    rules.forEach((_, i) => document.getElementById('rule-' + i).classList.remove('checking', 'matched'));

    if (state.current >= state.trace.length) {
        // arrivati alla politica predefinita
        document.getElementById('stepPanel').innerHTML =
            `<span class="step-counter">Fine della lista</span>Nessuna regola corrisponde: si applica la politica predefinita, <strong>${DEFAULT_POLICY}</strong>.`;
        showResult();
        document.getElementById('stepBtn').disabled = true;
        return;
    }

    const entry = state.trace[state.current];
    const rule = rules[entry.ruleIdx];
    const row = document.getElementById('rule-' + entry.ruleIdx);
    row.classList.add(entry.matched ? 'matched' : 'checking');

    const p = state.packet;
    document.getElementById('stepPanel').innerHTML =
        `<span class="step-counter">Regola ${entry.ruleIdx + 1} di ${rules.length}</span>` +
        `Pacchetto ${p.srcIp}:${p.port} (${p.protocol}) vs "${rule.desc}" → ` +
        (entry.matched ? `<strong>corrisponde</strong>: applica ${rule.action} e si ferma qui.` : `non corrisponde, si passa alla prossima.`);

    if (entry.matched) {
        showResult();
        document.getElementById('stepBtn').disabled = true;
    } else {
        document.getElementById('stepBtn').disabled = false;
    }
}

function showResult() {
    const banner = document.getElementById('resultBanner');
    banner.className = 'result-banner ' + state.finalAction.toLowerCase();
    banner.textContent = state.finalAction === 'ALLOW' ? '✓ Pacchetto CONSENTITO' : '✗ Pacchetto NEGATO';
    document.getElementById('playBtn').disabled = true;
}

document.getElementById('stepBtn').addEventListener('click', () => {
    state.current++;
    renderStep();
});

document.getElementById('playBtn').addEventListener('click', () => {
    state.current = state.trace.length; // se non c'è stata corrispondenza, o si ferma già al match trovato
    // avanza fino al passo di match, se esiste, altrimenti fino alla fine
    for (let i = 0; i < state.trace.length; i++) {
        if (state.trace[i].matched) { state.current = i; break; }
    }
    renderStep();
});

document.getElementById('resetRulesBtn').addEventListener('click', () => {
    rules = INITIAL_RULES.map(r => ({ ...r }));
    renderRules();
    clearEvaluation();
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché non ordinare le regole "per specificità" in automatico? ▸'
        : 'Perché non ordinare le regole "per specificità" in automatico? ▾';
});

renderRules();
clearEvaluation();
