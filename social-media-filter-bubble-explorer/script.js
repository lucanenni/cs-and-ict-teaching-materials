// --- Bolla di filtraggio: Mare (A) vs Montagna (B) -------------------------

// --- Logica pura (testata in Node, prima di collegarla al DOM) ------------
// Calcola la proporzione di fazione A nel PROSSIMO round, in base ai "mi
// piace" dati nel round appena concluso. Nessun riferimento al DOM qui
// dentro: per questo è stata verificata a parte con uno script Node.
const MIN_PROPORTION = 5;
const MAX_PROPORTION = 95;
const STEP_FRACTION = 0.45;

function nextProportion(currentA, likesA, likesB) {
    if (likesA === likesB) return currentA; // nessuna preferenza netta in questo round: nessun cambiamento
    if (likesA > likesB) {
        const next = currentA + (MAX_PROPORTION - currentA) * STEP_FRACTION;
        return Math.min(MAX_PROPORTION, Math.round(next));
    }
    const next = currentA - (currentA - MIN_PROPORTION) * STEP_FRACTION;
    return Math.max(MIN_PROPORTION, Math.round(next));
}

// --- Contenuti del feed -----------------------------------------------------
const POSTS_A = [ // Mare 🌊
    { author: 'Giulia_92', text: 'Niente batte svegliarsi e sentire il rumore delle onde. Il mare rilassa in un modo che la montagna non potrà mai fare.' },
    { author: 'Marco.b', text: 'Ombrellone, libro e acqua cristallina. Le vacanze al mare sono le uniche vere vacanze, punto.' },
    { author: 'sara_sunshine', text: 'Ho provato la montagna una volta: troppa fatica per arrivare in cima. Al mare basta un asciugamano.' },
    { author: 'Luca89', text: 'Il tramonto visto dalla spiaggia è uno spettacolo che non si batte. Chi dice il contrario non l\'ha mai visto dal vivo.' },
    { author: 'ChiaraV', text: 'Snorkeling, pesciolini colorati e sabbia calda sotto i piedi: il mare offre un\'esperienza che la montagna semplicemente non ha.' },
    { author: 'davide_t', text: 'In montagna fa freddo anche in agosto. Al mare puoi stare in costume tutto il giorno. Non c\'è paragone.' },
    { author: 'FedeOnTheBeach', text: 'Il suono delle onde la notte mentre ceni in riva al mare: questa è vacanza vera.' },
    { author: 'ElenaR', text: 'Al mare ti abbronzi, nuoti, fai sport acquatici. In montagna puoi solo camminare. Facile scegliere.' },
    { author: 'Tommy_Wave', text: 'Castelli di sabbia, tuffi dagli scogli, granite sotto l\'ombrellone. Il mare vince sempre.' },
    { author: 'giorgia.sea', text: 'Chi sceglie la montagna d\'estate si sta perdendo il vero senso delle ferie, secondo me.' }
];

const POSTS_B = [ // Montagna ⛰️
    { author: 'AndreaHike', text: 'Il silenzio del bosco e l\'aria fresca di montagna fanno bene alla testa in un modo che il caos della spiaggia non può dare.' },
    { author: 'martina_trail', text: 'Un rifugio, un panorama sulle vette e un piatto di polenta: altro che ombrelloni affollati.' },
    { author: 'Paolo.alp', text: 'Ho provato il mare: troppa gente, troppo rumore. In montagna trovi davvero pace.' },
    { author: 'noemi_wood', text: 'Camminare tra i sentieri e scoprire un laghetto alpino vale più di una settimana sotto il sole a cuocersi.' },
    { author: 'Simone_Vetta', text: 'Niente batte il freddo frizzante del mattino in rifugio prima di una camminata. Il mare non dà questa sensazione.' },
    { author: 'LauraForest', text: 'In montagna puoi fare trekking, mountain bike, arrampicata: ben più vario di stare fermi su un asciugamano.' },
    { author: 'gianni_altura', text: 'Il panorama dalla cima dopo ore di camminata è una soddisfazione che la spiaggia non potrà mai regalarti.' },
    { author: 'FrancyPeak', text: 'Al mare la sabbia si attacca a tutto e il sole scotta. In montagna l\'aria è pulita e si respira meglio.' },
    { author: 'Matteo_Refuge', text: 'Serate in rifugio, stelle senza luci di città, mucche al pascolo: la montagna d\'estate è un\'altra cosa.' },
    { author: 'ValeTrek', text: 'Chi sceglie il mare d\'estate si perde i colori dei prati in fiore e il fresco delle vette, secondo me.' }
];

