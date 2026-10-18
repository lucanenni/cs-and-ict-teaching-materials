// --- Logica pura: incapsulamento/decapsulamento VPN -----------------------
// Verificata a parte con uno script Node prima di essere collegata al DOM
// (vedi il README): decapsulate(encapsulate(x)) === x, e un osservatore
// esterno sul pacchetto incapsulato non vede mai gli IP privati né i dati
// reali, solo gli IP pubblici dei due gateway e un payload cifrato.

function makeInnerPacket(srcIp, dstIp, data) {
    return { srcIp, dstIp, data };
}

function encapsulate(innerPacket, outerSrcIp, outerDstIp) {
    return { outerSrcIp, outerDstIp, encrypted: true, inner: innerPacket };
}

function decapsulate(outerPacket) {
    if (!outerPacket.inner) throw new Error('Pacchetto non incapsulato: nessun payload interno.');
    return outerPacket.inner;
}

function observerView(outerPacket) {
    return {
        src: outerPacket.outerSrcIp,
        dst: outerPacket.outerDstIp,
        data: outerPacket.encrypted ? '🔒 dati cifrati (illeggibili)' : outerPacket.inner.data
    };
}

// Tutti gli indirizzi "pubblici" usati qui appartengono a intervalli
// riservati alla documentazione (RFC 5737): non corrispondono a host reali.
const DEVICE_A = { name: 'PC Ufficio A', ip: '192.168.1.10' };
const DEVICE_B = { name: 'PC Ufficio B', ip: '192.168.2.20' };
const GW_A_PUBLIC = '203.0.113.5';
const GW_B_PUBLIC = '198.51.100.9';

const innerPacket = makeInnerPacket(DEVICE_A.ip, DEVICE_B.ip, 'Ciao, ufficio B!');
const outerPacket = encapsulate(innerPacket, GW_A_PUBLIC, GW_B_PUBLIC);
const deliveredInner = decapsulate(outerPacket); // identico all'originale

// --- Rendering dei pacchetti -----------------------------------------------

function fieldRow(label, value, cssClass) {
    return `<div class="packet-field"><span class="k">${label}:</span> <span class="v ${cssClass || ''}">${value}</span></div>`;
}

function renderInnerPacketBox(title, packet) {
    return `
        <div class="packet-title">${title}</div>
        ${fieldRow('Mittente', packet.srcIp, 'private-ip')}
        ${fieldRow('Destinatario', packet.dstIp, 'private-ip')}
        ${fieldRow('Dati', `"${packet.data}"`)}
    `;
}

function renderOuterPacketBox(title) {
    return `
        <div class="packet-title">${title}</div>
        ${fieldRow('Mittente (pubblico)', GW_A_PUBLIC, 'public-ip')}
        ${fieldRow('Destinatario (pubblico)', GW_B_PUBLIC, 'public-ip')}
        ${fieldRow('Dati', '🔒 cifrati')}
        <div class="packet-inner">payload interno nascosto e cifrato — contiene gli IP privati originali, ma nessuno fuori dai due gateway può leggerlo</div>
    `;
}

function renderObserverBox(active) {
    if (!active) {
        return `<div class="packet-title">👁️ Cosa vede un osservatore qui</div><p>— non si trova su questo tratto —</p>`;
    }
    const view = observerView(outerPacket);
    return `
        <div class="packet-title">👁️ Cosa vede un osservatore sul tratto pubblico</div>
        ${fieldRow('Mittente', view.src, 'public-ip')}
        ${fieldRow('Destinatario', view.dst, 'public-ip')}
        ${fieldRow('Dati', view.data)}
        <div class="packet-inner">Nessuna traccia degli IP privati 192.168.1.10 / 192.168.2.20, né del testo reale.</div>
    `;
}

// --- Scenario 1: con VPN ----------------------------------------------------

