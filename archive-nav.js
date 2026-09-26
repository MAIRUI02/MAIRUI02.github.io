document.addEventListener('DOMContentLoaded', () => {
  const inWorksDir = /\/works\/work-\d+\.html$/i.test(location.pathname);
  const root = inWorksDir ? '../' : './';

  // 确保全局样式存在
  if (!document.querySelector('link[href*="favorites.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = root + 'favorites.css';
    document.head.appendChild(link);
  }
  if (!document.querySelector('link[href*="random-draw-modal.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = root + 'random-draw-modal.css';
    document.head.appendChild(link);
  }
  if (!document.querySelector('link[href*="search-autocomplete.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = root + 'search-autocomplete.css';
    document.head.appendChild(link);
  }

  // 确保脚本加载
  if (!window.ArchiveFavorites && !document.querySelector('script[src*="favorites.js"]')) {
    const s = document.createElement('script');
    s.src = root + 'favorites.js';
    document.body.appendChild(s);
  }
  if (!window.ArchivePosterGenerator && !document.querySelector('script[src*="poster-generator.js"]')) {
    const ps = document.createElement('script');
    ps.src = root + 'poster-generator.js';
    document.body.appendChild(ps);
  }
  if (!window.PIXEL_NAV_BADGES && !document.querySelector('script[src*="pixel-badges.js"]')) {
    const pbs = document.createElement('script');
    pbs.src = root + 'pixel-badges.js';
    pbs.onload = () => applyPixelBadges();
    document.body.appendChild(pbs);
  }
  if (!document.querySelector('script[src*="random-draw-modal.js"]')) {
    const rs = document.createElement('script');
    rs.src = root + 'random-draw-modal.js';
    document.body.appendChild(rs);
  }
  if (!document.querySelector('script[src*="search-autocomplete.js"]')) {
    const as = document.createElement('script');
    as.src = root + 'search-autocomplete.js';
    document.body.appendChild(as);
  }

  // 导航栏减量合并与心选入口注入
  const nav = document.querySelector('.archive-nav');
  if (nav) {
    // 移除独立的“抽一部”以精简导航栏数量（已整合至搜索与探索）
    nav.querySelector('[data-nav-key="draw"]')?.remove();

    if (!nav.querySelector('[data-nav-key="favorites"]')) {
      const searchItem = nav.querySelector('[data-nav-key="search"]');
      const favLink = document.createElement('a');
      favLink.className = 'archive-nav__link';
      favLink.dataset.navKey = 'favorites';
      favLink.dataset.tooltip = '我的收藏';
      favLink.setAttribute('aria-label', '我的收藏');
      favLink.href = root + 'favorites.html';
      favLink.innerHTML = '<b class="archive-nav__icon" aria-hidden="true"></b><span class="archive-nav__label">我的收藏</span><span class="archive-nav__fav-count" hidden>0</span>';
      if (searchItem) {
        nav.insertBefore(favLink, searchItem);
      } else {
        nav.appendChild(favLink);
      }
    }
  }

  function applyPixelBadges() {
    if (window.setNavTheme) {
      const stored = localStorage.getItem('archive_nav_theme_choice') || 'pixel_rpg';
      window.setNavTheme(stored);
      return;
    }
    const badges = window.PIXEL_NAV_BADGES || {};
    document.querySelectorAll('[data-nav-key]').forEach(item => {
      const key = item.dataset.navKey;
      const svg = badges[key];
      const iconEl = item.querySelector('.archive-nav__icon');
      if (iconEl && svg) {
        iconEl.innerHTML = svg;
      }
    });
  }

  const navConfig = window.ARCHIVE_NAV || {};
  document.querySelectorAll('[data-nav-key]').forEach(item => {
    const key = item.dataset.navKey;
    const setting = navConfig[key];
    if (!setting) return;
    const label = item.dataset.tooltip || setting.label || '导航';
    item.querySelector('.archive-nav__label').textContent = label;
    item.setAttribute('aria-label', label);
  });

  applyPixelBadges();
  // 延时再次确认，防止异步脚本渲染延迟
  setTimeout(applyPixelBadges, 100);

  const search = document.getElementById('search');
  const view = document.body.dataset.archiveView;
  if (search && view === 'hp') { search.value = 'HP'; search.dispatchEvent(new Event('input', {bubbles:true})); }
  if (search && view === 'celebrity') { search.value = '真人区'; search.dispatchEvent(new Event('input', {bubbles:true})); }
  if (new URLSearchParams(location.search).has('search')) setTimeout(() => search?.focus(), 100);

  document.querySelectorAll('[data-archive-filter]').forEach(link => link.addEventListener('click', () => {
    if (!search) return;
    search.value = link.dataset.archiveFilter;
    search.dispatchEvent(new Event('input', {bubbles:true}));
  }));

  document.querySelector('[data-archive-draw]')?.addEventListener('click', () => {
    if (window.openRandomDrawModal) {
      window.openRandomDrawModal();
    } else {
      const randomBtn = document.querySelector('[data-prompt="__random__"]') || document.getElementById('random');
      randomBtn?.click();
    }
  });

  document.querySelector('[data-archive-search]')?.addEventListener('click', () => setTimeout(() => search?.focus(), 350));

  // 馆主专属快捷键：Ctrl + Shift + A (Mac: Cmd + Shift + A) 快速开启馆主工作台
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      const inWorksDir = /\/works\/work-\d+\.html$/i.test(location.pathname);
      const root = inWorksDir ? '../' : './';
      location.href = root + 'studio.html';
    }
  });
});
