// --- Coda FIFO vs coda con priorità -----------------------------------------
// La logica pura (buildTimeline più sotto, nella forma simulateQueue
// testata) è stata verificata a parte in Node: lavoro totale conservato,
// nessuna sovrapposizione tra trasmissioni, attesa media e jitter della
// videochiamata sempre più bassi con la priorità che con FIFO, e l'attesa
// media del download sempre maggiore con la priorità (il tradeoff atteso).

function labelType(type) { return type === 'video' ? 'videochiamata' : 'download'; }

// Genera una raffica di pacchetti: i download arrivano fitti, a due alla
// volta, all'inizio; i pacchetti della videochiamata arrivano a intervalli
// regolari, piccoli e frequenti.
function proceduralBurst(numDownload, numVideo) {
    const arrivals = [];
    let id = 0;
    for (let i = 0; i < numDownload; i++) {
        arrivals.push({ id: id++, time: Math.floor(i / 2), type: 'download', size: 10 });
    }
    for (let i = 0; i < numVideo; i++) {
        arrivals.push({ id: id++, time: 1 + i * 2, type: 'video', size: 2 });
    }
    return arrivals;
}

// Simulazione a eventi discreti di una coda con un solo server (il link),
// non preemptive: un pacchetto in trasmissione non viene mai interrotto.
// mode: 'fifo' | 'priority'. Ritorna un elenco di "passi" già pronti per
// l'interfaccia (arrivo, inizio trasmissione, fine trasmissione), ciascuno
// con lo stato della coda in quel momento.
function buildTimeline(arrivals, mode) {
    const sorted = arrivals.slice().sort((a, b) => a.time - b.time || a.id - b.id);
    const n = sorted.length;
    let idx = 0;
    let serverFreeAt = 0;
    const pending = [];
    const steps = [];
    let guard = 0;

    function snapshotQueue() { return pending.map(p => ({ ...p })); }

    function enqueueUpTo(time) {
        while (idx < n && sorted[idx].time <= time) {
            const p = { ...sorted[idx] };
            pending.push(p);
            steps.push({
                kind: 'arrival', time: p.time, packet: p, queue: snapshotQueue(), inTransit: null,
                text: `t=${p.time}: arriva un pacchetto ${labelType(p.type)} (dimensione ${p.size}).`
            });
            idx++;
        }
    }

    if (n === 0) {
        steps.push({ kind: 'done', time: 0, queue: [], inTransit: null, text: 'Nessun pacchetto da inviare: imposta N e/o M e premi "Invia raffica".' });
        return { steps, transmitted: [] };
    }

    const transmitted = [];
    while ((idx < n || pending.length > 0) && guard < 5000) {
        guard++;
        enqueueUpTo(serverFreeAt);
        if (pending.length === 0) {
            if (idx >= n) break;
            serverFreeAt = sorted[idx].time; // il link resta inattivo finché non arriva qualcosa
            continue;
        }
        let pkt;
        if (mode === 'priority') {
            const vIdx = pending.findIndex(p => p.type === 'video');
            pkt = vIdx >= 0 ? pending.splice(vIdx, 1)[0] : pending.shift();
        } else {
            pkt = pending.shift();
        }
        const start = serverFreeAt;
        const finish = start + pkt.size;
        const wait = start - pkt.time;
        const txPkt = { ...pkt, start, finish, wait };

        steps.push({
            kind: 'tx-start', time: start, packet: txPkt, queue: snapshotQueue(), inTransit: txPkt,
            text: `t=${start}: il link estrae dalla coda il pacchetto ${labelType(pkt.type)}` +
                (mode === 'priority' && pkt.type === 'video' ? ' (ha la priorità)' : '') +
                ` e lo trasmette (durata ${pkt.size}). Ha aspettato in coda <strong>${wait}</strong> unità di tempo.`
        });
        steps.push({
            kind: 'tx-end', time: finish, packet: txPkt, queue: snapshotQueue(), inTransit: null,
            text: `t=${finish}: trasmissione del pacchetto ${labelType(pkt.type)} completata (atteso ${wait} unità in coda).`
        });

        transmitted.push(txPkt);
        serverFreeAt = finish;
    }

    steps.push({ kind: 'done', time: serverFreeAt, queue: [], inTransit: null, text: `Raffica completata al tempo t=${serverFreeAt}: tutti i pacchetti sono stati trasmessi.` });
    return { steps, transmitted };
}

function mean(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }
function stdev(arr) {
    if (!arr.length) return 0;
    const m = mean(arr);
    return Math.sqrt(mean(arr.map(x => (x - m) ** 2)));
}

// --- Interfaccia: un "runner" indipendente per ciascuna colonna ------------

