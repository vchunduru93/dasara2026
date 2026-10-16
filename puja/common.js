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

// Render a text's blocks; returns [{id, label}] for its section headings
function renderBlocks(blocks, idPrefix) {
  const headings = [];
  const html = blocks.map(([kind, lines]) => {
    const text = lines.map(l => `<span class="line">${escapeHtml(l)}</span>`).join('');
    if (kind === 'heading') {
      const id = `${idPrefix}-s${headings.length}`;
      headings.push({ id, label: lines[0].replace(/[:\s]+$/, '') });
      return `<h3 id="${id}" class="p-heading">${text}</h3>`;
    }
    return `<div class="p-${kind}">${text}</div>`;
  }).join('');
  return { html, headings };
}

function langOptions(lang) {
  return Object.keys(LANG_LABELS)
    .map(code => `<option value="${code}"${code === lang ? ' selected' : ''}>${LANG_LABELS[code]}</option>`).join('');
}

function setupTextSize(target) {
  let scale = parseFloat(Prefs.get('pujaScale')) || 1;
  const apply = () => target.style.setProperty('--scale', scale);
  document.getElementById('sizeUp').onclick = () => { scale = Math.min(1.6, +(scale + 0.1).toFixed(1)); Prefs.set('pujaScale', scale); apply(); };
  document.getElementById('sizeDown').onclick = () => { scale = Math.max(0.8, +(scale - 0.1).toFixed(1)); Prefs.set('pujaScale', scale); apply(); };
  apply();
}

function setUrlParams(params) {
  const url = new URL(location.href);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  history.replaceState(null, '', url);
}
