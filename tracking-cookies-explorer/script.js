// --- Cookie, fingerprinting e tracking pixel --------------------------------
//
// Logica pura (costruzione progressiva del profilo lato "AdNetworkXYZ")
// verificata a parte in Node su casi costruiti a mano, prima di collegarla a
// questa interfaccia (vedi README.md).
//
// Bug noto da NON reintrodurre: "Passo singolo" per la navigazione sui 3 siti
// deve funzionare SUBITO al caricamento della pagina, senza richiedere prima
// "Avvia". Per questo, come in database-locking-explorer/script.js, la
// funzione di render viene invocata una volta alla creazione del runner,
// PRIMA di qualunque click.

// --- Logica pura: costruzione del profilo di tracciamento -------------------

function visitSite(cookieState, profile, visit) {
    const isNewCookie = cookieState === null;
    const cookieId = isNewCookie ? visit.generatedId : cookieState;
    const interests = (!visit.interest || profile.interests.includes(visit.interest))
        ? profile.interests.slice()
        : profile.interests.concat([visit.interest]);
    return {
        cookieId,
        isNewCookie,
        profile: { id: cookieId, interests }
    };
}

function chooseAd(profile) {
    // Sceglie l'annuncio in base al primo interesse registrato nel profilo.
    if (profile.interests.length === 0) return null;
    return profile.interests[0];
}

// --- Dati dei tre siti visitati in sequenza ----------------------------------

const VISITS = [
    { site: 'NegozioScarpe.it', interest: 'scarpe', generatedId: 'axyz_7f3d9a21' },
    { site: 'BlogRicette.it', interest: 'ricette' },
    { site: 'NotizieSport.it', interest: null }
];

const INTEREST_LABELS = { scarpe: 'scarpe', ricette: 'ricette' };

// Costruisce, a partire dalla logica pura sopra, la sequenza completa di
// "fotografie" di stato (una per riga del log), così l'interfaccia può
// limitarsi a mostrare lo stato corrente invece di applicare differenze.
function buildTrackingSteps(visits) {
    const steps = [];
    let cookieState = null;
    let profile = { id: null, interests: [] };

    visits.forEach((visit, visitIndex) => {
        const before = { cookieState, profile };
        const result = visitSite(cookieState, profile, visit);
        cookieState = result.cookieId;
        profile = result.profile;

        steps.push({
            site: visit.site,
            text: `Visita a ${visit.site}: lo script di AdNetworkXYZ, incorporato nella pagina, si attiva automaticamente.`,
            cookieId: before.cookieState,
            interests: before.profile.interests,
            adShown: null
        });

        if (result.isNewCookie) {
            steps.push({
                site: visit.site,
                text: `AdNetworkXYZ non trova alcun cookie proprio in questo browser → ne genera uno nuovo e lo scrive come cookie di terze parti: ID "${result.cookieId}".`,
                cookieId: result.cookieId,
                interests: before.profile.interests,
                adShown: null
            });
        } else {
            steps.push({
                site: visit.site,
                text: `AdNetworkXYZ trova già il suo cookie in questo browser (ID "${result.cookieId}") → lo legge e riconosce che è lo stesso browser già visto su un altro sito.`,
                cookieId: result.cookieId,
                interests: before.profile.interests,
                adShown: null
            });
        }

        if (visit.interest) {
            const label = INTEREST_LABELS[visit.interest] || visit.interest;
            steps.push({
                site: visit.site,
                text: `Il profilo lato AdNetworkXYZ (associato all'ID "${result.cookieId}") viene aggiornato con il nuovo interesse "${label}".`,
                cookieId: result.cookieId,
                interests: profile.interests,
                adShown: null
            });
        } else {
            steps.push({
                site: visit.site,
                text: `Il profilo lato AdNetworkXYZ resta con gli stessi interessi registrati finora: nessun nuovo interesse dichiarato da questo sito.`,
                cookieId: result.cookieId,
                interests: profile.interests,
                adShown: null
            });
        }

        if (visitIndex === visits.length - 1) {
            const ad = chooseAd(profile);
            const adLabel = INTEREST_LABELS[ad] || ad;
            steps.push({
                site: visit.site,
                text: `In base al profilo (interessi: ${profile.interests.map(i => INTEREST_LABELS[i] || i).join(', ')}), AdNetworkXYZ decide quale pubblicità mostrare → sceglie un annuncio di ${adLabel}, anche se su ${visit.site} non hai mai cercato nulla del genere.`,
                cookieId: result.cookieId,
                interests: profile.interests,
                adShown: ad
            });
        }
    });

    return steps;
}

