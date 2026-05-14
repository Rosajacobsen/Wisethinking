/* ============================================================
   script.js — Meta-refleksionsprototype til Wisethinking.ai
   ------------------------------------------------------------
   Hvad: Indeholder al logik for prototypen.
   Struktureret i klart adskilte sektioner:
     1.  Konstanter og data-model
     2.  localStorage-håndtering (load/save)
     3.  Sprog-system (i18n)
     4.  State-overgange (vis kun én skærm ad gangen)
     5.  State 1 — Velkomst
     6.  State 2/6 — Slider med skib og hav (genbrugelig komponent)
     7.  State 3 — Skriv besked til fremtidigt selv
     8.  State 4 — Bro til journey
     9.  State 5 — Modtag besked
     10. State 6 — Efter-refleksion
     11. State 7 — Send og del + valgfri ny flaskepost
     12. State 8 — Slutskærm
     13. State 9 — Rejseoversigt
     14. Initialisering ved sideindlæsning
   ============================================================ */


/* ============================================================
   1. KONSTANTER OG DATAMODEL
   ============================================================ */

// Nøglen i localStorage. Versionsnummer '_v1' gør det muligt at ændre
// datamodellen i senere iterationer uden at bryde eksisterende test-data.
const STORAGE_KEY = 'metaReflection_v1';

// URL til den specifikke Reflection Journey på wisethinking.world.
// Bekræftes med Thøger inden test — kan ændres her ét sted.
const JOURNEY_URL = 'https://wisethinking.world/journeys';

// Default-datamodel ved første besøg. Bruges hvis localStorage er tom.
function getDefaultData() {
  return {
    language: 'da',
    emotionalCheckInBefore: { moodPercent: null, timestamp: null },
    intentionMessage:       { text: '',          timestamp: null },
    journeyStatus:          { started: false,    completed: false },
    emotionalCheckInAfter:  { moodPercent: null, timestamp: null },
    finalReflection: {
      text: '',
      timestamp: null,
      copiedToClipboard: false,
      sharingChoice: null,
      sharingTimestamp: null
    },
    futureMessage: { text: '', deliveryDate: null, delivered: false }
  };
}

// Globalt data-objekt — opdateres in-memory og persisteres via saveData()
let storeData = getDefaultData();


/* ============================================================
   2. LOCALSTORAGE-HÅNDTERING
   ============================================================ */

/* Hent eksisterende data fra localStorage, eller returnér default.
   Designvalg: Vi merger med default for at sikre at nye felter i
   datamodellen ikke crasher prototypen hvis brugeren har gamle data. */
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Ingen tidligere data — brug default
      return getDefaultData();
    }
    // Parse den gemte JSON-streng
    const parsed = JSON.parse(raw);
    // Merge med default for at sikre alle felter er til stede
    return Object.assign(getDefaultData(), parsed);
  } catch (err) {
    // Fejl i parsing — log til konsollen og brug default
    console.error('Kunne ikke læse data fra localStorage:', err);
    return getDefaultData();
  }
}

/* Gem hele datamodellen til localStorage som JSON. */
function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storeData));
  } catch (err) {
    console.error('Kunne ikke gemme data til localStorage:', err);
    // Designvalg: Vi viser kun fejlbesked ved første kritiske skrivning
    // (i init), ikke ved hver autosave.
  }
}

/* Tjek om localStorage overhovedet er tilgængelig.
   Bruges ved init til at vise en venlig fejlbesked hvis browseren
   har deaktiveret localStorage (fx privat browsing i nogle browsere). */
function isLocalStorageAvailable() {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch (err) {
    return false;
  }
}


/* ============================================================
   3. SPROG-SYSTEM (i18n)
   ============================================================ */

/* Hent oversat tekst for den nuværende sprog-indstilling.
   key er nøglen i translations[lang] (fx 'welcomeTitle'). */
function t(key) {
  const lang = storeData.language || 'da';
  // Slå op i translations-objektet (defineret i translations.js)
  const text = translations[lang] && translations[lang][key];
  if (text === undefined) {
    console.warn('Oversættelse mangler for nøgle:', key);
    return key;
  }
  return text;
}

/* Gennemløb hele DOM'en og opdater alle elementer med data-i18n attributter.
   Designvalg: Vi bruger data-attributter til at markere oversættelige
   elementer, så HTML'en kan ændres uden at scriptet skal opdateres.

   - data-i18n              → tekst-indhold
   - data-i18n-placeholder  → placeholder på inputs
   - data-i18n-aria         → aria-label */
