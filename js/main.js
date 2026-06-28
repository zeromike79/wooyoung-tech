// main.js — Interactions & Animations

const PAGE = (() => {
  const p = location.pathname.split('/').pop() || 'index.html';
  if (p === 'products.html') return 'products';
  if (p === 'solutions.html') return 'solutions';
  if (p === 'about.html') return 'about';
  if (p === 'contact.html') return 'contact';
  if (p === 'faq.html') return 'faq';
  if (p === 'news.html') return 'news';
  return 'home';
})();

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  // Sub-pages: header always shows white (no fullscreen hero)
  if (PAGE !== 'home') {
    document.getElementById('main-header')?.classList.add('scrolled');
  }

  initScrollAnimations();
  initCounters();
  initSmoothScroll();

  if (PAGE === 'home') {
    initHeroSlider();
    initCoolFog();
    initSolutionCards();
  }
  if (PAGE === 'products') {
    initProducts();
    initProductModal();
  }
  if (PAGE === 'solutions') {
    initSolutionCards();
  }
  if (PAGE === 'faq') {
    initFaq();
  }
});

// ── Hero Slider ───────────────────────────────────────────────────────────────
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dotsEl = document.getElementById('hero-dots');
  const prevBtn = document.getElementById('hero-prev');
  const nextBtn = document.getElementById('hero-next');
  if (!slides.length || !dotsEl) return;

  let cur = 0;
  let timer;
  const INTERVAL = 6000;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'hero-dot' + (i === 0 ? ' hero-dot--active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function videoOf(slide) { return slide.querySelector('video'); }

  function goTo(idx) {
    const prevVid = videoOf(slides[cur]);
    if (prevVid) prevVid.pause();

    slides[cur].classList.remove('hero-slide--active');
    dotsEl.children[cur].classList.remove('hero-dot--active');
    cur = (idx + slides.length) % slides.length;
    slides[cur].classList.add('hero-slide--active');
    dotsEl.children[cur].classList.add('hero-dot--active');

    const nextVid = videoOf(slides[cur]);
    if (nextVid) { nextVid.currentTime = 0; nextVid.play(); }

    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(cur + 1), INTERVAL);
  }

  prevBtn?.addEventListener('click', () => goTo(cur - 1));
  nextBtn?.addEventListener('click', () => goTo(cur + 1));

  resetTimer();
}

