const canvas = document.getElementById('neuronCanvas');
const ctx = canvas.getContext('2d');

// Get all controls
const controls = {
    input1: document.getElementById('input1'),
    input2: document.getElementById('input2'),
    input3: document.getElementById('input3'),
    weight1: document.getElementById('weight1'),
    weight2: document.getElementById('weight2'),
    weight3: document.getElementById('weight3'),
    bias: document.getElementById('bias'),
    activation: document.getElementById('activation'),
    scenario: document.getElementById('scenario')
};

// Scenarios with different statements and decisions
const scenarios = {
    weather: {
        statements: ['È nuvoloso', 'Ho l\'ombrello', 'Piove forte'],
        decision: ['Rimango a casa', 'Esco'],
        weights: [-0.5, 2.0, -1.0],  // nuvoloso negativo, ombrello molto positivo (compensa pioggia), pioggia negativo
        bias: 0.8  // tendenza base a uscire
    },
    movie: {
        statements: ['Ho tempo libero', 'Il film mi interessa', 'Sono stanco'],
        decision: ['Non guardo', 'Guardo il film'],
        weights: [1.5, 1.8, -1.3],  // tempo necessario, interesse forte, stanchezza impedisce
        bias: -1.0  // serve forte motivazione
    },
    study: {
        statements: ['L\'esame è vicino', 'Non ho capito l\'argomento', 'Ci sono compiti urgenti'],
        decision: ['Non studio', 'Studio'],
        weights: [1.5, 1.8, -1.2],  // esame vicino positivo, non capito = devo studiare, compiti urgenti negativi
        bias: -0.5  // serve motivazione per studiare
    }
};

// Update scenario
function updateScenario() {
    const scenario = scenarios[controls.scenario.value];
    document.getElementById('statement1').textContent = scenario.statements[0];
    document.getElementById('statement2').textContent = scenario.statements[1];
    document.getElementById('statement3').textContent = scenario.statements[2];

    controls.weight1.value = scenario.weights[0];
    controls.weight2.value = scenario.weights[1];
    controls.weight3.value = scenario.weights[2];
    controls.bias.value = scenario.bias;

    updateDisplays();
    calculate();
}

// Set canvas size
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    calculate();
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Update displays
function updateDisplays() {
    document.getElementById('input1Label').textContent = controls.input1.checked ? 'SÌ' : 'NO';
    document.getElementById('input2Label').textContent = controls.input2.checked ? 'SÌ' : 'NO';
    document.getElementById('input3Label').textContent = controls.input3.checked ? 'SÌ' : 'NO';
    document.getElementById('weight1Value').textContent = controls.weight1.value;
    document.getElementById('weight2Value').textContent = controls.weight2.value;
    document.getElementById('weight3Value').textContent = controls.weight3.value;
    document.getElementById('biasValue').textContent = controls.bias.value;
}

// Activation functions
function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

function relu(x) {
    return Math.max(0, x);
}

function tanh(x) {
    return Math.tanh(x);
}

function step(x) {
    return x >= 0 ? 1 : 0;
}

// Calculate output
function calculate() {
    const x1 = controls.input1.checked ? 1 : 0;
    const x2 = controls.input2.checked ? 1 : 0;
    const x3 = controls.input3.checked ? 1 : 0;
    const w1 = parseFloat(controls.weight1.value);
    const w2 = parseFloat(controls.weight2.value);
    const w3 = parseFloat(controls.weight3.value);
    const b = parseFloat(controls.bias.value);

    // Weighted sum
    const z = w1 * x1 + w2 * x2 + w3 * x3 + b;

    // Apply activation
    let output;
    const activationType = controls.activation.value;

    switch (activationType) {
        case 'sigmoid':
            output = sigmoid(z);
            break;
        case 'relu':
            output = relu(z);
            break;
        case 'tanh':
            output = tanh(z);
            break;
        case 'step':
            output = step(z);
            break;
    }

    // Get current scenario
    const scenario = scenarios[controls.scenario.value];

    // Determine decision
    let decision, decisionText;
    if (activationType === 'step') {
        decision = output >= 0.5 ? 'SÌ' : 'NO';
        decisionText = output >= 0.5 ? scenario.decision[1] : scenario.decision[0];
    } else {
        decision = (output * 100).toFixed(0) + '%';
        decisionText = `Probabilità: ${(output * 100).toFixed(0)}%`;
    }

    // Update display
    document.getElementById('outputValue').textContent = decision;
    document.getElementById('decisionText').textContent = decisionText;

    // Update formula
    const formula = `z = ${w1.toFixed(1)}×${x1} + ${w2.toFixed(1)}×${x2} + ${w3.toFixed(1)}×${x3} + ${b.toFixed(1)} = ${z.toFixed(3)}<br>
                    output = ${activationType}(${z.toFixed(3)}) = ${output.toFixed(3)}`;
    document.getElementById('formulaDisplay').innerHTML = formula;

    // Draw visualization
    drawNeuron(x1, x2, x3, w1, w2, w3, b, z, output);
}

