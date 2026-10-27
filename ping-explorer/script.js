// --- ping: misurare se (e quanto velocemente) risponde un host ------------

const DESTINATIONS = {
    scolastico: {
        label: 'Server scolastico',
        host: '10.0.4.12 (rete scolastica)',
        icon: '🏫',
        attempts: [
            { type: 'reply', rtt: 3, ttl: 63 },
            { type: 'reply', rtt: 4, ttl: 63 },
            { type: 'reply', rtt: 3, ttl: 63 },
            { type: 'reply', rtt: 5, ttl: 63 }
        ]
    },
    governativo: {
        label: 'Sito governativo',
        host: 'www.esempio-pa.gov.it',
        icon: '🏛️',
        attempts: [
            { type: 'reply', rtt: 48, ttl: 54 },
            { type: 'timeout' },
            { type: 'reply', rtt: 210, ttl: 54 },
            { type: 'reply', rtt: 75, ttl: 54 }
        ]
    },
    lontano: {
        label: 'Server lontano (altro continente)',
        host: 'server-remoto.esempio.com',
        icon: '🌍',
        attempts: [
            { type: 'reply', rtt: 175, ttl: 48 },
            { type: 'reply', rtt: 190, ttl: 48 },
            { type: 'reply', rtt: 168, ttl: 48 },
            { type: 'reply', rtt: 182, ttl: 48 }
        ]
    },
    inesistente: {
        label: 'Host non esistente',
        host: '192.0.2.77 (indirizzo non assegnato)',
        icon: '❓',
        attempts: [
            { type: 'unreachable' },
            { type: 'unreachable' },
            { type: 'unreachable' },
            { type: 'unreachable' }
        ]
    }
};

function round1(n) {
    return Math.round(n * 10) / 10;
}

function computeStats(attempts) {
    const transmitted = attempts.length;
    const replies = attempts.filter(a => a.type === 'reply');
    const received = replies.length;
    const lost = transmitted - received;
    const lossPct = transmitted === 0 ? 0 : round1((lost / transmitted) * 100);
    if (received === 0) {
        return { transmitted, received, lost, lossPct, min: null, avg: null, max: null };
    }
    const rtts = replies.map(a => a.rtt);
    const min = Math.min(...rtts);
    const max = Math.max(...rtts);
    const avg = round1(rtts.reduce((a, b) => a + b, 0) / rtts.length);
    return { transmitted, received, lost, lossPct, min, avg, max };
}

// Trasforma gli "attempts" fissi di una destinazione in una sequenza di passi
// narrativi (invio + esito per ciascuna richiesta): 4 richieste -> 8 passi.
function buildSteps(dest) {
    const steps = [];
    dest.attempts.forEach((a, i) => {
        steps.push({
            phase: 'sent',
            attemptIndex: i,
            text: `Richiesta #${i + 1}: invio ICMP Echo Request a ${dest.host} (TTL=64).`
        });
        let outcomeText;
        if (a.type === 'reply') {
            outcomeText = `Risposta ricevuta da ${dest.host}: ICMP Echo Reply, tempo=${a.rtt} ms, TTL=${a.ttl}.`;
        } else if (a.type === 'timeout') {
            outcomeText = `Nessuna risposta entro il tempo massimo di attesa: richiesta scaduta (Request timed out).`;
        } else {
            outcomeText = `Un router intermedio risponde con un errore: Destinazione host irraggiungibile (Destination Host Unreachable).`;
        }
        steps.push({ phase: 'outcome', attemptIndex: i, attempt: a, text: outcomeText });
    });
    return steps;
}