// ── FAQ Accordion ─────────────────────────────────────────────────────────────
function initFaq() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all items in the same category
      item.closest('.faq-list').querySelectorAll('.faq-item.open').forEach(el => {
        el.classList.remove('open');
        el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

// ── Catalog map: category × language → PDF path ──────────────────────────────
const CATALOG_MAP = {
  general: {
    en: 'downloads/catalog_en.pdf',
    ko: 'downloads/catalog_en.pdf',
    ja: 'downloads/catalog_ja.pdf',
    zh: 'downloads/catalog_zh.pdf',
  },
  cooling: {
    en: 'downloads/coolfog_en.pdf',
    ko: 'downloads/coolfog_en.pdf',
    ja: 'downloads/coolfog_ja.pdf',
    zh: 'downloads/coolfog_zh.pdf',
  },
};

function getCatalogUrl(category, lang) {
  const map = (category === 'cooling') ? CATALOG_MAP.cooling : CATALOG_MAP.general;
  return map[lang] || map.en;
}

// ── Product Modal ─────────────────────────────────────────────────────────────
function initProductModal() {
  const overlay  = document.getElementById('product-modal');
  const closeBtn = document.getElementById('modal-close');
  const prevBtn  = document.getElementById('modal-prev');
  const nextBtn  = document.getElementById('modal-next');
  const counter  = document.getElementById('modal-nav-counter');
  if (!overlay) return;

  let _list = [];
  let _idx  = 0;

  const close = () => {
    overlay.hidden = true;
    document.body.style.overflow = '';
  };

  const navigate = (dir) => {
    const newIdx = _idx + dir;
    if (newIdx < 0 || newIdx >= _list.length) return;
    openModal(_list[newIdx], _list, newIdx);
  };

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
    if (!overlay.hidden) {
      if (e.key === 'ArrowLeft')  navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    }
  });
  if (prevBtn) prevBtn.addEventListener('click', () => navigate(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => navigate(1));

  function openModal(product, list, idx) {
    _list = list || [product];
    _idx  = (idx != null) ? idx : 0;

    const lang = window.__currentLang || 'en';
    const data = i18n[lang] || i18n.en;

    const imgSrc = product.img
      ? `images/${product.img}`
      : `https://picsum.photos/seed/${product.imgSeed}/600/450`;

    document.getElementById('modal-img').src = imgSrc;
    document.getElementById('modal-img').alt = product.name[lang] || product.name.en;
    document.getElementById('modal-part-no').textContent = product.id;
    document.getElementById('modal-product-name').textContent = product.name[lang] || product.name.en;
    document.getElementById('modal-desc').textContent = product.desc[lang] || product.desc.en;

    const catalogBtn = document.getElementById('modal-catalog-btn');
    catalogBtn.href = getCatalogUrl(product.category, lang);
    catalogBtn.querySelector('[data-i18n]').textContent = data.modal_download_catalog || 'Download Catalog';

    overlay.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (data[key]) el.textContent = data[key];
    });

    if (prevBtn) prevBtn.disabled = _idx === 0;
    if (nextBtn) nextBtn.disabled = _idx === _list.length - 1;
    if (counter) counter.textContent = _list.length > 1 ? `${_idx + 1} / ${_list.length}` : '';

    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('modal-close').focus();
  }

  window.__openProductModal = openModal;
}

// ── Header scroll effect ──────────────────────────────────────────────────────
function initHeader() {
  const header = document.getElementById('main-header');
  const onScroll = () => {
    if (PAGE !== 'home') {
      // Sub-pages: always white regardless of scroll position
      header.classList.add('scrolled');
      return;
    }
    // Homepage: transparent at hero top, white when scrolled past 60px
    header.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── Mobile hamburger menu ─────────────────────────────────────────────────────
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');
  const overlay = document.getElementById('nav-overlay');

  if (!toggle || !nav) return;

  const close = () => {
    nav.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.classList.toggle('active', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    if (overlay) overlay.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  if (overlay) overlay.addEventListener('click', close);

  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
}

// ── Intersection Observer — fade + slide-up ───────────────────────────────────
function initScrollAnimations() {
  const targets = document.querySelectorAll('.animate-on-scroll');
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
    observer.observe(el);
  });
}

// ── Counter animation ─────────────────────────────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    const duration = 2000;
    const start = performance.now();
    const isFloat = String(target).includes('.');

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = easeOut(progress) * target;
      el.textContent = isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
}

// ── Solution cards — hover slide-up overlay ───────────────────────────────────
function initSolutionCards() {
  // Handled via CSS, but we ensure touch devices get a tap toggle
  const cards = document.querySelectorAll('.solution-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => { if (c !== card) c.classList.remove('hovered'); });
      card.classList.toggle('hovered');
    });
  });
}

// ── Cool-Fog featured section ─────────────────────────────────────────────────
function initCoolFog() {
  if (typeof coolFogFeature === 'undefined') return;
  renderCoolFog(window.__currentLang || 'en');
  const origHook = window.__applyLangHook;
  window.__applyCoolFogHook = renderCoolFog;
}

