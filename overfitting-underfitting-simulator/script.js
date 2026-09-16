const canvas = document.getElementById('plotCanvas');
const ctx = canvas.getContext('2d');
const X_MIN = -5, X_MAX = 5;

function trueFunction(x) {
    // Un'onda, non una retta: nessun polinomio di grado 1 può inseguirla bene,
    // garantendo un underfitting ben visibile ai gradi bassi (calibrato
    // empiricamente insieme al livello di rumore qui sotto).
    return 3.5 * Math.sin(x) + 3;
}

// Campiona `count` punti x con un "jitter" stratificato: divide il dominio in
// altrettante fasce uguali e sceglie un punto casuale dentro ciascuna. Così
// non si formano mai grandi buchi vicino ai bordi, che altrimenti farebbero
// esplodere in modo poco istruttivo i polinomi di grado alto tra un punto e
// l'altro (una versione del fenomeno di Runge).
function stratifiedX(count) {
    const binWidth = (X_MAX - X_MIN) / count;
    const xs = [];
    for (let i = 0; i < count; i++) {
        const binStart = X_MIN + i * binWidth;
        xs.push(binStart + Math.random() * binWidth);
    }
    return xs;
}

function generateData() {
    const train = stratifiedX(10).map(x => ({ x, y: trueFunction(x) + (Math.random() - 0.5) * 2.6 }));
    const test = stratifiedX(6).map(x => ({ x, y: trueFunction(x) + (Math.random() - 0.5) * 2.6 }));
    return { train, test };
}

// Risolve A·x = b con eliminazione di Gauss-Jordan e pivot parziale.
function solveLinearSystem(A, b) {
    const n = b.length;
    const M = A.map((row, i) => [...row, b[i]]);
    for (let col = 0; col < n; col++) {
        let maxRow = col;
        for (let row = col + 1; row < n; row++) {
            if (Math.abs(M[row][col]) > Math.abs(M[maxRow][col])) maxRow = row;
        }
        [M[col], M[maxRow]] = [M[maxRow], M[col]];
        const pivot = M[col][col];
        if (Math.abs(pivot) < 1e-10) continue;
        for (let row = 0; row < n; row++) {
            if (row === col) continue;
            const factor = M[row][col] / pivot;
            for (let k = col; k <= n; k++) {
                M[row][k] -= factor * M[col][k];
            }
        }
    }
    return M.map((row, i) => (Math.abs(row[i]) < 1e-10 ? 0 : row[n] / row[i]));
}

// Regressione polinomiale via equazioni normali (X^T X) β = X^T y, in
// coordinate x normalizzate a [-1,1] per stabilità numerica ai gradi alti.
function polyFit(points, degree) {
    const n = degree + 1;
    const XtX = Array.from({ length: n }, () => new Array(n).fill(0));
    const Xty = new Array(n).fill(0);

    points.forEach(({ x, y }) => {
        const xn = x / X_MAX;
        const powers = [1];
        for (let d = 1; d <= degree; d++) powers.push(powers[d - 1] * xn);
        for (let a = 0; a < n; a++) {
            Xty[a] += powers[a] * y;
            for (let bIdx = 0; bIdx < n; bIdx++) {
                XtX[a][bIdx] += powers[a] * powers[bIdx];
            }
        }
    });

    for (let a = 0; a < n; a++) XtX[a][a] += 1e-5; // piccola regolarizzazione per stabilità

    return solveLinearSystem(XtX, Xty); // coefficienti in x normalizzato
}

function evalModel(coeffs, x) {
    const xn = x / X_MAX;
    let result = 0;
    let p = 1;
    for (let d = 0; d < coeffs.length; d++) {
        result += coeffs[d] * p;
        p *= xn;
    }
    return result;
}

function meanSquaredError(coeffs, points) {
    const sum = points.reduce((acc, { x, y }) => {
        const pred = evalModel(coeffs, x);
        return acc + (pred - y) ** 2;
    }, 0);
    return sum / points.length;
}

