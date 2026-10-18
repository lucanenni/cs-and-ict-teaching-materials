// --- Multiplexing: TDM (divisione nel tempo) vs FDM (divisione in frequenza)
// La logica pura (buildTDMSteps/buildFDMSteps più sotto) è stata verificata a
// parte in Node: pattern round robin esatto per 3 e 4 flussi (ogni flusso
// occupa esattamente TOTAL_SLOTS/N slot, mai più di un flusso per slot), FDM
// che attiva le bande nell'ordine dei flussi fino a renderle tutte attive
// insieme, e le frazioni di banda/tempo per flusso calcolate correttamente
// nei due casi (incluso il caso senza flussi, senza divisioni per zero).

const TOTAL_SLOTS = 12;

const PALETTE = [
    { id: 'a', name: 'Conversazione A', color: '#1d4ed8' },
    { id: 'b', name: 'Conversazione B', color: '#16a34a' },
    { id: 'c', name: 'Conversazione C', color: '#ca8a04' },
    { id: 'd', name: 'Conversazione D', color: '#dc2626' },
];

function buildTDMSteps(flowIds) {
    const steps = [];
    if (flowIds.length === 0) return steps;
    for (let i = 0; i < TOTAL_SLOTS; i++) {
        const flow = flowIds[i % flowIds.length];
        steps.push({
            slotIndex: i,
            flow,
            text: `Slot ${i + 1}/${TOTAL_SLOTS}: il canale è assegnato per intero al flusso ${flow.toUpperCase()}. Tutti gli altri flussi aspettano il loro turno.`
        });
    }
    steps.push({ slotIndex: -1, flow: null, done: true, text: `Timeline completata: ${flowIds.length} flussi si sono alternati ${TOTAL_SLOTS / flowIds.length} volte ciascuno, un turno alla volta.` });
    return steps;
}

function buildFDMSteps(flowIds) {
    const steps = [];
    flowIds.forEach(flow => {
        steps.push({ flow, text: `La sotto-banda di frequenza riservata al flusso ${flow.toUpperCase()} si accende e resta sua in modo permanente, finché dura la comunicazione.` });
    });
    if (flowIds.length > 0) {
        steps.push({ flow: null, allActive: true, text: `Ora tutti i ${flowIds.length} flussi trasmettono simultaneamente, ciascuno confinato per sempre nella propria fetta di banda: nessuno aspetta il proprio turno, ma ciascuno ha a disposizione solo una porzione della banda totale.` });
    }
    return steps;
}

function summarize(flowIds) {
    const n = flowIds.length;
    if (n === 0) return null;
    return {
        tdmSharePerFlow: { bandwidthFraction: 1, timeFraction: 1 / n },
        fdmSharePerFlow: { bandwidthFraction: 1 / n, timeFraction: 1 }
    };
}

// --- Interfaccia -------------------------------------------------------------

let activeFlowCount = 3;
let flows = PALETTE.slice(0, activeFlowCount);

function flowById(id) { return flows.find(f => f.id === id); }

function buildLegend() {
    const wrap = document.getElementById('flowLegend');
    wrap.innerHTML = flows.map(f => `<span class="flow-chip"><span class="flow-dot" style="background:${f.color}"></span>${f.name}</span>`).join('');
}

function buildTDMDiagram() {
    const wrap = document.getElementById('tdmTimeline');
    wrap.innerHTML = '';
    for (let i = 0; i < TOTAL_SLOTS; i++) {
        const slot = document.createElement('div');
        slot.className = 'tdm-slot';
        slot.id = 'tdmslot-' + i;
        slot.innerHTML = `<div>·</div><div class="tdm-slot-num">${i + 1}</div>`;
        wrap.appendChild(slot);
    }
}

function buildFDMDiagram() {
    const wrap = document.getElementById('fdmSpectrum');
    wrap.innerHTML = '';
    flows.forEach(f => {
        const row = document.createElement('div');
        row.className = 'fdm-band-row';
        row.id = 'fdmrow-' + f.id;
        row.innerHTML = `
            <div class="fdm-band-label">${f.name}</div>
            <div class="fdm-band-track"><div class="fdm-band-fill" style="background:${f.color}"></div></div>
        `;
        wrap.appendChild(row);
    });
}

function makeRunner(opts) {
    // opts: { steps, panelId, playBtnId, stepBtnId, renderFrame, speed }
    let current = -1;
    let interval = null;

    function renderSteps() {
        const panel = document.getElementById(opts.panelId);
        panel.innerHTML = opts.steps.slice(0, current + 1).map((s, i) =>
            `<div class="step-line ${i === current ? 'current' : ''}">${i + 1}. ${s.text}</div>`
        ).join('');
        panel.scrollTop = panel.scrollHeight;
    }

    function render() {
        opts.renderFrame(current >= 0 ? opts.steps[current] : null);
        renderSteps();
        const atLast = current >= opts.steps.length - 1;
        document.getElementById(opts.stepBtnId).disabled = atLast;
        document.getElementById(opts.playBtnId).disabled = atLast;
        document.getElementById(opts.playBtnId).textContent = interval ? '⏸ Pausa' : (atLast ? '✓ Fatto' : '▶ Avvia');
        checkBothDone();
    }

    function stopAuto() {
        if (interval) clearInterval(interval);
        interval = null;
    }

    function advance() {
        if (current >= opts.steps.length - 1) { stopAuto(); render(); return; }
        current++;
        render();
        if (current >= opts.steps.length - 1) stopAuto();
    }

    render();

    return {
        startAuto() {
            if (current >= opts.steps.length - 1) return;
            stopAuto();
            render();
            interval = setInterval(advance, opts.speed);
        },
        togglePlay() {
            if (interval) { stopAuto(); render(); } else { this.startAuto(); }
        },
        stepOnce() { stopAuto(); advance(); },
        reset(newSteps) { stopAuto(); opts.steps = newSteps; current = -1; render(); },
        isAtLast() { return current >= opts.steps.length - 1; }
    };
}