const VPN_STEPS = [
    {
        active: ['deviceA'], edge: null,
        packet: () => renderInnerPacketBox('Pacchetto creato da PC A', innerPacket),
        observer: false,
        text: `<strong>PC Ufficio A</strong> crea un pacchetto con IP privati: da ${DEVICE_A.ip} a ${DEVICE_B.ip}.`
    },
    {
        active: ['deviceA', 'gwA'], edge: 'a-gwa',
        packet: () => renderInnerPacketBox('Arrivato al gateway VPN A', innerPacket),
        observer: false,
        text: `Il pacchetto arriva al <strong>gateway VPN di A</strong>, ancora con gli IP privati originali intatti.`
    },
    {
        active: ['gwA'], edge: null,
        packet: () => renderOuterPacketBox('Incapsulato e cifrato dal gateway A'),
        observer: false,
        text: `Il gateway A lo <strong>INCAPSULA</strong> dentro un nuovo pacchetto cifrato, con IP <strong>pubblici</strong> dei due gateway: da ${GW_A_PUBLIC} a ${GW_B_PUBLIC}.`
    },
    {
        active: ['gwA', 'internet', 'gwB'], edge: 'gwa-internet',
        edge2: 'internet-gwb',
        packet: () => renderOuterPacketBox('In viaggio su Internet pubblico'),
        observer: true,
        text: `Il pacchetto incapsulato viaggia nell'Internet <strong>pubblico</strong>. Un osservatore su questo tratto vede solo gli IP pubblici dei gateway e dati cifrati — guarda il riquadro giallo.`
    },
    {
        active: ['gwB'], edge: null,
        packet: () => renderInnerPacketBox('Decifrato e decapsulato dal gateway B', deliveredInner),
        observer: false,
        text: `Il gateway B riceve il pacchetto, lo <strong>decifra</strong> e lo <strong>DECAPSULA</strong>: ricompare il pacchetto originale, con gli IP privati intatti.`
    },
    {
        active: ['gwB', 'deviceB'], edge: 'gwb-b',
        packet: () => renderInnerPacketBox('Consegnato a PC B', deliveredInner),
        observer: false,
        text: `Il pacchetto arriva a <strong>PC Ufficio B</strong> con gli IP privati originali, come se il tunnel non ci fosse mai stato: le due reti si "vedono" come se fossero la stessa LAN.`
    }
];

// --- Scenario 2: senza VPN ---------------------------------------------------

const directPacket = makeInnerPacket(DEVICE_A.ip, DEVICE_B.ip, 'Ciao, ufficio B!');

const NOVPN_STEPS = [
    {
        active: ['deviceA'], edge: null,
        packet: () => renderInnerPacketBox('Pacchetto creato da PC A', directPacket),
        text: `<strong>PC Ufficio A</strong> prova a mandare lo stesso pacchetto, con destinazione privata ${DEVICE_B.ip}, <strong>direttamente su Internet</strong> — nessun tunnel, nessun incapsulamento.`,
        result: null
    },
    {
        active: ['deviceA', 'internet'], edge: 'a-internet',
        packet: () => renderInnerPacketBox('Arrivato ai router di Internet', directPacket),
        text: `Il pacchetto, con mittente e destinatario ancora <strong>privati</strong>, raggiunge i router pubblici di Internet.`,
        result: null
    },
    {
        active: ['internet'], edge: null, blocked: true,
        packet: () => renderInnerPacketBox('Scartato: destinazione non instradabile', directPacket),
        text: `I router pubblici non sanno instradare verso <strong>${DEVICE_B.ip}</strong>: è un indirizzo PRIVATO, senza alcun significato fuori dalla rete dell'Ufficio B. Il pacchetto viene <strong>SCARTATO</strong>.`,
        result: `✗ Pacchetto perso. Un indirizzo privato come ${DEVICE_B.ip} non è instradabile su Internet pubblico — esattamente lo stesso motivo per cui un dispositivo con IP privato ha bisogno del NAT per poter uscire da solo su Internet. Qui serve invece un tunnel VPN, che incapsula il pacchetto dentro IP pubblici instradabili.`
    }
];

// --- Motore di animazione (stesso pattern in entrambi gli scenari) ---------
// IMPORTANTE: "Passo singolo" deve funzionare fin dal caricamento della
// pagina, senza bisogno di cliccare prima "Avvia": per questo il primo
// render() avviene subito, con stepBtn già abilitato, e stepOnce() chiama
// semplicemente advance() senza dipendere da un intervallo già avviato.

