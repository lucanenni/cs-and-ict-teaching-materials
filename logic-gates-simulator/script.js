const GATES = {
    AND: {
        inputCount: 2,
        fn: (a, b) => (a && b) ? 1 : 0,
        explain: ['• L\'output è 1 solo se <strong>entrambi</strong> gli input sono 1: è come dire "questo E quello".', '• In tutti gli altri casi, l\'output è 0.']
    },
    OR: {
        inputCount: 2,
        fn: (a, b) => (a || b) ? 1 : 0,
        explain: ['• L\'output è 1 se <strong>almeno uno</strong> dei due input è 1: è come dire "questo O quello".', '• L\'output è 0 solo quando entrambi gli input sono 0.']
    },
    NOT: {
        inputCount: 1,
        fn: (a) => a ? 0 : 1,
        explain: ['• L\'unica porta con un solo input: <strong>inverte</strong> semplicemente il valore che riceve.', '• 0 diventa 1, e 1 diventa 0.']
    },
    XOR: {
        inputCount: 2,
        fn: (a, b) => (a !== b) ? 1 : 0,
        explain: ['• "OR esclusivo": l\'output è 1 solo se i due input sono <strong>diversi</strong> tra loro.', '• Se sono uguali (entrambi 0 o entrambi 1), l\'output è 0.']
    },
    NAND: {
        inputCount: 2,
        fn: (a, b) => (a && b) ? 0 : 1,
        explain: ['• L\'esatto opposto di AND: l\'output è 0 solo quando entrambi gli input sono 1.', '• NAND (e NOR) sono speciali: con sole porte NAND si può costruire qualunque altro circuito logico.']
    },
    NOR: {
        inputCount: 2,
        fn: (a, b) => (a || b) ? 0 : 1,
        explain: ['• L\'esatto opposto di OR: l\'output è 1 solo quando entrambi gli input sono 0.', '• Come NAND, anche NOR da sola basta a costruire qualsiasi circuito logico.']
    }
};

let state = {
    gate: 'AND',
    inputs: [1, 0, 0] // fino a 3 input (A, B, C); usati solo quelli rilevanti
};

function buildCircuit() {
    const box = document.getElementById('circuitBox');
    box.innerHTML = '';

    if (state.gate === 'COMBO') {
        buildComboCircuit(box);
        return;
    }

    const gate = GATES[state.gate];
    const values = state.inputs.slice(0, gate.inputCount);
    const output = gate.fn(...values);

    const stage = document.createElement('div');
    stage.className = 'circuit-stage';

    const inputsCol = document.createElement('div');
    inputsCol.className = 'inputs-col';
    values.forEach((val, i) => {
        inputsCol.appendChild(makeInputToggle(String.fromCharCode(65 + i), i, val));
    });
    stage.appendChild(inputsCol);

    const wire1 = document.createElement('div');
    wire1.className = 'wire' + (values.some(v => v) ? '' : '');
    stage.appendChild(wire1);

    const gateBox = document.createElement('div');
    gateBox.className = 'gate-box';
    gateBox.textContent = state.gate;
    stage.appendChild(gateBox);

    const wire2 = document.createElement('div');
    wire2.className = 'wire' + (output ? ' live' : '');
    stage.appendChild(wire2);

    stage.appendChild(makeOutputLamp(output, 'Q'));

    box.appendChild(stage);
    renderTruthTable(gate, gate.inputCount, values);
    renderExplain(state.gate);
}