function applyTranslations() {
  // Tekst-indhold
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  // Placeholders på textareas og inputs
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key));
  });
  // Aria-labels
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    el.setAttribute('aria-label', t(key));
  });

  // Opdater også <html lang="..."> så skærmlæsere får korrekt sprog
  document.documentElement.setAttribute('lang', storeData.language);

  // Opdater sprog-toggle visuelt (markér aktivt sprog)
  document.getElementById('lang-da').classList.toggle('is-active', storeData.language === 'da');
  document.getElementById('lang-en').classList.toggle('is-active', storeData.language === 'en');

  // Genberegn dato-labels (de indeholder formaterede datoer)
  refreshDateLabels();

  // Genberegn slider-niveau-tekst (afhænger af sprog)
  updateSliderLabel('before');
  updateSliderLabel('after');
}

/* Skift sprog og opdater hele UI'et. */
function toggleLanguage() {
  storeData.language = (storeData.language === 'da') ? 'en' : 'da';
  saveData();
  applyTranslations();
}


/* ============================================================
   4. STATE-OVERGANGE
   ============================================================ */

// Liste over alle state-id'er i rækkefølge — bruges af showState() og resume-logikken.
// state-journey indgår ikke i resumeAtCorrectState(): den nås kun aktivt via
// "Se din rejse"-knappen, aldrig automatisk ved genindlæsning.
const ALL_STATES = [
  'state-welcome',
  'state-mood-before',
  'state-intention',
  'state-bridge-before',
  'state-bridge-after',
  'state-receive',
  'state-after',
  'state-share',
  'state-final',
  'state-journey'
];

/* Vis kun den state med det givne id, skjul alle andre.
   Designvalg: Vi scroller automatisk til toppen ved skift af state,
   så brugeren ikke lander mid-scroll på en ny skærm. */
