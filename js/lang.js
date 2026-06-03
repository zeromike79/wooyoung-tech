// lang.js — Language switching logic

const SUPPORTED_LANGS = ['en', 'ko', 'ja', 'zh'];
const DEFAULT_LANG = 'en';
const STORAGE_KEY = 'wyt_lang';

// Font class map per language
const FONT_CLASSES = {
  en: 'font-en',
  ko: 'font-ko',
  ja: 'font-ja',
  zh: 'font-zh',
};

function getInitialLang() {
  const params = new URLSearchParams(window.location.search);
  const urlLang = params.get('lang');
  if (urlLang && SUPPORTED_LANGS.includes(urlLang)) {
    localStorage.setItem(STORAGE_KEY, urlLang);
    return urlLang;
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  return DEFAULT_LANG;
}

function applyLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
  const data = i18n[lang];
  if (!data) return;

  // Apply font class
  const html = document.documentElement;
  SUPPORTED_LANGS.forEach(l => html.classList.remove(FONT_CLASSES[l]));
  html.classList.add(FONT_CLASSES[lang]);
  html.setAttribute('lang', lang);

  // Replace text nodes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (data[key] !== undefined) el.textContent = data[key];
  });

  // Replace placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (data[key] !== undefined) el.setAttribute('placeholder', data[key]);
  });

  // Replace alt attributes
  document.querySelectorAll('[data-i18n-alt]').forEach(el => {
    const key = el.getAttribute('data-i18n-alt');
    if (data[key] !== undefined) el.setAttribute('alt', data[key]);
  });

  // Replace title attributes
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (data[key] !== undefined) el.setAttribute('title', data[key]);
  });

  // Update lang selector UI if visible
  const selector = document.getElementById('lang-selector');
  if (selector) selector.value = lang;

  localStorage.setItem(STORAGE_KEY, lang);
  window.__currentLang = lang;

  // Notify product catalog and cool-fog section to re-render with new language
  if (typeof window.__applyLangHook === 'function') window.__applyLangHook(lang);
  if (typeof window.__applyCoolFogHook === 'function') window.__applyCoolFogHook(lang);
}

function initAdminLangUI() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('admin') !== '1') return;

  const langBar = document.getElementById('admin-lang-bar');
  if (langBar) {
    langBar.style.display = 'flex';
    const selector = document.getElementById('lang-selector');
    if (selector) {
      selector.value = window.__currentLang || DEFAULT_LANG;
      selector.addEventListener('change', e => applyLang(e.target.value));
    }
  }
}

function initLang() {
  const lang = getInitialLang();
  window.__currentLang = lang;
  applyLang(lang);
  initAdminLangUI();
}

document.addEventListener('DOMContentLoaded', initLang);