let state = {
    data: generateData(),
    degree: 5
};

function resizeCanvasIfNeeded() {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
}

function render() {
    resizeCanvasIfNeeded();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const coeffs = polyFit(state.data.train, state.degree);
    const allPoints = [...state.data.train, ...state.data.test];
    let yMin = Math.min(...allPoints.map(p => p.y));
    let yMax = Math.max(...allPoints.map(p => p.y));
    const pad = (yMax - yMin) * 0.2 || 1;
    yMin -= pad;
    yMax += pad;

    const margin = 25;
    const toX = x => margin + ((x - X_MIN) / (X_MAX - X_MIN)) * (canvas.width - margin * 2);
    const toY = y => canvas.height - margin - ((y - yMin) / (yMax - yMin)) * (canvas.height - margin * 2);

    // Curva del modello (clippata visivamente se esplode fuori dal range y)
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let started = false;
    for (let x = X_MIN; x <= X_MAX; x += 0.04) {
        const y = evalModel(coeffs, x);
        const clampedY = Math.max(yMin - pad, Math.min(yMax + pad, y));
        const px = toX(x);
        const py = toY(clampedY);
        if (!started) { ctx.moveTo(px, py); started = true; } else { ctx.lineTo(px, py); }
    }
    ctx.stroke();

    // Punti di test (cerchi vuoti, rosa)
    state.data.test.forEach(({ x, y }) => {
        const px = toX(x), py = toY(y);
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Punti di addestramento (cerchi pieni, teal)
    state.data.train.forEach(({ x, y }) => {
        const px = toX(x), py = toY(y);
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#0d9488';
        ctx.fill();
    });

    renderStats(coeffs);
}

function renderStats(coeffs) {
    const trainMSE = meanSquaredError(coeffs, state.data.train);
    const testMSE = meanSquaredError(coeffs, state.data.test);

    // Le barre usano una scala non lineare (radice quadrata) perché in
    // overfitting l'errore di test può esplodere di ordini di grandezza.
    const maxBar = 8;
    const trainPct = Math.min(100, (Math.sqrt(trainMSE) / maxBar) * 100);
    const testPct = Math.min(100, (Math.sqrt(testMSE) / maxBar) * 100);

    document.getElementById('barTrain').style.width = trainPct + '%';
    document.getElementById('barTest').style.width = testPct + '%';
    document.getElementById('valueTrain').textContent = trainMSE.toFixed(2);
    document.getElementById('valueTest').textContent = testMSE > 999 ? '>999' : testMSE.toFixed(2);

    const verdict = document.getElementById('verdictText');
    verdict.className = 'verdict';
    if (trainMSE > 1.6 && testMSE > 1.6) {
        verdict.textContent = '📉 Underfitting: il modello è troppo semplice, sbaglia anche sui dati che ha visto durante l\'addestramento.';
        verdict.classList.add('underfit');
    } else if (testMSE > trainMSE * 2.5 + 1) {
        verdict.textContent = '📈 Overfitting: errore bassissimo sui dati di addestramento, ma alto su quelli mai visti — il modello ha "memorizzato" il rumore.';
        verdict.classList.add('overfit');
    } else {
        verdict.textContent = '✓ Buon compromesso: il modello generalizza bene, l\'errore è simile su entrambi i gruppi di dati.';
        verdict.classList.add('good');
    }
}

document.getElementById('degreeSlider').addEventListener('input', (e) => {
    state.degree = parseInt(e.target.value);
    document.getElementById('degreeValue').textContent = state.degree;
    render();
});

document.getElementById('newDataBtn').addEventListener('click', () => {
    state.data = generateData();
    render();
});

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Perché un polinomio di grado alto passa per tutti i punti? ▸'
        : 'Perché un polinomio di grado alto passa per tutti i punti? ▾';
});

window.addEventListener('resize', render);

render();
