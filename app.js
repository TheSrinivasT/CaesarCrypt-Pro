/**
 * Caesar Cipher Lab — app.js
 * Complete interactive cryptography education tool.
 * No backend, no dependencies, pure vanilla JavaScript.
 */

'use strict';

// ════════════════════════════════════════════════════
// CONSTANTS & UTILITIES
// ════════════════════════════════════════════════════

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ALPHA_LEN = 26;

/** English letter frequency (A–Z, approximate %) */
const EN_FREQ = [
  8.17, 1.49, 2.78, 4.25, 12.70, 2.23, 2.01, 6.09,
  6.97, 0.15, 0.77, 4.03, 2.41, 6.75, 7.51, 1.93,
  0.10, 5.99, 6.33, 9.06, 2.76, 0.98, 2.36, 0.15,
  1.97, 0.07
];

/** English common words for "likely plaintext" detection */
const COMMON_WORDS = [
  'the','and','for','are','but','not','you','all',
  'can','had','her','was','one','our','out','day',
  'get','has','him','his','how','its','may','new',
  'now','old','see','two','way','who','did','let',
  'put','say','she','too','use','that','this','with',
  'have','from','they','will','would','could','their',
  'what','when','which','there','about','hello','world'
];

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "Julius Caesar used this cipher to communicate with his generals in ancient Rome.",
  "Cryptography is the art of writing or solving codes to secure communications.",
  "Veni, vidi, vici — I came, I saw, I conquered.",
  "The only secure cipher is one that has never been broken — and Caesar's has.",
  "In war, truth is so precious that she should always be attended by a bodyguard of lies.",
  "Hello, World! This is an encrypted message using the Caesar cipher algorithm."
];

let sampleIndex = 0;
let currentShift = 3;
let lastOperation = null; // 'encrypt' | 'decrypt'
let lastResult = '';

// ════════════════════════════════════════════════════
// CORE CIPHER ENGINE
// ════════════════════════════════════════════════════

/**
 * Caesar-shift a single character.
 * @param {string} char  - single character
 * @param {number} shift - shift amount (0–25)
 * @param {boolean} encrypt - true = forward, false = backward
 * @returns {string} shifted character
 */
function shiftChar(char, shift, encrypt = true) {
  const code = char.charCodeAt(0);
  const isUpper = code >= 65 && code <= 90;
  const isLower = code >= 97 && code <= 122;

  if (!isUpper && !isLower) return char; // preserve non-alpha

  const base = isUpper ? 65 : 97;
  const pos  = code - base;
  const newPos = encrypt
    ? (pos + shift) % ALPHA_LEN
    : ((pos - shift) % ALPHA_LEN + ALPHA_LEN) % ALPHA_LEN;

  return String.fromCharCode(base + newPos);
}

/**
 * Apply Caesar cipher to a full string.
 * @param {string} text
 * @param {number} shift
 * @param {boolean} encrypt
 * @returns {{ result: string, trace: Array }}
 */
function caesarCipher(text, shift, encrypt = true) {
  const trace = [];
  let result = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const out  = shiftChar(char, shift, encrypt);
    result += out;

    const isAlpha = /[a-zA-Z]/.test(char);
    if (isAlpha) {
      const upper = char.toUpperCase();
      const P = upper.charCodeAt(0) - 65;
      const newP = encrypt
        ? (P + shift) % ALPHA_LEN
        : ((P - shift) % ALPHA_LEN + ALPHA_LEN) % ALPHA_LEN;
      const formula = encrypt
        ? `(${P} + ${shift}) mod 26 = ${newP}`
        : `(${P} − ${shift} + 26) mod 26 = ${newP}`;

      trace.push({
        orig: char,
        isAlpha: true,
        P,
        K: shift,
        newP,
        result: out,
        formula
      });
    } else {
      trace.push({ orig: char, isAlpha: false, result: out });
    }
  }

  return { result, trace };
}

/**
 * Brute-force: try all 26 decryption shifts.
 * Returns array of { shift, text, score, isLikely }
 */
