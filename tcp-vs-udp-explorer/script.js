// --- TCP vs UDP: stesso scenario di invio, due comportamenti diversi -------
//
// 10 segmenti numerati da A a B. I segmenti 3 e 7 si perdono nel percorso
// (scelta fissa, per avere uno scenario riproducibile).
//
// TCP: modello "stop-and-wait" semplificato per chiarezza didattica (invece
// di una vera finestra scorrevole/pipeline): il mittente invia un segmento e
// aspetta l'ACK prima del prossimo; se l'ACK non arriva, dopo un timeout
// simulato ritrasmette. Tutti i segmenti arrivano, sempre in ordine, ma con
// più passi totali per i due persi.
//
// UDP: nessun ACK, nessuna ritrasmissione. I segmenti persi restano persi.
// Per rendere visibile anche il problema dell'ordine, il segmento 4 prende
// un percorso leggermente più lento e arriva dopo il 5 (spedito dopo di lui).

const SEGMENT_COUNT = 10;
const LOST_SEGMENTS = [3, 7];

function buildTcpSteps() {
    const steps = [];
    let ackCount = 0;
    for (let i = 1; i <= SEGMENT_COUNT; i++) {
        const lost = LOST_SEGMENTS.includes(i);
        if (!lost) {
            steps.push({ segment: i, status: 'arrivato', text: `Invio del segmento ${i}: arriva correttamente a destinazione.` });
            steps.push({ segment: i, status: 'ack', text: `B invia l'ACK ${i}: A sa che è arrivato e può procedere con il prossimo.` });
            ackCount++;
        } else {
            steps.push({ segment: i, status: 'perso', text: `Invio del segmento ${i}: si perde nel percorso.` });
            steps.push({ segment: i, status: 'timeout', text: `Timeout: scaduto il tempo massimo senza ricevere l'ACK ${i}, A lo ritrasmette.` });
            steps.push({ segment: i, status: 'arrivato', text: `Ritrasmissione del segmento ${i}: questa volta arriva.` });
            steps.push({ segment: i, status: 'ack', text: `B invia l'ACK ${i}.` });
            ackCount++;
        }
    }
    return { steps, ackCount, totalSteps: steps.length };
}

function buildUdpSteps() {
    const steps = [
        { segment: 1, status: 'arrivato', text: 'Invio del segmento 1 → arriva subito, in ordine.' },
        { segment: 2, status: 'arrivato', text: 'Invio del segmento 2 → arriva, in ordine.' },
        { segment: 3, status: 'perso', text: 'Invio del segmento 3 → PERSO per sempre: in UDP non c\'è alcun meccanismo per accorgersene o richiederne una copia.' },
        { segment: 4, status: 'in-transito', text: 'Invio del segmento 4 → prende un percorso leggermente più lento, resta in transito.' },
        { segment: 5, status: 'arrivato', text: 'Invio del segmento 5 → arriva subito, PRIMA del segmento 4 che è ancora in viaggio: B lo riceve immediatamente, fuori ordine.' },
        { segment: 4, status: 'arrivato-tardi', text: 'Il segmento 4 arriva finalmente, in ritardo: B lo riceve dopo il 5, anche se era stato spedito prima.' },
        { segment: 6, status: 'arrivato', text: 'Invio del segmento 6 → arriva, in ordine.' },
        { segment: 7, status: 'perso', text: 'Invio del segmento 7 → PERSO per sempre.' },
        { segment: 8, status: 'arrivato', text: 'Invio del segmento 8 → arriva.' },
        { segment: 9, status: 'arrivato', text: 'Invio del segmento 9 → arriva.' },
        { segment: 10, status: 'arrivato', text: 'Invio del segmento 10 → arriva.' }
    ];
    return { steps, ackCount: 0, totalSteps: steps.length };
}

function deliveredSoFar(steps, uptoIndex) {
    const delivered = [];
    for (let i = 0; i <= uptoIndex && i < steps.length; i++) {
        const s = steps[i];
        if (s.status === 'arrivato' || s.status === 'arrivato-tardi') delivered.push(s.segment);
    }
    return delivered;
}

function ackSoFar(steps, uptoIndex) {
    let count = 0;
    for (let i = 0; i <= uptoIndex && i < steps.length; i++) {
        if (steps[i].status === 'ack') count++;
    }
    return count;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SEGMENT_COUNT, LOST_SEGMENTS, buildTcpSteps, buildUdpSteps, deliveredSoFar, ackSoFar };
}