function showState(stateId) {
  ALL_STATES.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('is-active', id === stateId);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* Bestem hvilken state brugeren skal lande på ved sideindlæsning,
   baseret på hvor langt hun er kommet (jf. State 4's krav om at
   landing direkte på Fase 4b hvis journey er startet men ikke færdig). */
function resumeAtCorrectState() {
  const d = storeData;

  // Hvis fremtids-besked er sendt, er flowet helt færdigt
  if (d.futureMessage.text || d.finalReflection.sharingChoice) {
    // Brugeren har afsluttet — vis slutskærmen
    showState('state-final');
    return;
  }

  // Hvis afsluttende refleksion er gemt, men ikke delt endnu — gå til State 7
  if (d.finalReflection.text && d.emotionalCheckInAfter.moodPercent !== null) {
    showState('state-share');
    populateShareState();
    return;
  }

  // Journey er gennemført — gå til State 5 eller 6 alt efter videre fremskridt
  if (d.journeyStatus.completed) {
    // Hvis check-in efter ikke er foretaget endnu, antag at brugeren skal se
    // sin besked igen (State 5 → automatisk videre til State 6)
    showState('state-receive');
    enterReceiveState();
    return;
  }

  // Journey er startet men ikke gennemført → Fase 4b
  if (d.journeyStatus.started && !d.journeyStatus.completed) {
    showState('state-bridge-after');
    return;
  }

  // Intention-besked er sendt, men journey ikke startet → Fase 4a
  if (d.intentionMessage.text) {
    showState('state-bridge-before');
    showSealedBottleCorner();
    return;
  }

  // Check-in før er foretaget, men ingen besked endnu → State 3
  if (d.emotionalCheckInBefore.moodPercent !== null) {
    showState('state-intention');
    return;
  }

  // Default: Start fra State 1
  showState('state-welcome');
}


/* ============================================================
   5. STATE 1 — VELKOMST
   ============================================================ */

function initWelcomeState() {
  document.getElementById('welcome-start-btn').addEventListener('click', () => {
    // Skift til State 2 — slider før journey
    showState('state-mood-before');
  });
}


/* ============================================================
   6. STATE 2 / 6 — SLIDER MED SKIB OG HAV
   ------------------------------------------------------------
   Genbrugelig komponent: samme kode betjener både slideren før
   (State 2) og slideren efter (State 6). 'phase' er 'before' eller
   'after' og bestemmer hvilke DOM-elementer og data-felter der bruges.
   ============================================================ */

// In-memory state for hver slider
const sliderState = {
  before: { percent: 1 },
  after:  { percent: 1 }
};

/* Beregn hvilken vejr-niveau-tekst der hører til en procent. */
function getMoodLevelKey(percent) {
  if (percent <= 20) return 'moodLevel1';      // 1–20%
  if (percent <= 40) return 'moodLevel2';      // 21–40%
  if (percent <= 60) return 'moodLevel3';      // 41–60%
  if (percent <= 80) return 'moodLevel4';      // 61–80%
  return 'moodLevel5';                          // 81–99%
}

/* Opdater procent og tekstfeedback for en slider. */
function updateSliderLabel(phase) {
  const percent = sliderState[phase].percent;
  const levelKey = getMoodLevelKey(percent);

  const levelEl   = document.getElementById('mood-level-' + phase);
  const percentEl = document.getElementById('mood-percent-' + phase);
  const sliderEl  = document.getElementById('mood-slider-' + phase);

  if (levelEl)   levelEl.textContent = t(levelKey);
  if (percentEl) {
    percentEl.innerHTML = percent + '<span>' + t('moodPercentLabel') + '</span>';
  }
  if (sliderEl)  sliderEl.setAttribute('aria-valuenow', percent);
}

/* Positionér skibet på cirklens kant baseret på procent.
   Designvalg: Skalaen går med uret fra toppen.
   1% = top, 50% = bund, 99% = tæt på toppen igen.
   Vi mapper procent til vinkel: 1% → -90° (top), 99% → ~+270° */
function positionShip(phase) {
  const percent = sliderState[phase].percent;
  const shipEl  = document.getElementById('ship-' + phase);
  if (!shipEl) return;

  // Konverter procent (1–99) til vinkel i radianer.
  // Vi starter ved -90° (toppen) og bevæger os med uret.
  // 1% = 0° af 360°, 99% = ~99/100 * 360°
  const angleDeg = (percent / 100) * 360 - 90;
  const angleRad = angleDeg * Math.PI / 180;

  // Radius hvor skibet skal placeres — mellem indre og ydre cirkel.
  // Indre cirkel = 400px (radius 200), ydre = 500px (radius 250).
  // Skibet placeres på radius ~225 (midt i havet).
  const radius = 225;
  const x = Math.cos(angleRad) * radius;
  const y = Math.sin(angleRad) * radius;

  // Roter også skibet så det "vender mod uret-bevægelse"
  shipEl.style.transform =
    'translate(-50%, -50%) translate(' + x + 'px, ' + y + 'px) rotate(' + (angleDeg + 90) + 'deg)';
}

/* Opdater vandets udseende og skyernes synlighed baseret på procent. */
function updateWeather(phase) {
  const percent = sliderState[phase].percent;
  const waterEl  = document.getElementById('mood-water-' + phase);
  const cloudsEl = document.getElementById('clouds-' + phase);

  if (waterEl) {
    // Højere procent → mørkere, mere uroligt vand
    const intensity = percent / 100;
    waterEl.style.background = `conic-gradient(from 0deg,
      rgba(${140 - intensity * 60}, ${165 - intensity * 50}, ${240 - intensity * 30}, ${0.4 + intensity * 0.3}),
      rgba(${100 - intensity * 40}, ${130 - intensity * 40}, ${220 - intensity * 30}, ${0.5 + intensity * 0.3}),
      rgba(${80  - intensity * 30}, ${110 - intensity * 30}, ${200 - intensity * 20}, ${0.45 + intensity * 0.3}),
      rgba(${140 - intensity * 60}, ${165 - intensity * 50}, ${240 - intensity * 30}, ${0.4 + intensity * 0.3}))`;
    // Højere procent → hurtigere rotation (mere uro)
    waterEl.style.setProperty('--water-speed', (90 - percent * 0.7) + 's');
  }

  if (cloudsEl) {
    // Skyer fader ind fra 30% og op
    const cloudOpacity = Math.max(0, (percent - 30) / 70);
    cloudsEl.style.opacity = cloudOpacity.toFixed(2);

    // Vi bygger skyer dynamisk én gang — antal og position afhænger af procent
    if (!cloudsEl.dataset.built) {
      buildClouds(cloudsEl);
      cloudsEl.dataset.built = '1';
    }
  }
}

/* Byg et antal små "sky"-elementer ind i clouds-laget. */
function buildClouds(container) {
  // Forudbestemte positioner rundt om cirklen (uden for de 500px)
  const positions = [
    { top:  '8%',  left: '15%', size: 70 },
    { top:  '5%',  left: '50%', size: 90 },
    { top:  '12%', left: '78%', size: 60 },
    { top:  '35%', left: '6%',  size: 55 },
    { top:  '40%', left: '88%', size: 65 },
    { top:  '75%', left: '12%', size: 50 },
    { top:  '80%', left: '70%', size: 55 }
  ];
  positions.forEach(p => {
    const c = document.createElement('div');
    c.className = 'cloud';
    c.style.top  = p.top;
    c.style.left = p.left;
    c.style.width  = p.size + 'px';
    c.style.height = (p.size * 0.55) + 'px';
    container.appendChild(c);
  });
}

/* Sæt procent for en slider (1-99) og opdater al visuel feedback. */
function setSliderPercent(phase, percent) {
  // Klem værdien til 1–99 (vi tillader ikke 0% eller 100%)
  percent = Math.max(1, Math.min(99, Math.round(percent)));
  sliderState[phase].percent = percent;
  positionShip(phase);
  updateWeather(phase);
  updateSliderLabel(phase);
}

/* Beregn procent fra musens position i forhold til cirklens centrum. */
function percentFromMousePosition(sliderEl, mouseX, mouseY) {
  const rect = sliderEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  // Find vinkel fra centrum til musen, med 0° i toppen og positiv med uret
  const dx = mouseX - cx;
  const dy = mouseY - cy;
  let angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;
  // atan2 har 0° til højre — vi vil have 0° i toppen, så vi roterer med +90
  angleDeg = (angleDeg + 90 + 360) % 360;
  // Konverter til procent 1–99
  let percent = Math.round(angleDeg / 360 * 100);
  if (percent === 0) percent = 1;
  if (percent === 100) percent = 99;
  return percent;
}

/* Initialiser en slider med drag + tastatur. */
function initSlider(phase) {
  const sliderEl = document.getElementById('mood-slider-' + phase);
  if (!sliderEl) return;

  let isDragging = false;

  // === Mouse-håndtering ===
  function onMouseDown(e) {
    // Kun start drag hvis brugeren klikker på selve slideren, ikke på bekræft-knappen
    if (e.target.closest('.mood-confirm-btn')) return;
    isDragging = true;
    onMouseMove(e);
    e.preventDefault();
  }
  function onMouseMove(e) {
    if (!isDragging) return;
    const percent = percentFromMousePosition(sliderEl, e.clientX, e.clientY);
    setSliderPercent(phase, percent);
  }
  function onMouseUp() { isDragging = false; }

  sliderEl.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  // === Tastatur-håndtering ===
  sliderEl.addEventListener('keydown', (e) => {
    let step = 1;
    if (e.shiftKey) step = 5;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      setSliderPercent(phase, sliderState[phase].percent + step);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      setSliderPercent(phase, sliderState[phase].percent - step);
      e.preventDefault();
    } else if (e.key === 'Enter' || e.key === ' ') {
      // Enter/Space på selve cirklen bekræfter også positionen
      confirmMood(phase);
      e.preventDefault();
    }
  });

  // === Bekræft-knap ===
  document.getElementById('mood-confirm-' + phase).addEventListener('click', () => {
    confirmMood(phase);
  });

  // Initial visning
  setSliderPercent(phase, 1);
}

