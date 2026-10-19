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
  // A third "skip" entry grays a block out (e.g. the Udvasana, done only on the last day)
  const html = blocks.map(([kind, lines, skip]) => {
    const text = lines.map(renderLine).join('');
    const cls = `p-${kind}${skip ? ' p-skip' : ''}`;
    // "heading" is a maroon section title; "section" is a quieter gray italic one. Both are jump targets.
    if (kind === 'heading' || kind === 'section') {
      const id = `${idPrefix}-s${headings.length}`;
      headings.push({ id, label: lines[0].replace(/[:\s]+$/, '') });
      return `<h3 id="${id}" class="${cls}">${text}</h3>`;
    }
    return `<div class="${cls}">${text}</div>`;
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
  setupPinchZoom(target, () => scale, v => {
    scale = Math.min(1.6, Math.max(0.8, Math.round(v * 20) / 20));
    if (+slider.value === scale) return;
    slider.value = scale;
    Prefs.set('pujaScale', scale);
    apply();
  });
  toggle.onclick = () => {
    const open = row.classList.toggle('hidden') === false;
    toggle.setAttribute('aria-expanded', open);
    toggle.classList.toggle('tool-btn-on', open);
    if (open) apply();
  };
  apply();
}

// Pinching the text with two fingers changes the reading size (same setting as the Aa slider) instead of
// zooming the whole page; the spot between the fingers stays put on screen. Page zoom is turned off.
function setupPinchZoom(target, getScale, setScale) {
  let start = null;
  const span = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  target.addEventListener('touchstart', e => {
    if (e.touches.length !== 2) return;
    const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    start = { span: span(e.touches), scale: getScale(), midY, at: (scrollY + midY) / document.documentElement.scrollHeight };
  }, { passive: true });
  target.addEventListener('touchmove', e => {
    if (!start || e.touches.length !== 2) return;
    e.preventDefault();
    setScale(start.scale * span(e.touches) / start.span);
    window.scrollTo(0, start.at * document.documentElement.scrollHeight - start.midY);
  }, { passive: false });
  target.addEventListener('touchend', e => { if (e.touches.length < 2) start = null; }, { passive: true });
  // Safari zooms the page with its own gesture events, ignoring the viewport setting
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(ev => document.addEventListener(ev, e => e.preventDefault(), { passive: false }));
}

// Play/pause auto scroll at 0.25x–2x speed, from the floating dock (▶, with − and + while it runs) that can be dragged anywhere.
// Holding a finger on the text pauses it, and it stops at the bottom of the page.
const AutoScroll = (() => {
  let playing = false, last = 0, carry = 0, touching = false, holdUntil = 0, wakeLock = null;
  const BASE = 30;  // pixels per second at 1x
  const MIN = 0.25, MAX = 2, STEP = 0.05;
  let rate = 1;
  let btn;

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
    btn.closest('.scroll-dock').classList.toggle('playing', on);  // the speed buttons show only while scrolling
    document.getElementById('playIcon').classList.toggle('hidden', on);
    document.getElementById('pauseIcon').classList.toggle('hidden', !on);
    keepAwake(on);
    if (on) requestAnimationFrame(frame);
  }

  function setup() {
    btn = document.getElementById('scrollToggle');
    const label = document.getElementById('speedLabel');
    rate = Math.min(MAX, Math.max(MIN, parseFloat(Prefs.get('pujaScrollRate')) || 1));
    const show = () => { label.textContent = `${+rate.toFixed(2)}`; };
    show();
    // − and + change the speed one step; holding one keeps stepping
    document.querySelectorAll('#scrollDock .dock-step').forEach(b => {
      let timer = null;
      const step = () => {
        rate = Math.min(MAX, Math.max(MIN, Math.round((rate + STEP * +b.dataset.dir) * 100) / 100));
        Prefs.set('pujaScrollRate', rate);
        show();
      };
      const stop = () => { clearTimeout(timer); clearInterval(timer); timer = null; };
      b.addEventListener('pointerdown', () => { stop(); timer = setTimeout(() => { timer = setInterval(step, 110); }, 450); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => b.addEventListener(ev, stop));
      b.addEventListener('click', step);
    });
    btn.onclick = () => set(!playing);
    setupDockDrag(document.getElementById('scrollDock'));
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

// Drag the floating dock anywhere on the screen (a short tap still presses its buttons).
// Its spot is saved per device as a fraction of the screen, so it lands in the same place after rotating.
// It always stays above the bottom bar, so a spot saved in portrait can't cover Next in landscape.
function setupDockDrag(dock) {
  const bar = document.querySelector('body > nav');
  // The dock stays between the buttons at the top (the toolbar, or home and exit in full screen) and the bottom bar
  const tops = ['topBar', 'focusExit'].map(id => document.getElementById(id)).filter(Boolean);
  const shown = el => !el.classList.contains('hidden');
  const bounds = () => {
    const floor = bar && shown(bar) ? bar.getBoundingClientRect().top : window.innerHeight;
    const ceil = Math.max(0, ...tops.filter(shown).map(el => el.getBoundingClientRect().bottom)) + 8;
    const maxY = Math.max(ceil, floor - dock.offsetHeight - 8);
    return { maxX: window.innerWidth - dock.offsetWidth - 4, minY: Math.min(ceil, maxY), maxY };
  };
  // Saved as fractions of the room left and right, and top to bottom (x, y), so it lands in the same spot on any screen
  const place = (fx, fy) => {
    const { maxX, minY, maxY } = bounds();
    dock.style.left = `${Math.max(4, Math.min(maxX, fx * maxX))}px`;
    dock.style.top = `${minY + Math.max(0, Math.min(1, fy)) * (maxY - minY)}px`;
    dock.style.right = 'auto';
    dock.style.bottom = 'auto';
  };
  let saved = null;
  try { saved = JSON.parse(Prefs.get('pujaDock')); } catch (e) {}
  if (saved) place(saved.x, saved.y);
  const replace = () => { if (saved) place(saved.x, saved.y); };
  window.addEventListener('resize', replace);
  // Going in or out of full screen moves the top and bottom buttons
  new MutationObserver(replace).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  if (bar) new ResizeObserver(replace).observe(bar);
  tops.forEach(el => new ResizeObserver(replace).observe(el));

  let start = null, dragged = false;
  dock.addEventListener('pointerdown', e => {
    if (e.button > 0) return;
    const r = dock.getBoundingClientRect();
    start = { x: e.clientX, y: e.clientY, left: r.left, top: r.top, id: e.pointerId };
    dragged = false;
  });
  dock.addEventListener('pointermove', e => {
    if (!start || e.pointerId !== start.id) return;
    const dx = e.clientX - start.x, dy = e.clientY - start.y;
    if (!dragged && Math.hypot(dx, dy) < 8) return;
    if (!dragged) {
      dragged = true;
      try { dock.setPointerCapture(e.pointerId); } catch (err) {}
      dock.classList.add('dragging');
      // A drag isn't a press: stop any held − / + from repeating
      dock.querySelectorAll('.dock-step').forEach(b => b.dispatchEvent(new Event('pointercancel')));
    }
    const { maxX, minY, maxY } = bounds();
    saved = { x: Math.max(0, Math.min(1, (start.left + dx) / maxX)), y: maxY > minY ? Math.max(0, Math.min(1, (start.top + dy - minY) / (maxY - minY))) : 0 };
    place(saved.x, saved.y);
  });
  const end = () => {
    if (dragged) Prefs.set('pujaDock', JSON.stringify(saved));
    dock.classList.remove('dragging');
    start = null;
  };
  dock.addEventListener('pointerup', end);
  dock.addEventListener('pointercancel', end);
  // The click that ends a drag doesn't press the button under the finger
  dock.addEventListener('click', e => { if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false; } }, true);
}

function setUrlParams(params) {
  const url = new URL(location.href);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  history.replaceState(null, '', url);
}

// Full screen: the expand button in the toolbar hides the pinned title and toolbar so only the text, the
// bottom bar and the auto-scroll dock show; round buttons float in the top corners: home at the left, and
// at the right the one that brings the title and toolbar back (remembered per device).
// The pinned block's height is kept in --top-h so headings scroll in just below it.
function setupFocusMode() {
  const top = document.getElementById('topBar');
  const exit = document.getElementById('focusExit');
  const home = document.getElementById('focusHome');
  const setH = () => document.documentElement.style.setProperty('--top-h', `${top.offsetHeight}px`);
  new ResizeObserver(setH).observe(top);
  setH();
  const set = (on) => {
    top.classList.toggle('hidden', on);
    exit.classList.toggle('hidden', !on);
    home.classList.toggle('hidden', !on);
    document.documentElement.classList.toggle('focus-mode', on);
    Prefs.set('pujaFocus', on ? '1' : '0');
  };
  document.getElementById('focusToggle').onclick = () => set(true);
  exit.onclick = () => set(false);
  set(Prefs.get('pujaFocus') === '1');
}

// The space under the text is the bottom bar's height plus the same margin as the sides (see main in reader.css);
// the bar's height is kept in --bar-h, and is 0 when the page has no bar (Bhajans opened on its own)
function trackBottomBar() {
  const bar = document.querySelector('body > nav');
  if (!bar) return;
  const setH = () => document.documentElement.style.setProperty('--bar-h', `${bar.offsetHeight}px`);
  new ResizeObserver(setH).observe(bar);
  setH();
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
      // A grayed-out stanza's cue is grayed out too
      out.push([kind === 'muted' ? 'muted-refrain' : 'refrain', [cue(last)]]);
    }
  }
  return out.map(([kind, lines]) => [kind, lines]);
}

// Number each stanza of a bhajan (on its last line, shown at the right edge like the stotram verse numbers).
// Chorus repeats aren't stanzas, so refrain cues, chorus-only stanzas and repeats ("again") are skipped.
function numberStanzas(blocks) {
  let n = 0;
  return blocks.map(([kind, lines]) => (kind === 'text' || kind === 'muted') && lines.length
    ? [kind, [...lines.slice(0, -1), `${lines[lines.length - 1]} ⟦${++n}⟧`]]
    : [kind, lines]);
}

// Stotram verse numbers ("॥ 4 ॥" closing a verse) become right-edge counts
function verseNumbers(blocks) {
  return blocks.map(([kind, lines]) => [kind, lines.map(l => l.replace(/\s*॥\s*([\d०-९౦-౯೦-೯௦-௯൦-൯০-৯]+)\s*॥\s*$/, ' ⟦$1⟧'))]);
}

// A list picker: a sheet that slides up on phones, a centered dialog on wider screens.
// options: [{value, text}] ("3. Title" gets a number badge); onPick(value) runs when one is chosen.
// opener: the button that opened it (a bottom-bar or toolbar button); it stays above the dimmed page, shown pressed,
// and tapping it again closes the list. From the bottom bar, on phones the sheet rises from just above the bar.
// note is plain text; noteHtml is trusted markup (e.g. with an icon in it).
function openPicker({ title, options, current, onPick, listLang = '', returnFocus = null, opener = null, note = '', noteHtml = '', onClose = null }) {
  const back = document.createElement('div');
  back.className = 'picker-backdrop';
  const sheet = document.createElement('div');
  sheet.className = 'picker';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.innerHTML = `<div class="picker-grab"></div>
    <div class="picker-head"><span class="picker-title">${escapeHtml(title)}</span>
      <button type="button" class="picker-close" aria-label="Close">×</button></div>
    ${note || noteHtml ? `<p class="picker-note">${noteHtml || escapeHtml(note)}</p>` : ''}
    <div class="picker-list" lang="${listLang}">${options.map(o => {
      const m = o.text.match(/^(\d+)\.\s*(.*)$/);
      return `<button type="button" class="picker-opt${o.value === current ? ' on' : ''}" data-v="${escapeHtml(o.value)}">
        ${m ? `<span class="picker-num">${m[1]}</span><span>${escapeHtml(m[2])}</span>` : `<span>${escapeHtml(o.text)}</span>`}
        <span class="picker-tick" aria-hidden="true">✓</span></button>`;
    }).join('')}</div>`;
  const bar = opener?.closest('nav');
  const holder = bar || opener?.closest('#topBar');  // kept above the backdrop so the pressed button shows
  if (opener) {
    holder?.classList.add('picker-bar');
    opener.classList.add('picker-opener');
  }
  if (bar) {
    sheet.classList.add('from-bar');
    sheet.style.setProperty('--bar-h', `${bar.offsetHeight}px`);
  }
  document.body.append(back, sheet);
  requestAnimationFrame(() => { back.classList.add('open'); sheet.classList.add('open'); });
  sheet.querySelector('.on')?.scrollIntoView({ block: 'center' });
  const onKey = e => { if (e.key === 'Escape') close(); };
  const close = () => {
    document.removeEventListener('keydown', onKey);
    back.classList.remove('open');
    sheet.classList.remove('open');
    setTimeout(() => { back.remove(); sheet.remove(); }, 230);
    holder?.classList.remove('picker-bar');
    opener?.classList.remove('picker-opener');
    if (opener) opener.closePicker = null;
    returnFocus?.focus({ preventScroll: true });
    onClose?.();
  };
  document.addEventListener('keydown', onKey);
  if (opener) opener.closePicker = close;  // tapping the lit-up button again closes it
  back.onclick = close;
  sheet.querySelector('.picker-close').onclick = close;
  sheet.querySelectorAll('.picker-opt').forEach(b => b.onclick = () => { close(); onPick(b.dataset.v); });
}

// Toolbar dropdowns open the picker; the <select> stays the source of truth (picking sets it and fires "change")
function setupPickers() {
  const titleFor = (select) => {
    const lang = document.documentElement.lang || 'en';
    const t = { langPicker: UI.language, stepPicker: UI.puja, sectionJump: UI.sections, bhajanJump: UI.bhajans }[select.id];
    return t ? (t[lang] || t.en).replace(/…$/, '') : '';
  };
  const open = (select, focusEl = select, opener = null) => openPicker({
    title: titleFor(select),
    options: [...select.options].filter(o => o.value !== '').map(o => ({ value: o.value, text: o.text })),
    current: select.value,
    listLang: select.id === 'langPicker' ? '' : document.documentElement.lang,
    returnFocus: focusEl,
    opener,
    onPick: v => { select.value = v; select.dispatchEvent(new Event('change', { bubbles: true })); },
  });
  ['langPicker', 'stepPicker', 'sectionJump', 'bhajanJump'].forEach(id => {
    const select = document.getElementById(id);
    if (!select) return;
    select.addEventListener('mousedown', e => { e.preventDefault(); open(select); });
    select.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(select); } });
  });
  // The globe button opens the language list (its select is hidden), shown pressed while it's open
  const langBtn = document.getElementById('langBtn');
  const langPicker = document.getElementById('langPicker');
  if (langBtn && langPicker) langBtn.addEventListener('click', () => {
    if (langBtn.closePicker) langBtn.closePicker();
    else open(langPicker, langBtn, langBtn);
  });
}

// First visit to a reader page (no saved language, none in the link): open the language list right away.
// Closing it without picking keeps the current language, and that's saved too, so it only asks once.
function promptLanguageIfUnset() {
  const picker = document.getElementById('langPicker');
  if (!picker || Prefs.get('pujaLang') || new URLSearchParams(location.search).get('lang')) return;
  openPicker({
    title: 'Choose your language',
    noteHtml: 'Your choice is saved on this device for every puja and bhajan. Change it anytime with the '
      + '<svg class="inline-block w-4 h-4 align-[-0.15em]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></svg>'
      + ' button at the top.',
    options: Object.keys(LANG_LABELS).map(code => ({ value: code, text: LANG_LABELS[code] })),
    current: initialLang(),
    returnFocus: document.getElementById('langBtn'),
    opener: document.getElementById('langBtn'),  // lights up the globe, so people see where to change it later
    onPick: v => { picker.value = v; picker.dispatchEvent(new Event('change', { bubbles: true })); },
    onClose: () => { if (!Prefs.get('pujaLang')) Prefs.set('pujaLang', initialLang()); },
  });
}
