// --- Motore della macchina --------------------------------------------
// Il valore accumulato è rappresentato da N ruote decimali, indicizzate
// dalla meno significativa (unità, indice 0) alla più significativa
// (indice N-1). Sommare un numero significa, per ciascuna cifra
// dell'addendo, girare la ruota corrispondente in avanti di altrettanti
// scatti: ogni scatto che fa passare una ruota da 9 a 0 fa scattare
// automaticamente il "sautoir", che spinge la ruota successiva avanti di
// uno scatto (il riporto). Questa logica di riporto a cascata è stata
// verificata a parte in Node su vari casi (incluso l'overflow oltre
// l'ultima ruota) prima di essere inserita qui.

const N = 6;
const PLACE_LABELS = ['10⁵', '10⁴', '10³', '10²', '10¹', '10⁰'];

let wheels = new Array(N).fill(0);
let busy = false;
let lastOverflow = false;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function currentSpeed() {
    return parseInt(document.getElementById('speedSlider').value, 10);
}

// Un singolo scatto della ruota all'indice `i` (0 = unità). Ritorna true
// se questo scatto ha causato un riporto oltre l'ultima ruota
// (overflow), altrimenti false. Le ruote coinvolte in un riporto vengono
// passate a `carried` per l'evidenziazione visiva.
function clickWheel(i, carried) {
    if (i >= N) return true; // riporto oltre l'ultima ruota: overflow
    wheels[i] += 1;
    if (wheels[i] === 10) {
        wheels[i] = 0;
        carried.add(i);
        return clickWheel(i + 1, carried);
    }
    return false;
}

function renderWheels(highlight) {
    const row = document.getElementById('wheelsRow');
    row.innerHTML = '';
    for (let display = 0; display < N; display++) {
        const i = N - 1 - display; // indice interno (0 = unità) per la posizione mostrata
        const wheel = document.createElement('div');
        wheel.className = 'wheel';

        const place = document.createElement('div');
        place.className = 'wheel-place';
        place.textContent = PLACE_LABELS[display];
        wheel.appendChild(place);

        const digit = document.createElement('div');
        digit.className = 'wheel-digit';
        if (highlight && highlight.turning === i) digit.classList.add('turning');
        if (highlight && highlight.carried && highlight.carried.has(i)) digit.classList.add('carrying');
        digit.textContent = String(wheels[i]);
        wheel.appendChild(digit);

        const btn = document.createElement('button');
        btn.className = 'wheel-btn';
        btn.textContent = '+1';
        btn.disabled = busy;
        btn.addEventListener('click', () => manualClick(i));
        wheel.appendChild(btn);

        row.appendChild(wheel);
    }
    renderValue();
}

function renderValue() {
    const value = wheels.slice().reverse().join('');
    document.getElementById('valueDisplay').textContent = value.replace(/^0+(?=\d)/, '');

    const overflowText = document.getElementById('overflowText');
    if (lastOverflow) {
        overflowText.textContent = '🔔 Il riporto ha superato l\'ultima ruota: il risultato vero non entra in 6 cifre, la macchina si ferma a quello che riesce a rappresentare.';
        overflowText.classList.remove('hidden');
    } else {
        overflowText.classList.add('hidden');
    }
}

function setBusy(value) {
    busy = value;
    document.getElementById('addBtn').disabled = busy;
    document.getElementById('resetBtn').disabled = busy;
    document.querySelectorAll('.wheel-btn').forEach(b => b.disabled = busy);
}

async function manualClick(i) {
    if (busy) return;
    setBusy(true);
    const carried = new Set();
    const overflowed = clickWheel(i, carried);
    lastOverflow = lastOverflow || overflowed;
    renderWheels({ turning: i, carried });
    await sleep(currentSpeed());
    renderWheels(null);
    setBusy(false);
}

async function addNumber(addend) {
    if (busy) return;
    setBusy(true);
    lastOverflow = false;
    const digits = String(addend).padStart(N, '0').split('').reverse().map(Number);
    for (let i = 0; i < N; i++) {
        for (let k = 0; k < digits[i]; k++) {
            const carried = new Set();
            const overflowed = clickWheel(i, carried);
            lastOverflow = lastOverflow || overflowed;
            renderWheels({ turning: i, carried });
            await sleep(currentSpeed());
        }
    }
    renderWheels(null);
    setBusy(false);
}

function resetMachine() {
    if (busy) return;
    wheels = new Array(N).fill(0);
    lastOverflow = false;
    renderWheels(null);
}

function doAdd() {
    const input = document.getElementById('addInput');
    const errorEl = document.getElementById('addError');
    const raw = input.value.trim();
    if (!/^\d{1,6}$/.test(raw) || parseInt(raw, 10) > 999999) {
        errorEl.textContent = 'Inserisci un numero intero tra 0 e 999999.';
        errorEl.classList.remove('hidden');
        return;
    }
    errorEl.classList.add('hidden');
    addNumber(parseInt(raw, 10));
}

document.getElementById('addBtn').addEventListener('click', doAdd);
document.getElementById('resetBtn').addEventListener('click', resetMachine);
document.getElementById('addInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doAdd();
});

document.getElementById('speedSlider').addEventListener('input', (e) => {
    document.getElementById('speedValue').textContent = e.target.value + ' ms/scatto';
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Come faceva a sottrarre, se sa solo sommare? ▸'
        : 'Come faceva a sottrarre, se sa solo sommare? ▾';
});

// Inizializzazione
document.getElementById('speedSlider').dispatchEvent(new Event('input'));
renderWheels(null);