/* Bekræft mood-positionen, gem til localStorage og gå videre. */
function confirmMood(phase) {
  const percent = sliderState[phase].percent;
  const timestamp = new Date().toISOString();

  if (phase === 'before') {
    storeData.emotionalCheckInBefore.moodPercent = percent;
    storeData.emotionalCheckInBefore.timestamp = timestamp;
    saveData();
    // Gå videre til State 3 — skriv besked
    showState('state-intention');
  } else { // 'after'
    storeData.emotionalCheckInAfter.moodPercent = percent;
    storeData.emotionalCheckInAfter.timestamp = timestamp;
    saveData();
    // Lås tekstfeltet til afsluttende refleksion op
    unlockFinalReflection();
  }
}


/* ============================================================
   7. STATE 3 — SKRIV BESKED TIL FREMTIDIGT SELV
   ============================================================ */

function initIntentionState() {
  const textarea = document.getElementById('intention-text');
  const sendBtn  = document.getElementById('intention-send-btn');
  const backBtn  = document.getElementById('intention-back-btn');
  const errorEl  = document.getElementById('intention-error');

  // Aktiver send-knap først når der er tekst
  textarea.addEventListener('input', () => {
    const hasText = textarea.value.trim().length > 0;
    sendBtn.disabled = !hasText;
    if (hasText) errorEl.hidden = true;
  });

  // Tilbage til slideren
  backBtn.addEventListener('click', () => {
    showState('state-mood-before');
  });

  // Send-knap → gem besked og afspil animation
  sendBtn.addEventListener('click', () => {
    const text = textarea.value.trim();
    if (!text) {
      errorEl.hidden = false;
      return;
    }
    storeData.intentionMessage.text = text;
    storeData.intentionMessage.timestamp = new Date().toISOString();
    saveData();

    playBottleAnimation(() => {
      // Når animationen er færdig, vis flaskepost-ikon og gå til State 4a
      showSealedBottleCorner();
      showState('state-bridge-before');
    });
  });
}

/* Afspil flaskepost-animationen og kald callback når den er færdig. */
function playBottleAnimation(callback) {
  const anim = document.getElementById('bottle-animation');
  anim.hidden = false;
  // Animation varer ~3 sekunder (defineret i CSS)
  setTimeout(() => {
    anim.hidden = true;
    if (callback) callback();
  }, 3000);
}