// Draw neuron visualization
function drawNeuron(x1, x2, x3, w1, w2, w3, b, z, output) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const neuronRadius = 50;
    const inputX = 80;
    const outputX = canvas.width - 80;

    // Get current scenario for labels
    const scenario = scenarios[controls.scenario.value];

    // Input positions
    const inputs = [
        { x: inputX, y: centerY - 100, value: x1, weight: w1, label: scenario.statements[0].substring(0, 20) },
        { x: inputX, y: centerY, value: x2, weight: w2, label: scenario.statements[1].substring(0, 20) },
        { x: inputX, y: centerY + 100, value: x3, weight: w3, label: scenario.statements[2].substring(0, 20) }
    ];

    // Draw connections
    inputs.forEach(input => {
        const strength = Math.abs(input.weight);
        const isPositive = input.weight >= 0;

        // Only draw strong connection if input is active
        const alpha = input.value === 1 ? Math.min(strength / 2, 1) : 0.2;
        ctx.strokeStyle = isPositive ? `rgba(76, 175, 80, ${alpha})` : `rgba(244, 67, 54, ${alpha})`;
        ctx.lineWidth = input.value === 1 ? Math.max(2, strength * 3) : 2;

        ctx.beginPath();
        ctx.moveTo(input.x + 30, input.y);
        ctx.lineTo(centerX - neuronRadius, centerY);
        ctx.stroke();

        // Weight label
        const midX = (input.x + centerX) / 2;
        const midY = (input.y + centerY) / 2;
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`w=${input.weight.toFixed(1)}`, midX, midY - 5);
    });

    // Draw input nodes
    inputs.forEach(input => {
        // Color based on ON/OFF state
        const color = input.value === 1 ? '#4CAF50' : '#9E9E9E';

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(input.x, input.y, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Input value (ON/OFF)
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(input.value === 1 ? 'SÌ' : 'NO', input.x, input.y);

        // Label (statement)
        ctx.fillStyle = '#333';
        ctx.font = '11px Arial';
        ctx.fillText(input.label, input.x, input.y - 50);
    });

    // Draw neuron (central circle)
    const neuronIntensity = Math.min(Math.abs(output), 1);
    const neuronColor = `rgba(103, 126, 234, ${neuronIntensity})`;

    ctx.fillStyle = neuronColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, neuronRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Neuron label
    ctx.fillStyle = neuronIntensity > 0.5 ? 'white' : '#333';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Neurone', centerX, centerY - 10);
    ctx.font = '14px Arial';
    ctx.fillText(`z=${z.toFixed(2)}`, centerX, centerY + 10);

    // Bias indicator
    ctx.fillStyle = '#ff9800';
    ctx.beginPath();
    ctx.arc(centerX, centerY - neuronRadius - 30, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.fillText(`b=${b.toFixed(1)}`, centerX, centerY - neuronRadius - 50);

    // Connection from bias to neuron
    ctx.strokeStyle = 'rgba(255, 152, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - neuronRadius - 15);
    ctx.lineTo(centerX, centerY - neuronRadius);
    ctx.stroke();

    // Draw output connection
    ctx.strokeStyle = `rgba(76, 175, 80, ${neuronIntensity})`;
    ctx.lineWidth = Math.max(2, neuronIntensity * 5);
    ctx.beginPath();
    ctx.moveTo(centerX + neuronRadius, centerY);
    ctx.lineTo(outputX - 30, centerY);
    ctx.stroke();

    // Draw output node
    const outputColor = output >= 0.5 ? '#4CAF50' : '#F44336';
    ctx.fillStyle = outputColor;
    ctx.beginPath();
    ctx.arc(outputX, centerY, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    const displayValue = controls.activation.value === 'step' ?
        (output >= 0.5 ? 'SÌ' : 'NO') :
        (output * 100).toFixed(0) + '%';
    ctx.fillText(displayValue, outputX, centerY);

    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Decisione', outputX, centerY + 50);
}

// Add event listeners
Object.values(controls).forEach(control => {
    control.addEventListener('input', () => {
        updateDisplays();
        calculate();
    });
    control.addEventListener('change', () => {
        updateDisplays();
        calculate();
    });
});

// Scenario change
controls.scenario.addEventListener('change', updateScenario);

// Initial setup
updateScenario();
updateDisplays();
calculate();