function bruteForce(ciphertext) {
  const results = [];
  for (let k = 0; k < ALPHA_LEN; k++) {
    const { result } = caesarCipher(ciphertext, k, false);
    const score = computeEnglishScore(result);
    results.push({ shift: k, text: result, score });
  }

  // Normalise scores and tag likely
  const maxScore = Math.max(...results.map(r => r.score));
  return results.map(r => ({
    ...r,
    isLikely: maxScore > 0 && r.score >= maxScore * 0.85
  }));
}

/**
 * Score a string by English letter frequency + common word count.
 */
function computeEnglishScore(text) {
  const lower = text.toLowerCase();
  let score = 0;

  // Frequency score
  for (const ch of lower) {
    const idx = ch.charCodeAt(0) - 97;
    if (idx >= 0 && idx < ALPHA_LEN) {
      score += EN_FREQ[idx];
    }
  }

  // Common word bonus
  const words = lower.match(/[a-z]+/g) || [];
  for (const w of words) {
    if (COMMON_WORDS.includes(w)) score += 30;
  }

  return score;
}

// ════════════════════════════════════════════════════
// DOM HELPERS
// ════════════════════════════════════════════════════

function $(id) { return document.getElementById(id); }

let toastTimer = null;

/**
 * Show a toast notification.
 * @param {string} msg
 * @param {'success'|'error'|'info'} type
 */