function makePingRunner() {
    let destKey = 'scolastico';
    let current = -1;
    let interval = null;

    function dest() {
        return DESTINATIONS[destKey];
    }

    function steps() {
        return buildSteps(dest());
    }

    function renderChips() {
        const wrap = document.getElementById('destChips');
        wrap.innerHTML = Object.entries(DESTINATIONS).map(([key, d]) =>
            `<button type="button" class="chip ${key === destKey ? 'active' : ''}" data-key="${key}">${d.label}</button>`
        ).join('');
        wrap.querySelectorAll('.chip').forEach(btn => {
            btn.addEventListener('click', () => selectDestination(btn.getAttribute('data-key')));
        });
    }

    function renderDiagram() {
        const d = dest();
        document.getElementById('destIcon').textContent = d.icon;
        document.getElementById('destLabel').textContent = d.label;
        document.getElementById('destHost').textContent = d.host;

        const packet = document.getElementById('pingPacket');
        if (current < 0) {
            packet.textContent = '';
            packet.style.left = '0%';
            return;
        }
        const s = steps()[current];
        if (s.phase === 'sent') {
            packet.textContent = '📨';
            packet.style.left = '50%';
        } else if (s.attempt.type === 'reply') {
            packet.textContent = '✅';
            packet.style.left = '8%';
        } else if (s.attempt.type === 'timeout') {
            packet.textContent = '⌛';
            packet.style.left = '92%';
        } else {
            packet.textContent = '🚫';
            packet.style.left = '60%';
        }
    }

    function renderAttempts() {
        const row = document.getElementById('attemptRow');
        const d = dest();
        row.innerHTML = d.attempts.map((a, i) => {
            // Un tentativo è "deciso" quando il suo passo di esito è già stato raggiunto.
            const outcomeStepIndex = i * 2 + 1;
            const decided = current >= outcomeStepIndex;
            let cls = '';
            let label = String(i + 1);
            if (decided) {
                if (a.type === 'reply') {
                    cls = 'ok';
                    label = a.rtt + 'ms';
                } else {
                    cls = 'fail';
                    label = '✕';
                }
            }
            return `<div class="attempt-dot ${cls}" title="Richiesta #${i + 1}">${label}</div>`;
        }).join('');
    }

    function renderStepPanel() {
        const panel = document.getElementById('stepPanel');
        const list = steps();
        panel.innerHTML = list.slice(0, current + 1).map((s, i) =>
            `<div class="step-line ${i === current ? 'current' : ''}">${s.text}</div>`
        ).join('') || '<div class="step-line">Premi "Avvia" o "Passo singolo" per inviare la prima richiesta.</div>';
        panel.scrollTop = panel.scrollHeight;
    }

    function renderStats() {
        const wrap = document.getElementById('statsWrap');
        const box = document.getElementById('statsBox');
        const total = steps().length;
        if (current < total - 1) {
            wrap.classList.add('hidden');
            return;
        }
        wrap.classList.remove('hidden');
        const d = dest();
        const stats = computeStats(d.attempts);
        box.className = 'result-box ' + (stats.lost === 0 ? 'good' : 'bad');
        const rttLine = stats.received > 0
            ? `RTT minimo/medio/massimo (sui pacchetti ricevuti): ${stats.min}/${stats.avg}/${stats.max} ms.`
            : 'Nessun pacchetto ricevuto: impossibile calcolare l\'RTT.';
        box.innerHTML = `
            <div>Statistiche ping per ${d.host}:</div>
            <div class="stats-grid">
                <div class="stat-tile"><div class="stat-value">${stats.transmitted}</div><div class="stat-label">trasmessi</div></div>
                <div class="stat-tile"><div class="stat-value">${stats.received}</div><div class="stat-label">ricevuti</div></div>
                <div class="stat-tile"><div class="stat-value">${stats.lost} (${stats.lossPct}%)</div><div class="stat-label">persi</div></div>
            </div>
            <div style="margin-top:0.5rem;">${rttLine}</div>
        `;
    }

    function updateButtons() {
        const total = steps().length;
        document.getElementById('stepBtn').disabled = current >= total - 1;
    }

    function render() {
        renderChips();
        renderDiagram();
        renderAttempts();
        renderStepPanel();
        renderStats();
        updateButtons();
    }

    function stopAuto() {
        if (interval) clearInterval(interval);
        interval = null;
    }

    function advance() {
        const total = steps().length;
        if (current >= total - 1) { stopAuto(); return; }
        current++;
        render();
        if (current >= total - 1) stopAuto();
    }

    function selectDestination(key) {
        if (!DESTINATIONS[key]) return;
        stopAuto();
        destKey = key;
        current = -1;
        render();
    }

    // Rendering iniziale alla creazione, PRIMA di qualunque click: questo è
    // ciò che rende "Passo singolo" già abilitato e funzionante al semplice
    // caricamento della pagina, senza dover prima premere "Avvia".
    render();

    return {
        startAuto() {
            stopAuto();
            current = -1;
            render();
            interval = setInterval(advance, 700);
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

const pingRunner = makePingRunner();

document.getElementById('runBtn').addEventListener('click', () => pingRunner.startAuto());
document.getElementById('stepBtn').addEventListener('click', () => pingRunner.stepOnce());
document.getElementById('resetBtn').addEventListener('click', () => pingRunner.reset());

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché a volte alcuni pacchetti si perdono anche se l\'host risponde agli altri? ▸'
        : 'Perché a volte alcuni pacchetti si perdono anche se l\'host risponde agli altri? ▾';
});