function makeRunner(prefix, mode) {
    let steps = [];
    let transmitted = [];
    let current = -1;
    let interval = null;

    function pktChip(p, inTransit) {
        const cls = p.type === 'video' ? 'video' : 'download';
        return `<div class="pkt ${cls} ${inTransit ? 'in-transit' : ''}" title="${labelType(p.type)}, dimensione ${p.size}">${p.type === 'video' ? '📞' : '⬇️'}</div>`;
    }

    function renderQueue() {
        const step = current >= 0 ? steps[current] : { queue: [], inTransit: null };
        const linkEl = document.getElementById(prefix + 'Link');
        if (step.inTransit) {
            linkEl.classList.remove('empty');
            linkEl.innerHTML = `<span class="link-label">In trasmissione</span> ${pktChip(step.inTransit, true)} ${labelType(step.inTransit.type)} (dimensione ${step.inTransit.size}, atteso ${step.inTransit.wait})`;
        } else {
            linkEl.classList.add('empty');
            linkEl.textContent = 'Link libero, in attesa di pacchetti…';
        }

        const queueEl = document.getElementById(prefix + 'Queue');
        if (!step.queue || step.queue.length === 0) {
            queueEl.innerHTML = '<span class="empty-text">coda vuota</span>';
        } else {
            queueEl.innerHTML = step.queue.map(p => pktChip(p, false)).join('');
        }
    }

    function renderSteps() {
        const panel = document.getElementById(prefix + 'StepPanel');
        panel.innerHTML = steps.slice(0, current + 1).map((s, i) =>
            `<div class="step-line ${i === current ? 'current' : ''}">${s.text}</div>`
        ).join('');
        panel.scrollTop = panel.scrollHeight;
        const atLast = current >= steps.length - 1;
        document.getElementById(prefix + 'StepBtn').disabled = atLast;
        document.getElementById(prefix + 'PlayBtn').disabled = atLast;
    }

    function renderStats() {
        const doneTx = current >= 0 ? transmitted.filter(p => steps.findIndex(s => s.kind === 'tx-end' && s.packet === p) <= current) : [];
        const videoWaits = doneTx.filter(p => p.type === 'video').map(p => p.wait);
        const downloadWaits = doneTx.filter(p => p.type === 'download').map(p => p.wait);
        document.getElementById(prefix + 'VideoAvg').textContent = videoWaits.length ? mean(videoWaits).toFixed(1) : '—';
        document.getElementById(prefix + 'VideoJitter').textContent = videoWaits.length ? stdev(videoWaits).toFixed(1) : '—';
        document.getElementById(prefix + 'DownloadAvg').textContent = downloadWaits.length ? mean(downloadWaits).toFixed(1) : '—';
    }

    function render() {
        renderQueue();
        renderSteps();
        renderStats();
    }

    function stopAuto() {
        if (interval) clearInterval(interval);
        interval = null;
        document.getElementById(prefix + 'PlayBtn').textContent = '▶ Avvia';
    }

    function advance() {
        if (current >= steps.length - 1) { stopAuto(); return; }
        current++;
        render();
        if (current >= steps.length - 1) stopAuto();
    }

    function startAuto() {
        if (current >= steps.length - 1) return;
        stopAuto();
        document.getElementById(prefix + 'PlayBtn').textContent = '⏸ Pausa';
        interval = setInterval(advance, 500);
    }

    function load(arrivals) {
        stopAuto();
        const timeline = buildTimeline(arrivals, mode);
        steps = timeline.steps;
        transmitted = timeline.transmitted;
        current = -1;
        render();
    }

    render(); // stato vuoto iniziale, prima che qualunque raffica sia stata caricata

    return {
        load,
        startAuto,
        stepOnce() { stopAuto(); advance(); }
    };
}

const fifoRunner = makeRunner('fifo', 'fifo');
const prioRunner = makeRunner('prio', 'priority');

function sendBurst() {
    const numDownload = Math.max(0, Math.min(16, parseInt(document.getElementById('numDownload').value, 10) || 0));
    const numVideo = Math.max(0, Math.min(16, parseInt(document.getElementById('numVideo').value, 10) || 0));
    const arrivals = proceduralBurst(numDownload, numVideo);
    fifoRunner.load(arrivals);
    prioRunner.load(arrivals);
}

document.getElementById('burstBtn').addEventListener('click', sendBurst);
document.getElementById('fifoPlayBtn').addEventListener('click', fifoRunner.startAuto);
document.getElementById('fifoStepBtn').addEventListener('click', fifoRunner.stepOnce);
document.getElementById('prioPlayBtn').addEventListener('click', prioRunner.startAuto);
document.getElementById('prioStepBtn').addEventListener('click', prioRunner.stepOnce);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché non dare sempre priorità assoluta alla videochiamata? ▸'
        : 'Perché non dare sempre priorità assoluta alla videochiamata? ▾';
});

// Inizializzazione: una raffica di default deve già esistere al
// caricamento, così "Passo singolo" funziona fin da subito in entrambe le
// colonne senza dover prima premere "Invia raffica" o "Avvia".
sendBurst();
