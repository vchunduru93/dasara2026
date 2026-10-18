// Shared by day.html and bhajans.html: saved preferences, text loading and rendering.
window.TEXTS = window.TEXTS || {};

const Prefs = {
  get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }
};

function initialLang() {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (LANG_LABELS[fromUrl]) return fromUrl;
  const saved = Prefs.get('pujaLang');
  return LANG_LABELS[saved] ? saved : 'en';
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// Load texts/<id>.js once (script tags work from file:// too)
const loading = {};
function loadText(id) {
  if (TEXTS[id]) return Promise.resolve(TEXTS[id]);
  if (!loading[id]) {
    loading[id] = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `texts/${id}.js`;
      s.onload = () => resolve(TEXTS[id]);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return loading[id];
}

// A running count at the end of a line, e.g. "... namaḥ (40)" or "... śailasutē ॥ 4 ॥", is shown as a small number at the right edge
// Counts look like "(40)" (ashtottaram names) or "⟦4⟧" (verse and stanza numbers, see verseNumbers and
// numberStanzas). A plain "॥2॥" in a bhajan means "sing twice" and stays in the text.
const LINE_COUNT = /\s*(?:\(([\d०-९౦-౯೦-೯௦-௯൦-൯০-৯]+)\)|⟦([\d०-९౦-౯೦-೯௦-௯൦-൯০-৯]+)⟧)\s*$/;
function renderLine(l) {
  const m = l.match(LINE_COUNT);
  // "(2)" or "(3)" in a bhajan means "sing it twice/three times" and stays in the text; name counts are 10 and up
  const toDigits = s => s.replace(/[०-९౦-౯೦-೯௦-௯൦-൯০-৯]/g, d => String((d.codePointAt(0) - 0x0966) % 16));
  if (!m || (m[1] && +toDigits(m[1]) < 10)) return `<span class="line">${escapeHtml(l)}</span>`;
  // Shown in plain digits (the sources mix in Devanagari, Telugu or Tamil digits, e.g. Tamil "1௦" for 10)
  const n = (m[1] || m[2]).replace(/[०-९౦-౯೦-೯௦-௯൦-൯০-৯]/g, d => String((d.codePointAt(0) - 0x0966) % 16));
  return `<span class="line has-count"><span class="line-count">${n}</span>${escapeHtml(l.slice(0, m.index))}</span>`;
}

// Render a text's blocks; returns [{id, label}] for its section headings
function renderBlocks(blocks, idPrefix) {
  const headings = [];
  const html = blocks.map(([kind, lines]) => {
    const text = lines.map(renderLine).join('');
    // "heading" is a maroon section title; "section" is a quieter gray italic one. Both are jump targets.
    if (kind === 'heading' || kind === 'section') {
      const id = `${idPrefix}-s${headings.length}`;
      headings.push({ id, label: lines[0].replace(/[:\s]+$/, '') });
      return `<h3 id="${id}" class="p-${kind}">${text}</h3>`;
    }
    return `<div class="p-${kind}">${text}</div>`;
  }).join('');
  return { html, headings };
}

function langOptions(lang) {
  return Object.keys(LANG_LABELS)
    .map(code => `<option value="${code}"${code === lang ? ' selected' : ''}>${LANG_LABELS[code]}</option>`).join('');
}

// Aa opens a slider for the reading text size (saved per device)
// The − and + buttons beside a slider move it one step
function setupStepButtons() {
  document.querySelectorAll('.step-btn').forEach(b => {
    const slider = document.getElementById(b.dataset.slider);
    b.onclick = () => {
      b.dataset.dir === '1' ? slider.stepUp() : slider.stepDown();
      slider.dispatchEvent(new Event('input'));
    };
  });
}

function setupTextSize(target) {
  setupStepButtons();
  const toggle = document.getElementById('sizeToggle');
  const row = document.getElementById('sizeRow');
  const slider = document.getElementById('sizeSlider');
  let scale = Math.min(1.6, Math.max(0.8, parseFloat(Prefs.get('pujaScale')) || 1));
  const label = document.getElementById('sizeLabel');
  // The label shows the actual reading size in pixels, which also depends on screen width
  const apply = () => {
    target.style.setProperty('--scale', scale);
    const reading = target.querySelector('.reading:not(.text-title)') || target;
    label.textContent = `${Math.round(parseFloat(getComputedStyle(reading).fontSize))}px`;
  };
  slider.value = scale;
  slider.oninput = () => { scale = +slider.value; Prefs.set('pujaScale', scale); apply(); };
  toggle.onclick = () => {
    const open = row.classList.toggle('hidden') === false;
    toggle.setAttribute('aria-expanded', open);
    toggle.classList.toggle('tool-btn-on', open);
    if (open) apply();
  };
  apply();
}

// Play/pause auto scroll at 0.25x–2x speed; the speed slider shows while it runs.
// Holding a finger on the screen pauses it, and it stops at the bottom of the page.
const AutoScroll = (() => {
  let playing = false, last = 0, carry = 0, touching = false, holdUntil = 0, wakeLock = null;
  const BASE = 30;  // pixels per second at 1x
  let rate = 1;
  let btn, row;

  function frame(t) {
    if (!playing) return;
    if (last && !touching && t > holdUntil) {
      carry += BASE * rate * (t - last) / 1000;
      const px = Math.floor(carry);
      if (px >= 1) { window.scrollBy(0, px); carry -= px; }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) { set(false); return; }
    }
    last = t;
    requestAnimationFrame(frame);
  }

  // Keep the screen awake while reading hands-free (where the browser allows it)
  async function keepAwake(on) {
    try {
      if (on && !wakeLock && navigator.wakeLock) wakeLock = await navigator.wakeLock.request('screen');
      if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
    } catch (e) { wakeLock = null; }
  }

  function set(on) {
    playing = on; last = 0; carry = 0;
    btn.setAttribute('aria-pressed', on);
    btn.classList.toggle('tool-btn-on', on);
    document.getElementById('playIcon').classList.toggle('hidden', on);
    document.getElementById('pauseIcon').classList.toggle('hidden', !on);
    row.classList.toggle('hidden', !on);
    keepAwake(on);
    if (on) requestAnimationFrame(frame);
  }

  function setup() {
    btn = document.getElementById('scrollToggle');
    row = document.getElementById('speedRow');
    const slider = document.getElementById('speedSlider');
    const label = document.getElementById('speedLabel');
    rate = Math.min(2, Math.max(0.25, parseFloat(Prefs.get('pujaScrollRate')) || 1));
    const show = () => { label.textContent = `${+rate.toFixed(2)}x`; };
    slider.value = rate;
    slider.oninput = () => { rate = +slider.value; Prefs.set('pujaScrollRate', rate); show(); };
    show();
    btn.onclick = () => set(!playing);
    const main = document.querySelector('main');
    main.addEventListener('touchstart', () => { touching = true; }, { passive: true });
    window.addEventListener('touchend', () => { touching = false; last = 0; }, { passive: true });
    window.addEventListener('touchcancel', () => { touching = false; last = 0; }, { passive: true });
    document.addEventListener('visibilitychange', () => { if (playing && document.visibilityState === 'visible') keepAwake(true); });
  }

  // Let a smooth jump (section or bhajan picker) finish before scrolling resumes
  function hold(ms) { holdUntil = performance.now() + ms; last = 0; }

  return { setup, hold, isPlaying: () => playing };
})();

function setUrlParams(params) {
  const url = new URL(location.href);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  history.replaceState(null, '', url);
}

// The small tab under the toolbar hides or shows it (remembered per device)
function setupToolbarToggle() {
  const body = document.getElementById('toolbarBody');
  const btn = document.getElementById('toolbarToggle');
  const chevron = document.getElementById('toolbarChevron');
  const set = (collapsed) => {
    body.classList.toggle('hidden', collapsed);
    document.getElementById('toolbar').classList.toggle('toolbar-collapsed', collapsed);
    chevron.classList.toggle('rotate-180', collapsed);
    btn.setAttribute('aria-expanded', !collapsed);
    btn.setAttribute('aria-label', collapsed ? 'Show toolbar' : 'Hide toolbar');
    btn.title = btn.getAttribute('aria-label');
  };
  let collapsed = Prefs.get('pujaToolbarCollapsed') === '1';
  btn.onclick = () => { collapsed = !collapsed; Prefs.set('pujaToolbarCollapsed', collapsed ? '1' : '0'); set(collapsed); };
  set(collapsed);
}

// Refrain notation for bhajans and stotrams with a repeated closing line: the line is written out the
// first time, then each later stanza ends with a short "↻ first words…" cue (verse numbers kept, and
// back-to-back repeats shown once as "×2")
function shortenRefrains(blocks) {
  const marker = l => (l.match(/\s*(?:॥\s*[\d०-९౦-౯೦-೯௦-௯൦-൯০-৯]+\s*॥|⟦[\d०-९౦-౯೦-೯௦-௯൦-൯০-৯]+⟧)\s*$/) || [''])[0];
  const norm = l => l.replace(marker(l), '').replace(/[\s।॥|,.!~]+/g, ' ').trim().toLowerCase();
  const counts = {};
  blocks.forEach(([, lines]) => { const k = norm(lines[lines.length - 1] || ''); if (k) counts[k] = (counts[k] || 0) + 1; });
  const [refrain, n] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || [];
  if (!refrain || n < 3) return blocks;
  const cue = (l, words = 4) => l.replace(marker(l), '').replace(/^[\s॥|]+/, '').split(/\s+/).slice(0, words).join(' ')
    .replace(/[,.।॥|]+$/, '') + ' …' + marker(l).replace(/^\s*/, ' ');
  let seen = false;
  const out = [];
  for (const [kind, lines] of blocks) {
    const last = lines[lines.length - 1];
    if (norm(last || '') !== refrain) { out.push([kind, lines]); continue; }
    if (!seen) { seen = true; out.push([lines.every(x => norm(x) === refrain) ? 'chorus' : kind, lines]); continue; }
    if (lines.length > 1) out.push([kind, lines.slice(0, -1)]);
    const prev = out[out.length - 1];
    if (lines.length === 1 && prev && prev[0] === 'refrain') {
      prev[2] = (prev[2] || 1) + 1;  // same cue again right after: count it instead of repeating
      // "×N" goes before the stanza number, which then shows at the right edge
      prev[1] = [cue(last, 3).replace(marker(last), '') + ` ×${prev[2]}` + marker(last).replace(/^\s*/, ' ')];
    } else {
      out.push(['refrain', [cue(last)]]);
    }
  }
  return out.map(([kind, lines]) => [kind, lines]);
}

// Number each stanza of a bhajan (on its last line, shown at the right edge like the stotram verse numbers).
// Chorus repeats aren't stanzas, so refrain cues and chorus-only stanzas are skipped.
function numberStanzas(blocks) {
  let n = 0;
  return blocks.map(([kind, lines]) => kind === 'text' && lines.length
    ? [kind, [...lines.slice(0, -1), `${lines[lines.length - 1]} ⟦${++n}⟧`]]
    : [kind, lines]);
}

// Stotram verse numbers ("॥ 4 ॥" closing a verse) become right-edge counts
function verseNumbers(blocks) {
  return blocks.map(([kind, lines]) => [kind, lines.map(l => l.replace(/\s*॥\s*([\d०-९౦-౯೦-೯௦-௯൦-൯০-৯]+)\s*॥\s*$/, ' ⟦$1⟧'))]);
}