function renderCoolFog(lang) {
  if (typeof coolFogFeature === 'undefined') return;
  const data = i18n[lang] || i18n.en;
  const cf = coolFogFeature;

  // Update Cool-Fog section catalog button URL
  const cfCatalogBtn = document.querySelector('#coolfog a[href*="downloads"]');
  if (cfCatalogBtn) cfCatalogBtn.href = getCatalogUrl('cooling', lang);

  // Description
  const descEl = document.getElementById('cf-desc');
  if (descEl) descEl.textContent = cf.desc[lang] || cf.desc.en;

  // Research badge
  const resEl = document.getElementById('cf-research');
  if (resEl) resEl.textContent = cf.research[lang] || cf.research.en;

  // Stats
  const statsEl = document.getElementById('cf-stats');
  if (statsEl) {
    statsEl.innerHTML = cf.stats.map(s => `
      <div class="cf-stat-item">
        <span class="cf-stat-value">${s.value}</span>
        <span class="cf-stat-label">${data[s.labelKey] || s.labelKey}</span>
      </div>`).join('');
  }

  // Apps
  const appsEl = document.getElementById('cf-apps');
  if (appsEl) {
    appsEl.innerHTML = cf.apps.map(a => `
      <span class="cf-app-pill">
        <i class="fa-solid ${a.iconClass}"></i>
        ${data[a.labelKey] || a.labelKey}
      </span>`).join('');
  }
}