/* Vis det forseglede flaskepost-ikon i hjørnet. */
function showSealedBottleCorner() {
  document.getElementById('sealed-bottle-corner').hidden = false;
}

/* Skjul flaskepost-ikonet (når den er "åbnet" i State 5). */
function hideSealedBottleCorner() {
  document.getElementById('sealed-bottle-corner').hidden = true;
}


/* ============================================================
   8. STATE 4 — BRO TIL REFLECTION JOURNEY
   ============================================================ */

function initBridgeState() {
  // Fase 4a — Begynd journey
  document.getElementById('bridge-start-journey-btn').addEventListener('click', () => {
    // Åbn wisethinking.world i ny fane
    window.open(JOURNEY_URL, '_blank', 'noopener');
    // Marker journey som startet
    storeData.journeyStatus.started = true;
    saveData();
    // Skift til Fase 4b
    showState('state-bridge-after');
  });

  // Fase 4b — Journey gennemført
  document.getElementById('bridge-journey-completed-btn').addEventListener('click', () => {
    storeData.journeyStatus.completed = true;
    saveData();
    // Gå til State 5
    showState('state-receive');
    enterReceiveState();
  });
}


/* ============================================================
   9. STATE 5 — MODTAG BESKED
   ============================================================ */

function enterReceiveState() {
  // Skjul flaskepost-ikonet — den er nu "åbnet"
  hideSealedBottleCorner();

  // Sæt dato-label
  const ts = storeData.intentionMessage.timestamp;
  const dateEl = document.getElementById('receive-date-label');
  dateEl.textContent = formatDateLabel(t('receiveDateLabel'), ts);

  // Sæt selve beskeden ind på papir-baggrund
  document.getElementById('receive-message-display').textContent =
    storeData.intentionMessage.text || '';

  // Skjul invitation først, vis den efter en pause
  const invitationEl = document.getElementById('receive-invitation');
  invitationEl.hidden = true;
  // Designvalg: 5-7 sekunder giver brugeren tid til at læse uden hast
  setTimeout(() => {
    invitationEl.hidden = false;
  }, 6000);
}

function initReceiveState() {
  document.getElementById('receive-continue-btn').addEventListener('click', () => {
    showState('state-after');
    enterAfterState();
  });
}


/* ============================================================
   10. STATE 6 — EFTER-REFLEKSION
   ============================================================ */

function enterAfterState() {
  // Sæt den oprindelige besked ind i Sektion 1
  const ts = storeData.intentionMessage.timestamp;
  document.getElementById('after-date-label').textContent =
    formatDateLabel(t('afterSection1DateLabel'), ts);
  document.getElementById('after-message-display').textContent =
    storeData.intentionMessage.text || '';

  // Vis diskret reference til check-in fra State 2
  refreshBeforeCheckInSummary();

  // Reset slider efter til 1% (hvis ikke allerede bekræftet)
  if (storeData.emotionalCheckInAfter.moodPercent === null) {
    setSliderPercent('after', 1);
  } else {
    // Gendan tidligere bekræftet position
    setSliderPercent('after', storeData.emotionalCheckInAfter.moodPercent);
    unlockFinalReflection();
  }
}

/* Lås tekstfeltet til afsluttende refleksion op
   (kaldes når mood-check-in efter er bekræftet). */
function unlockFinalReflection() {
  const section3 = document.querySelector('.after-section-3');
  const textarea = document.getElementById('after-reflection-text');
  const copyBtn  = document.getElementById('after-copy-btn');

  section3.classList.add('is-unlocked');
  textarea.disabled = false;
  copyBtn.disabled = false;

  // Scroll til sektion 3 så brugeren ser at den er aktiveret
  section3.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function initAfterState() {
  const textarea = document.getElementById('after-reflection-text');
  const saveBtn  = document.getElementById('after-save-btn');
  const copyBtn  = document.getElementById('after-copy-btn');
  const copyConfirmEl = document.getElementById('after-copy-confirm');

  // Aktiver save-knap når der er tekst
  textarea.addEventListener('input', () => {
    saveBtn.disabled = textarea.value.trim().length === 0;
  });

  // Copy-knap
  copyBtn.addEventListener('click', async () => {
    const text = textarea.value.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      storeData.finalReflection.copiedToClipboard = true;
      saveData();
      copyConfirmEl.textContent = t('afterCopyConfirm');
      copyConfirmEl.hidden = false;
      setTimeout(() => { copyConfirmEl.hidden = true; }, 2000);
    } catch (err) {
      console.error('Copy fejlede:', err);
      copyConfirmEl.textContent = t('afterCopyError');
      copyConfirmEl.hidden = false;
    }
  });

  // Save-knap
  saveBtn.addEventListener('click', () => {
    const text = textarea.value.trim();
    if (!text) return;
    storeData.finalReflection.text = text;
    storeData.finalReflection.timestamp = new Date().toISOString();
    saveData();
    showState('state-share');
    populateShareState();
  });
}