const TRACKING_STEPS = buildTrackingSteps(VISITS);

// --- Interfaccia: sezione 1, navigazione sui tre siti ------------------------

let navCurrent = -1;
let navInterval = null;

function renderNavPage(step) {
    const urlBar = document.getElementById('navUrlBar');
    const page = document.getElementById('navPage');

    if (!step) {
        urlBar.textContent = '🔒 (nessuna pagina visitata)';
        page.innerHTML = '<div class="browser-page-title">—</div>';
        return;
    }

    urlBar.textContent = `🔒 https://www.${step.site.toLowerCase()}/`;
    const pageContent = {
        'NegozioScarpe.it': 'Catalogo scarpe sportive e da città — spedizione in 48h.',
        'BlogRicette.it': 'Oggi la ricetta della settimana: torta di mele fittizia.',
        'NotizieSport.it': 'Ultime notizie sportive del giorno (completamente inventate).'
    }[step.site] || '';

    let adHtml = '';
    if (step.adShown) {
        const label = INTEREST_LABELS[step.adShown] || step.adShown;
        adHtml = `<div class="ad-banner active">📢 Pubblicità di AdNetworkXYZ: "Scopri le nostre ${label} in offerta!"</div>`;
    } else {
        adHtml = `<div class="ad-banner">spazio pubblicitario (script di AdNetworkXYZ incorporato, invisibile all'utente)</div>`;
    }

    page.innerHTML = `<div class="browser-page-title">${step.site}</div><div>${pageContent}</div>${adHtml}`;
}

function renderNavState(step) {
    const cookieCol = document.getElementById('navCookieCol');
    const profileCol = document.getElementById('navProfileCol');
    const cookieValue = document.getElementById('navCookieValue');
    const profileValue = document.getElementById('navProfileValue');
    const profileTags = document.getElementById('navProfileTags');

    if (!step) {
        cookieCol.classList.remove('active');
        profileCol.classList.remove('active');
        cookieValue.textContent = 'nessun cookie di AdNetworkXYZ';
        profileValue.textContent = 'nessun profilo';
        profileTags.innerHTML = '';
        return;
    }

    cookieCol.classList.toggle('active', !!step.cookieId);
    profileCol.classList.toggle('active', step.interests.length > 0);
    cookieValue.textContent = step.cookieId ? `cookie "AdNetworkXYZ_id" = ${step.cookieId}` : 'nessun cookie di AdNetworkXYZ';
    profileValue.textContent = step.interests.length > 0 ? `ID ${step.cookieId} — interessi registrati:` : 'nessun profilo';
    profileTags.innerHTML = step.interests.map(i => `<span class="tag-pill">${INTEREST_LABELS[i] || i}</span>`).join('');
}

function renderNavSteps() {
    const panel = document.getElementById('navStepPanel');
    if (navCurrent < 0) {
        panel.innerHTML = '<div class="step-line">Premi "▶ Avvia" per vedere la sequenza completa, oppure "Passo singolo →" per avanzare un\'azione alla volta.</div>';
    } else {
        panel.innerHTML = TRACKING_STEPS.slice(0, navCurrent + 1).map((s, i) =>
            `<div class="step-line ${i === navCurrent ? 'current' : ''}">${i + 1}. ${s.text}</div>`
        ).join('');
        panel.scrollTop = panel.scrollHeight;
    }
    document.getElementById('navStepBtn').disabled = navCurrent >= TRACKING_STEPS.length - 1;
}

function renderNav() {
    const step = navCurrent >= 0 ? TRACKING_STEPS[navCurrent] : null;
    renderNavPage(step);
    renderNavState(step);
    renderNavSteps();
}

function stopNavAuto() {
    if (navInterval) clearInterval(navInterval);
    navInterval = null;
}

function navAdvance() {
    if (navCurrent >= TRACKING_STEPS.length - 1) { stopNavAuto(); return; }
    navCurrent++;
    renderNav();
    if (navCurrent >= TRACKING_STEPS.length - 1) stopNavAuto();
}

function navStartAuto() {
    stopNavAuto();
    navCurrent = -1;
    renderNav();
    navInterval = setInterval(navAdvance, 1300);
}

function navStepOnce() {
    stopNavAuto();
    navAdvance();
}