const POSTS_PER_ROUND = 12;
const ROUND_INTERVAL_MS = 2500;

const state = {
    proportionA: 50,
    round: 1,
    feed: [],
    likedIds: new Set(),
    roundLikes: { A: 0, B: 0 },
    totalLikes: { A: 0, B: 0 },
    autoInterval: null
};

function pickRandom(pool, n) {
    const picks = [];
    for (let i = 0; i < n; i++) {
        picks.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return picks;
}

function generateFeed(proportionA) {
    const countA = Math.round(POSTS_PER_ROUND * proportionA / 100);
    const countB = POSTS_PER_ROUND - countA;
    const picksA = pickRandom(POSTS_A, countA).map(p => ({ ...p, faction: 'A' }));
    const picksB = pickRandom(POSTS_B, countB).map(p => ({ ...p, faction: 'B' }));
    const mixed = picksA.concat(picksB);
    // mescola l'ordine così la fazione dominante non appare tutta in blocco
    for (let i = mixed.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mixed[i], mixed[j]] = [mixed[j], mixed[i]];
    }
    return mixed.map((p, i) => ({ ...p, id: `r${state.round}-${i}` }));
}

function renderFeed() {
    const wrap = document.getElementById('feed');
    wrap.innerHTML = state.feed.map(post => {
        const liked = state.likedIds.has(post.id);
        const icon = post.faction === 'A' ? '🌊' : '⛰️';
        return `
            <div class="post post-${post.faction.toLowerCase()}">
                <div class="post-author">${icon} ${post.author}</div>
                <div class="post-text">${post.text}</div>
                <button type="button" class="like-btn ${liked ? 'liked' : ''}" data-id="${post.id}">
                    ${liked ? '❤ Ti piace' : '♡ Mi piace'}
                </button>
            </div>
        `;
    }).join('');
    wrap.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleLike(btn.dataset.id));
    });
}

function renderStats() {
    document.getElementById('pctA').textContent = state.proportionA;
    document.getElementById('pctB').textContent = 100 - state.proportionA;
    document.getElementById('fillA').style.width = state.proportionA + '%';
    document.getElementById('fillB').style.width = (100 - state.proportionA) + '%';
    document.getElementById('roundNum').textContent = state.round;
    document.getElementById('totalA').textContent = state.totalLikes.A;
    document.getElementById('totalB').textContent = state.totalLikes.B;
}

function render() {
    renderFeed();
    renderStats();
}

function toggleLike(id) {
    const post = state.feed.find(p => p.id === id);
    if (!post) return;
    if (state.likedIds.has(id)) {
        state.likedIds.delete(id);
        state.roundLikes[post.faction]--;
        state.totalLikes[post.faction]--;
    } else {
        state.likedIds.add(id);
        state.roundLikes[post.faction]++;
        state.totalLikes[post.faction]++;
    }
    render();
}

function advanceRound() {
    state.proportionA = nextProportion(state.proportionA, state.roundLikes.A, state.roundLikes.B);
    state.round++;
    state.roundLikes = { A: 0, B: 0 };
    state.likedIds = new Set();
    state.feed = generateFeed(state.proportionA);
    render();
}

function stopAuto() {
    if (state.autoInterval) clearInterval(state.autoInterval);
    state.autoInterval = null;
    document.getElementById('runBtn').textContent = '▶ Avvia';
}

function toggleAuto() {
    if (state.autoInterval) {
        stopAuto();
        return;
    }
    document.getElementById('runBtn').textContent = '⏸ Ferma';
    state.autoInterval = setInterval(advanceRound, ROUND_INTERVAL_MS);
}

function stepOnce() {
    stopAuto();
    advanceRound();
}

function resetFeed() {
    stopAuto();
    state.proportionA = 50;
    state.round = 1;
    state.roundLikes = { A: 0, B: 0 };
    state.totalLikes = { A: 0, B: 0 };
    state.likedIds = new Set();
    state.feed = generateFeed(state.proportionA);
    render();
}

// Stato iniziale: feed 50/50 già pronto al caricamento, PRIMA di qualunque
// click — così "Passo singolo" funziona subito, senza dover prima "Avviare".
state.feed = generateFeed(state.proportionA);
render();

document.getElementById('runBtn').addEventListener('click', toggleAuto);
document.getElementById('stepBtn').addEventListener('click', stepOnce);
document.getElementById('resetBtn').addEventListener('click', resetFeed);

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Ma qui l\'argomento è leggero: nella realtà cambia qualcosa? ▸'
        : 'Ma qui l\'argomento è leggero: nella realtà cambia qualcosa? ▾';
});