/* ============================================================
   11. STATE 7 — SEND OG DEL + VALGFRI NY FLASKEPOST
   ============================================================ */

function populateShareState() {
  // Vis afsluttende refleksion som referencepunkt
  document.getElementById('share-reflection-display').textContent =
    storeData.finalReflection.text || '';

  // Reset confirm-område og fremtids-sektion til startposition
  document.getElementById('share-confirm').hidden = true;
  document.getElementById('future-section').hidden = true;
  document.getElementById('future-step-1').hidden = false;
  document.getElementById('future-step-2').hidden = true;
  document.getElementById('future-step-3').hidden = true;
}

function initShareState() {
  // === Delingsmuligheder (de fire knapper) ===
  document.querySelectorAll('.share-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const choice = btn.getAttribute('data-choice');
      handleShareChoice(choice);
    });
  });

  // === Valgfri ny flaskepost — Trin 1 ===
  document.getElementById('future-yes-btn').addEventListener('click', () => {
    document.getElementById('future-step-1').hidden = true;
    document.getElementById('future-step-2').hidden = false;
  });
  document.getElementById('future-no-btn').addEventListener('click', () => {
    // Brugeren springer fremtids-besked over → afsluttende skærm
    showState('state-final');
  });

  // Rejseoversigt-knap
  document.getElementById('share-journey-btn').addEventListener('click', () => {
    populateJourneyState();
    showState('state-journey');
  });

  // === Valgfri ny flaskepost — Trin 2 (skriv + dato) ===
  const futureText  = document.getElementById('future-text');
  const futureDate  = document.getElementById('future-date-input');
  const futureSend  = document.getElementById('future-send-btn');
  const futureError = document.getElementById('future-error');

  function updateFutureSendButton() {
    const hasText = futureText.value.trim().length > 0;
    const hasDate = futureDate.value.length > 0;
    futureSend.disabled = !(hasText && hasDate);
  }

  futureText.addEventListener('input', updateFutureSendButton);
  futureDate.addEventListener('change', updateFutureSendButton);

  // Quick-interval-knapper
  document.querySelectorAll('[data-interval]').forEach(btn => {
    btn.addEventListener('click', () => {
      const interval = btn.getAttribute('data-interval');
      const now = new Date();
      if (interval === 'week')         now.setDate(now.getDate() + 7);
      else if (interval === 'month')   now.setMonth(now.getMonth() + 1);
      else if (interval === 'threemonths') now.setMonth(now.getMonth() + 3);
      // Format YYYY-MM-DD til date-input
      const iso = now.toISOString().slice(0, 10);
      futureDate.value = iso;
      updateFutureSendButton();
    });
  });

  // Send-knap for fremtidsbesked
  futureSend.addEventListener('click', () => {
    const text = futureText.value.trim();
    const dateStr = futureDate.value;

    // Validér: tekst skal være der
    if (!text) {
      futureError.textContent = t('futureEmptyError');
      futureError.hidden = false;
      return;
    }
    // Validér: dato skal være i fremtiden
    const today = new Date(); today.setHours(0,0,0,0);
    const chosen = new Date(dateStr);
    if (chosen <= today) {
      futureError.textContent = t('futureDateInPastError');
      futureError.hidden = false;
      return;
    }
    futureError.hidden = true;

    // Gem til datamodel
    storeData.futureMessage.text = text;
    storeData.futureMessage.deliveryDate = dateStr;
    storeData.futureMessage.delivered = false;
    saveData();

    // Afspil samme flaskepost-animation som State 3
    playBottleAnimation(() => {
      // Vis bekræftelses-skærm med leveringsdato
      document.getElementById('future-step-2').hidden = true;
      document.getElementById('future-step-3').hidden = false;
      const lineTemplate = t('futureConfirmDateLine');
      document.getElementById('future-confirm-date-line').textContent =
        formatDateLabel(lineTemplate, chosen.toISOString());
    });
  });
}