function buildComboCircuit(box) {
    // Circuito: (A AND B) OR C
    // I due "rami" che alimentano l'OR (il risultato di A AND B, e C) sono
    // impilati verticalmente uno sopra l'altro, esattamente come i due input
    // di un normale gate a 2 ingressi: così è chiaro che sono due ingressi
    // separati dell'OR, non una catena A → B → C in fila.
    const [a, b, c] = state.inputs;
    const mid = GATES.AND.fn(a, b);
    const out = GATES.OR.fn(mid, c);

    const stage = document.createElement('div');
    stage.className = 'circuit-stage';

    const branchesCol = document.createElement('div');
    branchesCol.className = 'combo-branches-col';

    // Ramo superiore: A, B → AND
    const branchTop = document.createElement('div');
    branchTop.className = 'combo-branch';
    const miniInputs = document.createElement('div');
    miniInputs.className = 'inputs-col mini';
    miniInputs.appendChild(makeInputToggle('A', 0, a));
    miniInputs.appendChild(makeInputToggle('B', 1, b));
    branchTop.appendChild(miniInputs);
    const miniWire = document.createElement('div');
    miniWire.className = 'wire mini-wire' + ((a && b) ? ' live' : '');
    branchTop.appendChild(miniWire);
    const gate1 = document.createElement('div');
    gate1.className = 'gate-box mini';
    gate1.innerHTML = `AND<div class="intermediate-label">→ ${mid}</div>`;
    branchTop.appendChild(gate1);
    branchesCol.appendChild(branchTop);

    // Ramo inferiore: C da solo, allo stesso "livello" di uscita del ramo AND
    const branchBottom = document.createElement('div');
    branchBottom.className = 'combo-branch';
    branchBottom.appendChild(makeInputToggle('C', 2, c));
    branchesCol.appendChild(branchBottom);

    stage.appendChild(branchesCol);

    const wireIntoOr = document.createElement('div');
    wireIntoOr.className = 'wire' + ((mid || c) ? ' live' : '');
    stage.appendChild(wireIntoOr);

    const gate2 = document.createElement('div');
    gate2.className = 'gate-box';
    gate2.textContent = 'OR';
    stage.appendChild(gate2);

    const wireOut = document.createElement('div');
    wireOut.className = 'wire' + (out ? ' live' : '');
    stage.appendChild(wireOut);

    stage.appendChild(makeOutputLamp(out, 'Q'));

    box.appendChild(stage);

    renderComboTruthTable(a, b, c, mid, out);
    document.getElementById('gateExplainList').innerHTML = `
        <li>• L'OR finale ha due ingressi, impilati qui sopra uno sopra l'altro come in un gate normale: il risultato di <strong>A AND B</strong> (ramo in alto) e <strong>C</strong> (ramo in basso).</li>
        <li>• Il risultato finale (Q) è quindi: <strong>Q = (A AND B) OR C</strong>.</li>
        <li>• Circuiti come questo, con tante porte semplici collegate, sono i mattoni con cui si costruisce qualunque calcolo dentro un computer.</li>
    `;
}

function makeInputToggle(label, index, value) {
    const wrap = document.createElement('div');
    wrap.className = 'input-toggle';

    const labelEl = document.createElement('span');
    labelEl.className = 'input-toggle-label';
    labelEl.textContent = label;
    wrap.appendChild(labelEl);

    const switchLabel = document.createElement('label');
    switchLabel.className = 'switch';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!value;
    input.addEventListener('change', (e) => {
        state.inputs[index] = e.target.checked ? 1 : 0;
        buildCircuit();
    });
    const slider = document.createElement('span');
    slider.className = 'slider-toggle';
    switchLabel.appendChild(input);
    switchLabel.appendChild(slider);
    wrap.appendChild(switchLabel);

    return wrap;
}

function makeOutputLamp(value, label) {
    const col = document.createElement('div');
    col.className = 'output-lamp-col';
    const lamp = document.createElement('div');
    lamp.className = 'output-lamp' + (value ? ' on' : '');
    lamp.textContent = value;
    col.appendChild(lamp);
    const lbl = document.createElement('div');
    lbl.className = 'output-label';
    lbl.textContent = label;
    col.appendChild(lbl);
    return col;
}

function renderTruthTable(gate, inputCount, currentValues) {
    const table = document.getElementById('truthTable');
    const headers = inputCount === 1 ? ['A', 'Q'] : ['A', 'B', 'Q'];
    let html = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';

    const rowsCount = Math.pow(2, inputCount);
    for (let i = 0; i < rowsCount; i++) {
        const bits = i.toString(2).padStart(inputCount, '0').split('').map(Number);
        const output = gate.fn(...bits);
        const isCurrent = bits.every((b, idx) => b === currentValues[idx]);
        html += `<tr class="${isCurrent ? 'current-row' : ''}">` +
            bits.map(b => `<td>${b}</td>`).join('') +
            `<td>${output}</td></tr>`;
    }
    table.innerHTML = html;
}

function renderComboTruthTable(a, b, c, mid, out) {
    const table = document.getElementById('truthTable');
    let html = '<tr><th>A</th><th>B</th><th>C</th><th>A AND B</th><th>Q</th></tr>';
    for (let i = 0; i < 8; i++) {
        const bits = i.toString(2).padStart(3, '0').split('').map(Number);
        const m = GATES.AND.fn(bits[0], bits[1]);
        const o = GATES.OR.fn(m, bits[2]);
        const isCurrent = bits[0] === a && bits[1] === b && bits[2] === c;
        html += `<tr class="${isCurrent ? 'current-row' : ''}">` +
            bits.map(bit => `<td>${bit}</td>`).join('') +
            `<td>${m}</td><td>${o}</td></tr>`;
    }
    table.innerHTML = html;
}

function renderExplain(gateName) {
    document.getElementById('gateExplainList').innerHTML = GATES[gateName].explain.map(li => `<li>${li}</li>`).join('');
}

document.getElementById('gateSelect').addEventListener('change', (e) => {
    state.gate = e.target.value;
    buildCircuit();
});

buildCircuit();