function makeRunner(prefix, steps, speed) {
    let current = -1;
    let interval = null;

    function clearDiagram() {
        document.querySelectorAll(`[id^="${prefix}-node-"]`).forEach(n => n.classList.remove('active', 'blocked'));
        document.querySelectorAll(`[id^="${prefix}-edge-"]`).forEach(e => e.classList.remove('active', 'blocked'));
    }

    function render() {
        const panel = document.getElementById(prefix + '-stepPanel');
        const stepBtn = document.getElementById(prefix + '-stepBtn');
        const runBtn = document.getElementById(prefix + '-runBtn');

        clearDiagram();

        if (current < 0) {
            panel.innerHTML = '<span class="step-line">Pronto. Premi "Avvia" o "Passo singolo" per cominciare.</span>';
            stepBtn.disabled = false;
            runBtn.disabled = false;
            const pb = document.getElementById(prefix + '-packetBox');
            if (pb) pb.innerHTML = steps[0].packet();
            const ob = document.getElementById(prefix + '-observerBox');
            if (ob) ob.innerHTML = renderObserverBox(false);
            const rb = document.getElementById(prefix + '-resultBox');
            if (rb) { rb.className = 'result-box'; rb.textContent = ''; }
            return;
        }

        const step = steps[current];
        step.active.forEach(id => {
            const node = document.getElementById(prefix + '-node-' + id);
            if (node) node.classList.add(step.blocked ? 'blocked' : 'active');
        });
        if (step.edge) {
            const e = document.getElementById(prefix + '-edge-' + step.edge);
            if (e) e.classList.add(step.blocked ? 'blocked' : 'active');
        }
        if (step.edge2) {
            const e2 = document.getElementById(prefix + '-edge-' + step.edge2);
            if (e2) e2.classList.add('active');
        }

        panel.innerHTML = steps.slice(0, current + 1).map((s, i) =>
            `<div class="step-line ${i === current ? 'current' : ''}">${i + 1}. ${s.text}</div>`
        ).join('');
        panel.scrollTop = panel.scrollHeight;

        const pb = document.getElementById(prefix + '-packetBox');
        if (pb) pb.innerHTML = step.packet();

        const ob = document.getElementById(prefix + '-observerBox');
        if (ob) {
            ob.innerHTML = renderObserverBox(!!step.observer);
            ob.classList.toggle('inactive', !step.observer);
        }

        const rb = document.getElementById(prefix + '-resultBox');
        if (rb) {
            if (step.result) { rb.className = 'result-box bad'; rb.textContent = step.result; }
            else { rb.className = 'result-box'; rb.textContent = ''; }
        }

        stepBtn.disabled = current >= steps.length - 1;
    }

    function stopAuto() {
        if (interval) clearInterval(interval);
        interval = null;
    }

    function advance() {
        if (current >= steps.length - 1) { stopAuto(); return; }
        current++;
        render();
        if (current >= steps.length - 1) stopAuto();
    }

    render();

    return {
        startAuto() {
            stopAuto();
            if (current >= steps.length - 1) current = -1;
            render();
            interval = setInterval(advance, speed);
        },
        stepOnce() {
            stopAuto();
            advance();
        },
        reset() {
            stopAuto();
            current = -1;
            render();
        }
    };
}

const vpnRunner = makeRunner('vpn', VPN_STEPS, 1500);
const novpnRunner = makeRunner('novpn', NOVPN_STEPS, 1500);

document.getElementById('vpn-runBtn').addEventListener('click', () => vpnRunner.startAuto());
document.getElementById('vpn-stepBtn').addEventListener('click', () => vpnRunner.stepOnce());
document.getElementById('vpn-resetBtn').addEventListener('click', () => vpnRunner.reset());

document.getElementById('novpn-runBtn').addEventListener('click', () => novpnRunner.startAuto());
document.getElementById('novpn-stepBtn').addEventListener('click', () => novpnRunner.stepOnce());
document.getElementById('novpn-resetBtn').addEventListener('click', () => novpnRunner.reset());

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'La cifratura serve anche per i dati, non solo per nascondere gli IP? ▸'
        : 'La cifratura serve anche per i dati, non solo per nascondere gli IP? ▾';
});