/* Håndter brugerens valg i delings-knapperne. */
function handleShareChoice(choice) {
  storeData.finalReflection.sharingChoice = choice;
  storeData.finalReflection.sharingTimestamp = new Date().toISOString();
  saveData();

  // Vis bekræftelses-område med relevant indhold
  const confirmEl   = document.getElementById('share-confirm');
  const titleEl     = document.getElementById('share-confirm-title');
  const bodyEl      = document.getElementById('share-confirm-body');
  const actionBtn   = document.getElementById('share-confirm-action-btn');
  const copyConfirm = document.getElementById('share-copy-confirm');

  copyConfirm.hidden = true;
  confirmEl.hidden = false;

  // Designvalg: Fælles struktur for de fire valg, kun indhold varierer.
  // 'keep' har ingen action-knap (bare bekræftelse + tak).
  if (choice === 'saved') {
    titleEl.textContent = t('shareKeepConfirmTitle');
    bodyEl.textContent  = t('shareKeepConfirmBody');
    actionBtn.hidden = true;
    // Efter en kort pause går vi til afsluttende skærm + fremtids-besked invitation
    setTimeout(() => {
      document.getElementById('future-section').hidden = false;
      document.getElementById('future-section').scrollIntoView({ behavior: 'smooth' });
    }, 1500);
  } else if (choice === 'wisethinking') {
    titleEl.textContent = t('shareWisethinkingConfirmTitle');
    bodyEl.textContent  = t('shareWisethinkingConfirmBody');
    actionBtn.hidden = false;
    actionBtn.textContent = t('shareWisethinkingConfirmButton');
    actionBtn.onclick = () => copyAndOpen('https://wisethinking.world', copyConfirm);
    document.getElementById('future-section').hidden = false;
  } else if (choice === 'circle') {
    titleEl.textContent = t('shareCircleConfirmTitle');
    bodyEl.textContent  = t('shareCircleConfirmBody');
    actionBtn.hidden = false;
    actionBtn.textContent = t('shareCircleConfirmButton');
    actionBtn.onclick = () => copyToClipboard(copyConfirm);
    document.getElementById('future-section').hidden = false;
  } else if (choice === 'chat') {
    titleEl.textContent = t('shareChatConfirmTitle');
    bodyEl.textContent  = t('shareChatConfirmBody');
    actionBtn.hidden = false;
    actionBtn.textContent = t('shareChatConfirmButton');
    actionBtn.onclick = () => copyAndOpen('https://wisethinking.world', copyConfirm);
    document.getElementById('future-section').hidden = false;
  }

  confirmEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* Kopiér refleksionen til clipboard og vis bekræftelse. */
async function copyToClipboard(confirmEl) {
  try {
    await navigator.clipboard.writeText(storeData.finalReflection.text);
    confirmEl.textContent = t('afterCopyConfirm');
    confirmEl.hidden = false;
    setTimeout(() => { confirmEl.hidden = true; }, 2000);
  } catch (err) {
    confirmEl.textContent = t('afterCopyError');
    confirmEl.hidden = false;
  }
}

/* Kopiér og åbn URL i ny fane. */
async function copyAndOpen(url, confirmEl) {
  await copyToClipboard(confirmEl);
  window.open(url, '_blank', 'noopener');
}


/* ============================================================
   12. STATE 8 — SLUTSKÆRM
   ============================================================ */

/* Sæt event listeners op for slutskærmen.
   Tilbage-knappen returnerer til State 7 (deling) fordi "Se din rejse"
   er placeret der — slutskærmen er en rolig bekræftelse, ikke et
   navigationspunkt for videre udforskning. */
function initFinalState() {
  document.getElementById('final-back-btn').addEventListener('click', () => {
    showState('state-share');
  });
}


/* ============================================================
   13. STATE 9 — REJSEOVERSIGT
   ============================================================ */

/* Fyld rejseoversigten med data fra hele forløbet: begge check-ins,
   den originale flaskepost-tekst og den afsluttende refleksion.
   Designvalg: Kaldes umiddelbart inden showState('state-journey') frem for
   ved init, så indholdet altid er frisk og afspejler det aktive sprog. */
function populateJourneyState() {
  const d = storeData;

  // Før-check-in
  if (d.emotionalCheckInBefore.moodPercent !== null) {
    const levelKey = getMoodLevelKey(d.emotionalCheckInBefore.moodPercent);
    const ts = d.emotionalCheckInBefore.timestamp;
    const dateStr = ts ? formatDateLabel(t('journeyTimestampFormat'), ts) : '';
    document.getElementById('journey-before-summary').textContent =
      t(levelKey) + ' — ' + d.emotionalCheckInBefore.moodPercent + '%'
      + (dateStr ? '  ·  ' + dateStr : '');
  }

  // Besked til fremtidigt selv
  document.getElementById('journey-message-display').textContent =
    d.intentionMessage.text || '';

  // Efter-check-in
  if (d.emotionalCheckInAfter.moodPercent !== null) {
    const levelKey = getMoodLevelKey(d.emotionalCheckInAfter.moodPercent);
    const ts = d.emotionalCheckInAfter.timestamp;
    const dateStr = ts ? formatDateLabel(t('journeyTimestampFormat'), ts) : '';
    document.getElementById('journey-after-summary').textContent =
      t(levelKey) + ' — ' + d.emotionalCheckInAfter.moodPercent + '%'
      + (dateStr ? '  ·  ' + dateStr : '');
  }

  // Afsluttende refleksion
  document.getElementById('journey-reflection-display').textContent =
    d.finalReflection.text || '';
}

/* Sæt event listeners op for rejseoversigten.
   Den eneste navigation er tilbage til slutskærmen. */
function initJourneyState() {
  document.getElementById('journey-back-btn').addEventListener('click', () => {
    showState('state-final');
  });
}


/* ============================================================
   HJÆLPEFUNKTIONER — dato/tid-formatering
   ============================================================ */

/* Formatér en ISO-timestamp til pæn læsbar dato på det aktive sprog.
   template: en streng med {date} og/eller {time} placeholders. */
function formatDateLabel(template, isoTimestamp) {
  if (!isoTimestamp) return '';
  const d = new Date(isoTimestamp);
  const months = t('monthsLong');
  const dateStr = d.getDate() + '. ' + months[d.getMonth()] + ' ' + d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const timeStr = hh + ':' + mm;
  return template.replace('{date}', dateStr).replace('{time}', timeStr);
}

/* Genopfrisk alle dato-labels (kaldes ved sprogskift). */
function refreshDateLabels() {
  const intentionTs = storeData.intentionMessage.timestamp;
  if (intentionTs) {
    const recEl = document.getElementById('receive-date-label');
    if (recEl) recEl.textContent = formatDateLabel(t('receiveDateLabel'), intentionTs);
    const aftEl = document.getElementById('after-date-label');
    if (aftEl) aftEl.textContent = formatDateLabel(t('afterSection1DateLabel'), intentionTs);
  }
  const futureDate = storeData.futureMessage.deliveryDate;
  if (futureDate) {
    const fEl = document.getElementById('future-confirm-date-line');
    if (fEl) fEl.textContent = formatDateLabel(t('futureConfirmDateLine'), futureDate);
  }
  // Genberegn vejr-niveau-tekst i før-check-in referencen (teksten er sprogafhængig)
  refreshBeforeCheckInSummary();
}

/* Opdater den diskrete før-check-in reference i State 6.
   Kaldes ved indgang til State 6 og ved sprogskift. */
function refreshBeforeCheckInSummary() {
  const el = document.getElementById('before-checkin-summary');
  if (!el || storeData.emotionalCheckInBefore.moodPercent === null) return;
  const levelKey = getMoodLevelKey(storeData.emotionalCheckInBefore.moodPercent);
  el.textContent = t(levelKey) + ' — ' + storeData.emotionalCheckInBefore.moodPercent + '%';
}


/* ============================================================
   14. INITIALISERING VED SIDEINDLÆSNING
   ============================================================ */

function init() {
  // Tjek localStorage er tilgængelig før alt andet
  if (!isLocalStorageAvailable()) {
    document.body.innerHTML =
      '<div style="padding:3rem; text-align:center; font-family:Lora,serif;">' +
      translations.da.errorLocalStorage + '</div>';
    return;
  }

  // Indlæs eksisterende data eller default
  storeData = loadData();

  // Sprog-toggle
  document.getElementById('lang-toggle').addEventListener('click', toggleLanguage);

  // Initialiser alle states og slidere
  initWelcomeState();
  initSlider('before');
  initSlider('after');
  initIntentionState();
  initBridgeState();
  initReceiveState();
  initAfterState();
  initShareState();
  initFinalState();   // State 8 — Slutskærm
  initJourneyState(); // State 9 — Rejseoversigt

  // Nulstil-knap — sletter al data og genindlæser siden efter brugerens confirm()
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm(t('resetConfirm'))) {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  });

  // Genopret eksisterende slider-positioner hvis brugeren vender tilbage
  if (storeData.emotionalCheckInBefore.moodPercent !== null) {
    setSliderPercent('before', storeData.emotionalCheckInBefore.moodPercent);
  }
  if (storeData.emotionalCheckInAfter.moodPercent !== null) {
    setSliderPercent('after', storeData.emotionalCheckInAfter.moodPercent);
  }
  // Genopret tekstfelter
  if (storeData.intentionMessage.text) {
    document.getElementById('intention-text').value = storeData.intentionMessage.text;
  }
  if (storeData.finalReflection.text) {
    document.getElementById('after-reflection-text').value = storeData.finalReflection.text;
  }

  // Anvend sprog (oversæt al UI-tekst)
  applyTranslations();

  // Bestem hvilken state brugeren skal lande på (resume-logik)
  resumeAtCorrectState();
}

// Scripts i bunden af <body> kører synkront — DOM er fuldt tilgængelig her.
// Kald init() direkte i stedet for at vente på window.load, som blokeres
// af eksterne ressourcer (fx Google Fonts) der måske aldrig svarer.
init();