function navReset() {
    stopNavAuto();
    navCurrent = -1;
    renderNav();
}

// Render iniziale: "Passo singolo" deve essere abilitato e funzionante subito,
// senza dover prima cliccare "Avvia".
renderNav();

document.getElementById('navRunBtn').addEventListener('click', navStartAuto);
document.getElementById('navStepBtn').addEventListener('click', navStepOnce);
document.getElementById('navResetBtn').addEventListener('click', navReset);

// --- Interfaccia: sezione 2, tracking pixel ----------------------------------

function openEmail() {
    const box = document.getElementById('pixelResultBox');
    const now = new Date();
    const timestamp = now.toLocaleString('it-IT');
    box.className = 'result-box bad';
    box.innerHTML = `
        <strong>Email aperta.</strong> Nessun clic è stato fatto su nessun link, eppure è partita subito una richiesta "invisibile":
        <div class="network-log">
            <div class="network-log-entry">
                GET https://server-tracciamento-pixel.fittizio.net/pixel.gif?id=utente4821<br>
                → Indirizzo IP (simulato): 93.47.212.18<br>
                → User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Client di posta Fittizio/3.2<br>
                → Data e ora di apertura registrata: ${timestamp}
            </div>
        </div>
        <p style="margin-top:0.5rem;">Il mittente ora sa che hai aperto l'email, da che tipo di dispositivo e a che ora — senza che tu abbia cliccato su nulla né te ne sia accorto.</p>
    `;
    document.getElementById('pixelImg').title = 'richiesta partita verso server-tracciamento-pixel.fittizio.net';
}

document.getElementById('openEmailBtn').addEventListener('click', openEmail);

// --- Interfaccia: sezione 3, fingerprinting del browser ----------------------

const FINGERPRINT_FEATURES = [
    { label: 'Risoluzione schermo', value: '1920 × 1080, pixel ratio 1.25' },
    { label: 'Fuso orario', value: 'Europe/Rome (UTC+1)' },
    { label: 'Lingua del sistema', value: 'it-IT' },
    { label: 'Font installati (estratto)', value: 'Arial, Calibri, Verdana, Comic Sans MS, Segoe Print, 112 altri...' },
    { label: 'User agent', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Browser Fittizio/118.0' },
    { label: 'Plugin ed estensioni rilevabili', value: '3 estensioni attive (rilevabili indirettamente)' }
];

function renderFingerprintTable() {
    const table = document.getElementById('fingerprintTable');
    table.innerHTML = FINGERPRINT_FEATURES.map(f => `
        <div class="fingerprint-row">
            <div class="fingerprint-label">${f.label}</div>
            <div class="fingerprint-value">${f.value}</div>
        </div>
    `).join('');
}

function revealFingerprintUniqueness() {
    const box = document.getElementById('fingerprintResultBox');
    box.classList.remove('hidden');
    box.className = 'result-box bad';
    box.innerHTML = `
        Nessuna di queste caratteristiche, presa da sola, identifica il tuo dispositivo: moltissimi altri hanno la stessa risoluzione, o lo stesso fuso orario. Ma la loro <strong>combinazione specifica</strong> — proprio questa risoluzione, insieme a questo fuso orario, questa lingua, questo elenco di font installati e questo user agent — è condivisa, secondo ricerche sul tema, da una porzione minima dei dispositivi al mondo: spesso abbastanza da restare quasi unica anche tra milioni di altri browser.
        <p style="margin-top:0.5rem;">Per questo un sito può continuare a "ricordarsi" di te anche dopo aver cancellato tutti i cookie: non ha bisogno di scrivere nulla sul tuo dispositivo, gli basta osservare di nuovo la stessa combinazione di informazioni che il browser comunica comunque.</p>
    `;
}

renderFingerprintTable();
document.getElementById('fingerprintBtn').addEventListener('click', revealFingerprintUniqueness);

// --- Pannello di approfondimento ---------------------------------------------

document.getElementById('deepDiveBtn').addEventListener('click', () => {
    const panel = document.getElementById('deepDivePanel');
    const isHidden = panel.classList.toggle('hidden');
    const btn = document.getElementById('deepDiveBtn');
    btn.setAttribute('aria-expanded', String(!isHidden));
    btn.textContent = isHidden
        ? 'Se rifiuto i cookie dal banner, sono davvero al sicuro dal tracciamento? ▸'
        : 'Se rifiuto i cookie dal banner, sono davvero al sicuro dal tracciamento? ▾';
});