// ── Product catalog: filter + pagination ─────────────────────────────────────
function initProducts() {
  const grid = document.getElementById('products-grid');
  const tabsWrap = document.getElementById('product-filter-tabs');
  const paginationWrap = document.getElementById('product-pagination');
  if (!grid || !tabsWrap || !paginationWrap) return;

  // Pre-select category from URL param: products.html?cat=filters
  const urlCat = new URLSearchParams(location.search).get('cat');
  let activeCategory = (urlCat && productCategories.find(c => c.id === urlCat)) ? urlCat : 'all';
  let currentPage = 1;

  function getLang() { return window.__currentLang || 'en'; }

  function filtered() {
    if (activeCategory === 'all') return productsData;
    return productsData.filter(p => p.category === activeCategory);
  }

  function renderTabs() {
    const lang = getLang();
    const allCat = productCategories[0];
    const allCount = productsData.length;
    const restCats = productCategories.slice(1);

    // "All" wide button
    const allBtn = `
      <button class="cat-all-btn${activeCategory === 'all' ? ' active' : ''}"
              role="tab" aria-selected="${activeCategory === 'all'}" data-cat="all">
        <span class="cat-all-inner">
          <i class="fa-solid ${allCat.icon}"></i>
          <span>${allCat.label[lang] || allCat.label.en}</span>
        </span>
        <span class="cat-all-count">${allCount}</span>
      </button>`;

    // Category cards grid
    const cards = restCats.map(cat => {
      const count = productsData.filter(p => p.category === cat.id).length;
      const isActive = cat.id === activeCategory;
      return `
        <button class="cat-card${isActive ? ' active' : ''}"
                role="tab" aria-selected="${isActive}" data-cat="${cat.id}">
          <span class="cat-card-icon"><i class="fa-solid ${cat.icon}"></i></span>
          <span class="cat-card-name">${cat.label[lang] || cat.label.en}</span>
          <span class="cat-card-count">${count}</span>
        </button>`;
    }).join('');

    tabsWrap.innerHTML = allBtn + `<div class="cat-card-grid">${cards}</div>`;

    tabsWrap.querySelectorAll('[data-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.cat;
        currentPage = 1;
        render();
      });
    });
  }

  function renderGrid() {
    const lang = getLang();
    const items = filtered();
    const total = items.length;
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const page = items.slice(start, start + PRODUCTS_PER_PAGE);

    if (page.length === 0) {
      grid.innerHTML = `<p class="products-empty">No products found.</p>`;
      return;
    }

    grid.innerHTML = page.map(p => {
      const imgSrc = p.img
        ? `images/${p.img}`
        : `https://picsum.photos/seed/${p.imgSeed}/600/450`;
      const name = p.name[lang] || p.name.en;
      return `
      <article class="product-card animate-on-scroll visible" data-product-id="${p.id}" role="button" tabindex="0" style="cursor:pointer;">
        <div class="product-card-img">
          <img src="${imgSrc}" alt="${name}"
               loading="lazy" width="600" height="450"
               onerror="this.src='https://picsum.photos/seed/${p.imgSeed}/600/450'" />
        </div>
        <div class="product-card-body">
          <span class="product-cat-badge">${getCategoryLabel(p.category, lang)}</span>
          <h3>${name}</h3>
          <p>${p.desc[lang] || p.desc.en}</p>
          <span class="product-link">${(i18n[lang] || i18n.en).product_see_more}</span>
        </div>
      </article>`;
    }).join('');

    // Bind click → modal (pass full filtered list for prev/next navigation)
    grid.querySelectorAll('.product-card[data-product-id]').forEach(card => {
      const handler = () => {
        const pid = card.dataset.productId;
        const idx = items.findIndex(p => p.id === pid);
        if (idx !== -1 && window.__openProductModal) {
          window.__openProductModal(items[idx], items, idx);
        }
      };
      card.addEventListener('click', handler);
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handler(); });
    });
  }

  function getCategoryLabel(catId, lang) {
    const cat = productCategories.find(c => c.id === catId);
    return cat ? (cat.label[lang] || cat.label.en) : catId;
  }

  function renderPagination() {
    const total = filtered().length;
    const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);
    if (totalPages <= 1) { paginationWrap.innerHTML = ''; return; }

    const lang = getLang();
    let html = `<div class="pagination-info">${
      (currentPage - 1) * PRODUCTS_PER_PAGE + 1
    }–${Math.min(currentPage * PRODUCTS_PER_PAGE, total)} / ${total}</div>
    <div class="pagination-btns">`;

    html += `<button class="page-btn page-prev" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous page">
               <i class="fa-solid fa-chevron-left"></i>
             </button>`;

    // Show up to 5 page numbers
    const range = getPageRange(currentPage, totalPages);
    range.forEach(p => {
      if (p === '…') {
        html += `<span class="page-ellipsis">…</span>`;
      } else {
        html += `<button class="page-btn page-num${p === currentPage ? ' active' : ''}" data-page="${p}">${p}</button>`;
      }
    });

    html += `<button class="page-btn page-next" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next page">
               <i class="fa-solid fa-chevron-right"></i>
             </button>`;
    html += `</div>`;

    paginationWrap.innerHTML = html;

    paginationWrap.querySelector('.page-prev').addEventListener('click', () => {
      if (currentPage > 1) { currentPage--; render(); scrollToProducts(); }
    });
    paginationWrap.querySelector('.page-next').addEventListener('click', () => {
      if (currentPage < totalPages) { currentPage++; render(); scrollToProducts(); }
    });
    paginationWrap.querySelectorAll('.page-num').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = parseInt(btn.dataset.page);
        render();
        scrollToProducts();
      });
    });
  }

  function getPageRange(cur, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (cur <= 4) return [1, 2, 3, 4, 5, '…', total];
    if (cur >= total - 3) return [1, '…', total-4, total-3, total-2, total-1, total];
    return [1, '…', cur-1, cur, cur+1, '…', total];
  }

  function scrollToProducts() {
    const section = document.getElementById('products');
    if (!section) return;
    const headerH = document.getElementById('main-header')?.offsetHeight || 0;
    window.scrollTo({ top: section.offsetTop - headerH, behavior: 'smooth' });
  }

  function render() {
    renderTabs();
    renderGrid();
    renderPagination();
  }

  // Re-render on language change so labels update
  const origApplyLang = window.__applyLangHook;
  window.__applyLangHook = (lang) => {
    if (origApplyLang) origApplyLang(lang);
    render();
  };

  render();
}

// ── Smooth scroll for anchor links ───────────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const headerH = document.getElementById('main-header')?.offsetHeight || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}