function showToast(msg, type = 'info') {
  const toast = $('toast');
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/**
 * Copy text to clipboard.
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('✅ Copied to clipboard!', 'success');
  } catch {
    // Fallback
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast('✅ Copied!', 'success');
  }
}

// ════════════════════════════════════════════════════
// SHIFT CONTROL
// ════════════════════════════════════════════════════

function updateShiftUI(k) {
  currentShift = ((k % 26) + 26) % 26;

  // Slider
  const slider = $('shiftSlider');
  slider.value = currentShift;
  const pct = (currentShift / 25) * 100;
  slider.style.setProperty('--slider-pct', pct + '%');

  // Badge
  $('shiftValueBadge').textContent = `K = ${currentShift}`;

  // Wheel center number
  $('wheelShiftDisplay').textContent = currentShift;
  $('vizShiftValue').textContent = currentShift;

  // Quick-btn highlight
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.shift) === currentShift);
  });

  // Update visualizations
  updateAlphabetVisualizer();
  updateCipherWheel();
}

// ════════════════════════════════════════════════════
// CIPHER WHEEL (Hero)
// ════════════════════════════════════════════════════

function buildCipherWheel() {
  const outer = $('wheelOuter');
  const inner = $('wheelInner');
  outer.innerHTML = '';
  inner.innerHTML = '';

  const outerR = 155, innerR = 85;

  for (let i = 0; i < ALPHA_LEN; i++) {
    const angleRad = (i / ALPHA_LEN) * 2 * Math.PI - Math.PI / 2;

    // Outer ring (plaintext)
    const oEl = document.createElement('span');
    oEl.textContent = ALPHABET[i];
    oEl.className = 'wheel-letter';
    oEl.id = `wOuter-${i}`;
    oEl.style.left = `calc(50% + ${outerR * Math.cos(angleRad)}px - 10px)`;
    oEl.style.top  = `calc(50% + ${outerR * Math.sin(angleRad)}px - 10px)`;
    outer.appendChild(oEl);

    // Inner ring (ciphertext)
    const iEl = document.createElement('span');
    iEl.textContent = ALPHABET[(i + currentShift) % ALPHA_LEN];
    iEl.className = 'wheel-letter';
    iEl.id = `wInner-${i}`;
    iEl.style.left = `calc(50% + ${innerR * Math.cos(angleRad)}px - 8px)`;
    iEl.style.top  = `calc(50% + ${innerR * Math.sin(angleRad)}px - 8px)`;
    inner.appendChild(iEl);
  }
}

function updateCipherWheel() {
  for (let i = 0; i < ALPHA_LEN; i++) {
    const el = $(`wInner-${i}`);
    if (el) el.textContent = ALPHABET[(i + currentShift) % ALPHA_LEN];
  }
}

// ════════════════════════════════════════════════════
// ALPHABET VISUALIZER
// ════════════════════════════════════════════════════

function buildAlphabetVisualizer() {
  const plainContainer  = $('alphaPlain');
  const cipherContainer = $('alphaCipher');
  const arrowContainer  = $('alphaArrows');

  plainContainer.innerHTML  = '';
  cipherContainer.innerHTML = '';
  arrowContainer.innerHTML  = '';

  for (let i = 0; i < ALPHA_LEN; i++) {
    // Plain cell
    const pCell = document.createElement('div');
    pCell.className = 'alpha-cell alpha-cell-plain';
    pCell.id = `alphaPlain-${i}`;
    pCell.textContent = ALPHABET[i];
    pCell.title = `Position ${i}`;
    plainContainer.appendChild(pCell);

    // Cipher cell
    const cCell = document.createElement('div');
    cCell.className = 'alpha-cell alpha-cell-cipher';
    cCell.id = `alphaCipher-${i}`;
    cipherContainer.appendChild(cCell);

    // Arrow
    const arrow = document.createElement('div');
    arrow.className = 'alpha-arrow';
    arrow.id = `alphaArrow-${i}`;
    arrowContainer.appendChild(arrow);
  }

  // Freq chart
  buildFreqChart();

  updateAlphabetVisualizer();
}

function updateAlphabetVisualizer() {
  for (let i = 0; i < ALPHA_LEN; i++) {
    const shifted = (i + currentShift) % ALPHA_LEN;
    const cCell = $(`alphaCipher-${i}`);
    const arrow = $(`alphaArrow-${i}`);

    if (cCell) cCell.textContent = ALPHABET[shifted];

    if (arrow) {
      if (currentShift === 0) {
        arrow.textContent = '↕';
        arrow.classList.remove('shifted');
      } else {
        arrow.textContent = '↓';
        arrow.classList.toggle('shifted', true);
      }
    }
  }
  buildVizTable();
}

function buildVizTable() {
  const tbody = $('vizTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  for (let i = 0; i < ALPHA_LEN; i++) {
    const newI = (i + currentShift) % ALPHA_LEN;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="plain-letter">${ALPHABET[i]}</td>
      <td>${i}</td>
      <td style="color:var(--clr-cyan)">→</td>
      <td>${newI}</td>
      <td class="cipher-letter">${ALPHABET[newI]}</td>
      <td class="formula-cell">(${i} + ${currentShift}) mod 26 = ${newI}</td>
    `;
    tbody.appendChild(tr);
  }
}

// ════════════════════════════════════════════════════
// FREQUENCY CHART
// ════════════════════════════════════════════════════

function buildFreqChart() {
  const container = $('freqChart');
  if (!container) return;
  container.innerHTML = '';
  const max = Math.max(...EN_FREQ);

  for (let i = 0; i < ALPHA_LEN; i++) {
    const wrap = document.createElement('div');
    wrap.className = 'freq-bar-wrap';

    const bar = document.createElement('div');
    bar.className = 'freq-bar';
    const heightPct = (EN_FREQ[i] / max) * 100;
    bar.style.height = `${heightPct}%`;
    bar.title = `${ALPHABET[i]}: ${EN_FREQ[i]}%`;

    const label = document.createElement('div');
    label.className = 'freq-bar-label';
    label.textContent = ALPHABET[i];

    wrap.appendChild(bar);
    wrap.appendChild(label);
    container.appendChild(wrap);
  }
}

// ════════════════════════════════════════════════════
// SHIFT TICKS
// ════════════════════════════════════════════════════

function buildShiftTicks() {
  const container = $('shiftTicks');
  if (!container) return;
  container.innerHTML = '';
  const show = [0, 5, 10, 13, 15, 20, 25];
  for (let i = 0; i <= 25; i++) {
    const tick = document.createElement('span');
    tick.className = 'shift-tick';
    tick.textContent = show.includes(i) ? i : '';
    container.appendChild(tick);
  }
}

// ════════════════════════════════════════════════════
// ENCRYPT / DECRYPT (Main Tool)
// ════════════════════════════════════════════════════

function runCipher(encrypt) {
  const raw = $('inputText').value;

  if (!raw.trim()) {
    showToast('⚠️ Please enter some text first.', 'error');
    $('inputValidation').textContent = 'Input is empty.';
    $('inputValidation').className = 'validation-msg error';
    return;
  }

  $('inputValidation').textContent = '';

  const { result, trace } = caesarCipher(raw, currentShift, encrypt);
  lastResult = result;
  lastOperation = encrypt ? 'encrypt' : 'decrypt';

  // Output text
  const outputEl = $('outputText');
  outputEl.innerHTML = '';
  outputEl.appendChild(document.createTextNode(result));

  // Output meta
  const alphaOnly  = (raw.match(/[a-zA-Z]/g) || []).length;
  const totalChars = raw.length;
  $('outputMeta').innerHTML = `
    <span>Characters: <strong>${totalChars}</strong></span>
    <span>Letters shifted: <strong>${alphaOnly}</strong></span>
    <span>Shift key: <strong>K = ${currentShift}</strong></span>
    <span>Mode: <strong>${encrypt ? 'Encrypted' : 'Decrypted'}</strong></span>
  `;

  // Mode indicator
  $('modePillEncrypt').classList.toggle('active', encrypt);
  $('modePillDecrypt').classList.toggle('active', !encrypt);

  // Trace table
  buildTraceTable(trace, encrypt);
  $('tracePanel').style.display = 'block';
  $('traceToggleBtn').textContent = 'Hide';

  showToast(
    encrypt
      ? `🔒 Encrypted with shift K=${currentShift}`
      : `🔓 Decrypted with shift K=${currentShift}`,
    'success'
  );
}

function buildTraceTable(trace, encrypt) {
  const tbody = $('traceTableBody');
  tbody.innerHTML = '';

  trace.forEach(item => {
    const tr = document.createElement('tr');
    if (!item.isAlpha) {
      tr.innerHTML = `
        <td class="trace-orig">${escHtml(item.orig)}</td>
        <td class="trace-unchanged" colspan="3">— (not a letter)</td>
        <td class="trace-unchanged">${escHtml(item.result)}</td>
      `;
    } else {
      tr.innerHTML = `
        <td class="trace-orig">${escHtml(item.orig)}</td>
        <td>${item.P}</td>
        <td>${item.K}</td>
        <td>${item.newP}<br><small style="color:var(--clr-text-muted);font-size:.7em">${item.formula}</small></td>
        <td class="trace-result">${escHtml(item.result)}</td>
      `;
    }
    tbody.appendChild(tr);
  });
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ════════════════════════════════════════════════════
// BRUTE FORCE ATTACK
// ════════════════════════════════════════════════════

function launchBruteForce() {
  const text = $('bruteInput').value.trim();
  if (!text) {
    showToast('⚠️ Enter ciphertext to attack.', 'error');
    return;
  }

  const results = bruteForce(text);
  renderBruteResults(results);
  $('bruteResults').style.display = 'block';
  $('bruteResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderBruteResults(results) {
  const grid = $('bruteGrid');
  grid.innerHTML = '';

  // Sort by score descending to show most likely first
  const sorted = [...results].sort((a, b) => b.score - a.score);

  sorted.forEach(item => {
    const card = document.createElement('div');
    card.className = `brute-card${item.isLikely ? ' likely' : ''}`;
    card.dataset.shift = item.shift;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Shift ${item.shift}: ${item.text.substring(0,40)}`);

    const preview = item.text.length > 120
      ? item.text.substring(0, 117) + '…'
      : item.text;

    card.innerHTML = `
      <div class="brute-card-header">
        <span class="brute-shift-badge">K = ${item.shift}</span>
        <span class="brute-card-meta">Score: ${item.score.toFixed(0)} · ${item.isLikely ? '🔍 Candidate' : 'Unlikely'}</span>
      </div>
      <div class="brute-text">${escHtml(preview)}</div>
    `;

    card.addEventListener('click', () => {
      document.querySelectorAll('.brute-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      // Pre-fill cipher tool
      $('inputText').value = item.text;
      updateShiftUI(item.shift);
      updateCharCount();
      showToast(`✅ Loaded shift K=${item.shift} into cipher tool`, 'success');
    });

    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') card.click();
    });

    grid.appendChild(card);
  });
}

// ════════════════════════════════════════════════════
// UI HELPERS
// ════════════════════════════════════════════════════

function updateCharCount() {
  const len = $('inputText').value.length;
  const cc = $('charCount');
  cc.textContent = `${len} / 2000`;
  cc.style.color = len > 1800
    ? 'var(--clr-red)'
    : len > 1500
      ? 'var(--clr-amber)'
      : 'var(--clr-text-muted)';
}

// ════════════════════════════════════════════════════
// PARTICLE FIELD
// ════════════════════════════════════════════════════

function buildParticleField() {
  const field = $('particleField');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 1;
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      animation-duration: ${Math.random() * 15 + 10}s;
      animation-delay: ${Math.random() * 15}s;
      opacity: ${Math.random() * 0.5};
    `;
    field.appendChild(p);
  }
}

// ════════════════════════════════════════════════════
// NAVBAR SCROLL EFFECT
// ════════════════════════════════════════════════════

function setupNavbar() {
  const navbar = $('navbar');
  window.addEventListener('scroll', () => {
    navbar.style.background = window.scrollY > 30
      ? 'rgba(2, 11, 24, 0.95)'
      : 'rgba(2, 11, 24, 0.85)';
  }, { passive: true });

  // Mobile menu
  $('navMenuBtn').addEventListener('click', () => {
    $('navMobileLinks').classList.toggle('open');
  });

  // Close mobile menu on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => $('navMobileLinks').classList.remove('open'));
  });
}

// ════════════════════════════════════════════════════
// EVENT WIRING
// ════════════════════════════════════════════════════

function wireEvents() {
  // Shift slider
  const slider = $('shiftSlider');
  slider.addEventListener('input', () => updateShiftUI(parseInt(slider.value)));

  // +/- buttons
  $('shiftIncBtn').addEventListener('click', () => updateShiftUI(currentShift + 1 > 25 ? 0 : currentShift + 1));
  $('shiftDecBtn').addEventListener('click', () => updateShiftUI(currentShift - 1 < 0 ? 25 : currentShift - 1));

  // Quick preset buttons
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => updateShiftUI(parseInt(btn.dataset.shift)));
  });

  // Encrypt / Decrypt
  $('encryptBtn').addEventListener('click', () => runCipher(true));
  $('decryptBtn').addEventListener('click', () => runCipher(false));

  // Keyboard shortcut: Ctrl+Enter to encrypt
  $('inputText').addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); runCipher(true); }
    if (e.shiftKey && e.ctrlKey && e.key === 'Enter') { e.preventDefault(); runCipher(false); }
  });

  // Character count
  $('inputText').addEventListener('input', updateCharCount);

  // Reset
  $('resetBtn').addEventListener('click', () => {
    $('inputText').value = '';
    $('outputText').innerHTML = '<span class="output-placeholder">Your encrypted or decrypted text will appear here…</span>';
    $('outputMeta').innerHTML = '';
    $('tracePanel').style.display = 'none';
    $('traceTableBody').innerHTML = '';
    $('inputValidation').textContent = '';
    $('charCount').textContent = '0 / 2000';
    lastResult = '';
    lastOperation = null;
    updateShiftUI(3);
    showToast('🔄 Reset complete', 'info');
  });

  // Sample text
  $('sampleTextBtn').addEventListener('click', () => {
    $('inputText').value = SAMPLE_TEXTS[sampleIndex % SAMPLE_TEXTS.length];
    sampleIndex++;
    updateCharCount();
    showToast('📝 Sample text loaded', 'info');
  });

  // Copy result
  $('copyResultBtn').addEventListener('click', () => {
    if (!lastResult) { showToast('Nothing to copy yet!', 'error'); return; }
    copyToClipboard(lastResult);
  });

  // Use result as input (swap)
  $('swapBtn').addEventListener('click', () => {
    if (!lastResult) { showToast('No result to use yet!', 'error'); return; }
    $('inputText').value = lastResult;
    updateCharCount();
    showToast('↕️ Result moved to input', 'info');
  });

  // Trace toggle
  $('traceToggleBtn').addEventListener('click', () => {
    const wrap = document.querySelector('.trace-table-wrap');
    const btn  = $('traceToggleBtn');
    const isHidden = wrap.style.display === 'none';
    wrap.style.display = isHidden ? '' : 'none';
    btn.textContent = isHidden ? 'Hide' : 'Show';
  });

  // Brute force
  $('bruteForceBtn').addEventListener('click', launchBruteForce);

  $('bruteUseCipherBtn').addEventListener('click', () => {
    if (!lastResult) { showToast('No output result to use!', 'error'); return; }
    $('bruteInput').value = lastResult;
    showToast('📋 Result copied to brute-force panel', 'info');
    document.getElementById('brute-force').scrollIntoView({ behavior: 'smooth' });
  });

  $('bruteClearBtn').addEventListener('click', () => {
    $('bruteInput').value = '';
    $('bruteResults').style.display = 'none';
    $('bruteGrid').innerHTML = '';
  });

  // Enter key in brute-force textarea
  $('bruteInput').addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); launchBruteForce(); }
  });

  // Alphabet cell hover interaction
  setupAlphabetHover();
}

// ════════════════════════════════════════════════════
// ALPHABET HOVER INTERACTION
// ════════════════════════════════════════════════════

function setupAlphabetHover() {
  // Delegate from parent containers
  const plainContainer  = $('alphaPlain');
  const cipherContainer = $('alphaCipher');

  if (!plainContainer) return;

  function highlight(idx) {
    for (let i = 0; i < ALPHA_LEN; i++) {
      $(`alphaPlain-${i}`)?.classList.toggle('highlight-plain', i === idx);
      $(`alphaCipher-${i}`)?.classList.toggle('highlight-cipher', i === idx);
    }
  }

  function clearHighlight() {
    for (let i = 0; i < ALPHA_LEN; i++) {
      $(`alphaPlain-${i}`)?.classList.remove('highlight-plain');
      $(`alphaCipher-${i}`)?.classList.remove('highlight-cipher');
    }
  }

  plainContainer.addEventListener('mouseover', e => {
    const cell = e.target.closest('.alpha-cell');
    if (!cell) return;
    const idx = parseInt(cell.id.split('-')[1]);
    if (!isNaN(idx)) highlight(idx);
  });

  plainContainer.addEventListener('mouseleave', clearHighlight);

  cipherContainer.addEventListener('mouseover', e => {
    const cell = e.target.closest('.alpha-cell');
    if (!cell) return;
    const idx = parseInt(cell.id.split('-')[1]);
    if (!isNaN(idx)) highlight(idx);
  });

  cipherContainer.addEventListener('mouseleave', clearHighlight);
}

// ════════════════════════════════════════════════════
// CONCEPT CARDS ANIMATION
// ════════════════════════════════════════════════════

function setupConceptCards() {
  const cards = document.querySelectorAll('.concept-card');
  if (!('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, idx * 80);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease, border-color 0.25s ease, box-shadow 0.25s ease';
    io.observe(card);
  });
}

// ════════════════════════════════════════════════════
// INPUT VALIDATION (Live)
// ════════════════════════════════════════════════════

function setupInputValidation() {
  const textarea = $('inputText');
  const msg = $('inputValidation');

  textarea.addEventListener('input', () => {
    const val = textarea.value;
    if (val.length === 0) {
      msg.textContent = '';
      return;
    }
    const alphaCount = (val.match(/[a-zA-Z]/g) || []).length;
    const pct = Math.round((alphaCount / val.length) * 100);

    if (alphaCount === 0) {
      msg.textContent = '⚠️ No letters to shift';
      msg.className = 'validation-msg error';
    } else {
      msg.textContent = `✓ ${alphaCount} letters (${pct}%)`;
      msg.className = 'validation-msg success';
    }
  });
}

// ════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS BANNER (UX)
// ════════════════════════════════════════════════════

function showKeyboardHint() {
  setTimeout(() => {
    showToast('💡 Tip: Ctrl+Enter to encrypt, Ctrl+Shift+Enter to decrypt', 'info');
  }, 2000);
}

// ════════════════════════════════════════════════════
// MAIN INIT
// ════════════════════════════════════════════════════

function init() {
  buildParticleField();
  setupNavbar();
  buildCipherWheel();
  buildAlphabetVisualizer();
  buildShiftTicks();
  wireEvents();
  updateShiftUI(3);
  setupConceptCards();
  setupInputValidation();
  showKeyboardHint();

  // Animate hero elements
  document.querySelectorAll('.hero-content > *').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, i * 100 + 200);
  });
}

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