let tdmRunner = null;
let fdmRunner = null;

function checkBothDone() {
    const box = document.getElementById('summaryBox');
    if (!tdmRunner || !fdmRunner) return;
    if (tdmRunner.isAtLast() && fdmRunner.isAtLast()) {
        box.classList.remove('hidden');
        box.innerHTML = `
            <strong>TDM</strong> condivide dividendo nel <strong>tempo</strong>: un flusso alla volta, a turno
            rapido — a ciascun flusso sembra di avere tutta la banda, ma solo per 1/${flows.length} del tempo.
            <strong>FDM</strong> condivide dividendo nello <strong>spettro</strong>: tutti insieme nello stesso
            istante, ma ciascuno con una porzione permanente e più piccola (1/${flows.length}) della banda
            totale. Due modi opposti di dividere lo stesso canale fisico tra ${flows.length} flussi.
        `;
    } else {
        box.classList.add('hidden');
    }
}

function rebuildTDM() {
    // reset visuale
    for (let i = 0; i < TOTAL_SLOTS; i++) {
        const el = document.getElementById('tdmslot-' + i);
        if (el) { el.className = 'tdm-slot'; el.style.background = ''; el.style.color = ''; }
    }
    const steps = buildTDMSteps(flows.map(f => f.id));
    if (tdmRunner) {
        tdmRunner.reset(steps);
    } else {
        tdmRunner = makeRunner({
            steps,
            panelId: 'tdmStepPanel',
            playBtnId: 'tdmPlayBtn',
            stepBtnId: 'tdmStepBtn',
            speed: 500,
            renderFrame(step) {
                for (let i = 0; i < TOTAL_SLOTS; i++) {
                    const el = document.getElementById('tdmslot-' + i);
                    const s = steps[i];
                    const revealedNow = step && ((step.slotIndex >= 0 && i <= step.slotIndex) || step.done);
                    if (revealedNow && s) {
                        const f = flowById(s.flow);
                        el.className = 'tdm-slot filled' + (step.slotIndex === i ? ' current' : '');
                        el.style.background = f.color;
                        el.style.color = 'white';
                        el.querySelector('div').textContent = s.flow.toUpperCase();
                    } else {
                        el.className = 'tdm-slot';
                        el.style.background = '';
                        el.style.color = '';
                        el.querySelector('div').textContent = '·';
                    }
                }
            }
        });
    }
}

function rebuildFDM() {
    const steps = buildFDMSteps(flows.map(f => f.id));
    if (fdmRunner) {
        fdmRunner.reset(steps);
    } else {
        fdmRunner = makeRunner({
            steps,
            panelId: 'fdmStepPanel',
            playBtnId: 'fdmPlayBtn',
            stepBtnId: 'fdmStepBtn',
            speed: 650,
            renderFrame(step) {
                const activatedUpTo = step ? flows.findIndex(f => f.id === step.flow) : -1;
                const allActive = step && step.allActive;
                flows.forEach((f, i) => {
                    const row = document.getElementById('fdmrow-' + f.id);
                    const isActive = allActive || i <= activatedUpTo;
                    row.classList.toggle('active', Boolean(isActive));
                });
            }
        });
    }
}

function rebuildAll() {
    buildLegend();
    buildTDMDiagram();
    buildFDMDiagram();
    rebuildTDM();
    rebuildFDM();
}

function setFlowCount(n) {
    activeFlowCount = n;
    flows = PALETTE.slice(0, n);
    document.getElementById('flows3Btn').classList.toggle('active', n === 3);
    document.getElementById('flows4Btn').classList.toggle('active', n === 4);
    // il conteggio flussi cambia la forma dei diagrammi: vanno ricreati da zero
    tdmRunner = null;
    fdmRunner = null;
    rebuildAll();
}

document.getElementById('flows3Btn').addEventListener('click', () => setFlowCount(3));
document.getElementById('flows4Btn').addEventListener('click', () => setFlowCount(4));

document.getElementById('tdmPlayBtn').addEventListener('click', () => tdmRunner.togglePlay());
document.getElementById('tdmStepBtn').addEventListener('click', () => tdmRunner.stepOnce());
document.getElementById('fdmPlayBtn').addEventListener('click', () => fdmRunner.togglePlay());
document.getElementById('fdmStepBtn').addEventListener('click', () => fdmRunner.stepOnce());

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden ? 'Dove si usano davvero? ▸' : 'Dove si usano davvero? ▾';
});

// Inizializzazione: scenario, diagrammi e primo render devono esistere SUBITO
// al caricamento, così "Passo singolo" funziona fin da subito su entrambe le
// timeline senza dover prima premere "Avvia".
document.getElementById('flows3Btn').classList.add('active');
rebuildAll();