if (typeof document !== 'undefined') {

    const TCP = buildTcpSteps();
    const UDP = buildUdpSteps();

    function makeColumnRunner(opts) {
        const { steps, transitId, panelId, deliveredId, summaryId, runBtnId, stepBtnId, resetBtnId,
            totalSegments, isTcp, speed } = opts;
        let current = -1;
        let interval = null;

        function renderTransit() {
            const el = document.getElementById(transitId);
            if (current < 0) {
                el.innerHTML = '<span class="segment-chip">in attesa</span>';
                return;
            }
            const step = steps[current];
            const chip = document.createElement('div');
            chip.className = 'segment-chip status-' + step.status;
            let text = step.status === 'ack' ? `ACK ${step.segment}` : `Seg. ${step.segment}`;
            if (step.status === 'perso') text += ' ✗';
            if (step.status === 'arrivato' || step.status === 'arrivato-tardi') text += ' ✓';
            chip.textContent = text;
            el.innerHTML = '';
            el.appendChild(chip);
        }

        function renderPanel() {
            const panel = document.getElementById(panelId);
            panel.innerHTML = steps.slice(0, current + 1).map((s, i) =>
                `<div class="step-line ${i === current ? 'current' : ''}">${i + 1}. ${s.text}</div>`
            ).join('');
            panel.scrollTop = panel.scrollHeight;
        }

        function renderDelivered() {
            const delivered = deliveredSoFar(steps, current);
            const el = document.getElementById(deliveredId);
            el.innerHTML = delivered.map(d => `<span class="delivered-chip">${d}</span>`).join('');
        }

        function renderSummary() {
            const delivered = deliveredSoFar(steps, current).length;
            const stepsDone = current + 1;
            const acks = ackSoFar(steps, current);
            const ackLine = isTcp ? `ACK scambiati: ${acks}` : `ACK scambiati: 0 (UDP non usa ACK)`;
            document.getElementById(summaryId).innerHTML =
                `Segmenti consegnati: <strong>${delivered}/${totalSegments}</strong><br>` +
                `Passi impiegati: <strong>${stepsDone}</strong><br>` + ackLine;
        }

        function render() {
            renderTransit();
            renderPanel();
            renderDelivered();
            renderSummary();
            document.getElementById(stepBtnId).disabled = current >= steps.length - 1;
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

        // Render iniziale: "Passo singolo" deve funzionare da subito.
        render();

        document.getElementById(runBtnId).addEventListener('click', () => {
            stopAuto();
            current = -1;
            render();
            interval = setInterval(advance, speed);
        });
        document.getElementById(stepBtnId).addEventListener('click', () => {
            stopAuto();
            advance();
        });
        document.getElementById(resetBtnId).addEventListener('click', () => {
            stopAuto();
            current = -1;
            render();
        });
    }

    makeColumnRunner({
        steps: TCP.steps, transitId: 'tcpTransit', panelId: 'tcpStepPanel', deliveredId: 'tcpDelivered',
        summaryId: 'tcpSummary', runBtnId: 'tcpRunBtn', stepBtnId: 'tcpStepBtn', resetBtnId: 'tcpResetBtn',
        totalSegments: SEGMENT_COUNT, isTcp: true, speed: 650
    });

    makeColumnRunner({
        steps: UDP.steps, transitId: 'udpTransit', panelId: 'udpStepPanel', deliveredId: 'udpDelivered',
        summaryId: 'udpSummary', runBtnId: 'udpRunBtn', stepBtnId: 'udpStepBtn', resetBtnId: 'udpResetBtn',
        totalSegments: SEGMENT_COUNT, isTcp: false, speed: 650
    });

    document.getElementById('deepDiveBtn').addEventListener('click', () => {
        const panel = document.getElementById('deepDivePanel');
        const isHidden = panel.classList.toggle('hidden');
        const btn = document.getElementById('deepDiveBtn');
        btn.setAttribute('aria-expanded', String(!isHidden));
        btn.textContent = isHidden
            ? 'Allora perché non usare sempre TCP, visto che è più affidabile? ▸'
            : 'Allora perché non usare sempre TCP, visto che è più affidabile? ▾';
    });
}
