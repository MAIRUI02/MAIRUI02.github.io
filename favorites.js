/**
 * VISITOR'S FAVORITES & KEEPSAKE MANAGER (访客心选清单系统)
 * Pure Client-side LocalStorage Persistence + Slide Drawer + Standalone Page
 * 《閲読器作品記録》
 */
(() => {
  const STORAGE_KEY = 'archive_visitor_favorites';
  const inWorksDir = /\/works\/work-\d+\.html$/i.test(location.pathname);
  const root = inWorksDir ? '../' : './';

  // 确保全局数据 works-data.js 在需要时加载
  if (!window.WORKS && !window.WORKS_DATA && !document.querySelector('script[data-works-data-loader]')) {
    const s = document.createElement('script');
    s.src = root + 'works-data.js';
    s.dataset.worksDataLoader = '1';
    document.head.appendChild(s);
  }

  // 确保海报生成器 poster-generator.js 在需要时加载
  if (!window.ArchivePosterGenerator && !document.querySelector('script[data-poster-generator-loader]')) {
    const s = document.createElement('script');
    s.src = root + 'poster-generator.js';
    s.dataset.posterGeneratorLoader = '1';
    document.head.appendChild(s);
  }

  // 1. 本地存储存取逻辑
  function getFavoritesMap() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn('读取本地收藏失败', e);
      return {};
    }
  }

  function saveFavoritesMap(map) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
      window.dispatchEvent(new CustomEvent('archive:favorites:changed', { detail: map }));
    } catch (e) {
      console.warn('保存本地收藏失败', e);
    }
  }

  function getFavoritesList() {
    const map = getFavoritesMap();
    return Object.values(map).sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
  }

  function isFavorited(id) {
    if (!id) return false;
    const map = getFavoritesMap();
    return Boolean(map[id]);
  }

  function findWorkMeta(id) {
    const list = window.WORKS || window.WORKS_DATA || window.STORY_SEARCH || [];
    return list.find(w => w.id === id) || null;
  }

  function toggleFavorite(id, fallbackData = {}) {
    if (!id) return false;
    const map = getFavoritesMap();
    let nowFavorited = false;

    if (map[id]) {
      delete map[id];
      nowFavorited = false;
      showToast('已从心选清单中移除');
    } else {
      const meta = findWorkMeta(id) || {};
      map[id] = {
        id,
        name: fallbackData.name || meta.name || id,
        platform: fallbackData.platform || meta.platform || '未知平台',
        status: fallbackData.status || meta.status || '',
        rating: fallbackData.rating || meta.rating || '',
        tags: fallbackData.tags || meta.tags || [],
        characters: fallbackData.characters || meta.characters || '',
        addedAt: Date.now()
      };
      nowFavorited = true;
      showToast('已加入心选清单');
    }

    saveFavoritesMap(map);
    updateAllUI();
    return nowFavorited;
  }

  function clearAllFavorites() {
    if (confirm('确定要清空这台设备上的所有收藏记录吗？此操作无法撤销。')) {
      saveFavoritesMap({});
      showToast('已清空全部心选收藏');
      updateAllUI();
    }
  }

  // 2. 轻巧手账纸质 Toast 提示
  let toastEl = null;
  let toastTimeout = null;
  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'archive-fav-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = `<span>${msg}</span>`;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastEl.classList.remove('is-show');
    }, 2200);
  }

  // 3. 导航栏角标与入口绑定
  function updateNavBadge() {
    const count = Object.keys(getFavoritesMap()).length;
    document.querySelectorAll('[data-nav-key="favorites"]').forEach(item => {
      let badge = item.querySelector('.archive-nav__fav-count');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'archive-nav__fav-count';
        item.appendChild(badge);
      }
      const prev = badge.textContent;
      badge.textContent = count > 99 ? '99+' : count;
      badge.hidden = count === 0;

      if (count > 0 && prev !== badge.textContent) {
        badge.classList.remove('is-bumped');
        void badge.offsetWidth;
        badge.classList.add('is-bumped');
      }

      item.setAttribute('data-tooltip', `我的收藏 (${count})`);
      item.setAttribute('aria-label', `我的收藏 (${count})`);
    });
  }

  // 4. 自动在页面各卡片注入心形收藏按钮
  function workIdFromHref(href) {
    if (!href) return null;
    const match = href.match(/work-(\d+)\.html/i);
    return match ? 'work-' + match[1] : null;
  }

  function setupCardButtons() {
    // 适配所有卡片：.card 或者包裹链接
    const cards = document.querySelectorAll('.card, [data-work-card]');
    cards.forEach(card => {
      if (card.querySelector('.archive-fav-btn')) return;

      const link = card.querySelector('a[href*="work-"]') || (card.tagName === 'A' && card.getAttribute('href')?.includes('work-') ? card : null);
      if (!link) return;
      const href = link.getAttribute('href') || '';
      const workId = card.dataset.workId || workIdFromHref(href);
      if (!workId) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'archive-fav-btn';
      btn.dataset.workId = workId;
      btn.setAttribute('aria-label', '收藏此作品');
      btn.setAttribute('title', '加入心选收藏');
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      `;

      if (isFavorited(workId)) {
        btn.classList.add('is-favorited');
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('title', '已在心选中，点击取消');
      } else {
        btn.setAttribute('aria-pressed', 'false');
      }

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // 提取卡片内数据作为 fallback
        const name = card.querySelector('h3, h4')?.textContent?.trim() || '';
        const eyebrow = card.querySelector('.eyebrow')?.textContent?.trim() || '';
        const platform = eyebrow.split('·')[0]?.trim() || '';
        const status = eyebrow.split('·')[1]?.trim() || '';
        const rating = card.querySelector('.stars')?.textContent?.trim() || '';
        const tags = Array.from(card.querySelectorAll('.chips span')).map(s => s.textContent.trim());

        const active = toggleFavorite(workId, { name, platform, status, rating, tags });
        btn.classList.toggle('is-favorited', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        btn.setAttribute('title', active ? '已在心选中，点击取消' : '加入心选收藏');
      });

      card.appendChild(btn);
    });

    // 作品详情页特别注入
    const detailHead = document.querySelector('.work-head > div:last-child');
    if (detailHead && !document.querySelector('.detail-fav-action')) {
      const match = location.pathname.match(/\/(work-\d+)\.html$/i);
      if (match) {
        const workId = match[1];
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'detail-fav-action';
        btn.dataset.workId = workId;

        const syncDetailBtn = () => {
          const fav = isFavorited(workId);
          btn.classList.toggle('is-favorited', fav);
          btn.innerHTML = `
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span>${fav ? '已在心选清单' : '加入心选'}</span>
          `;
        };
        syncDetailBtn();

        btn.addEventListener('click', () => {
          const title = document.querySelector('.work-head h1')?.textContent?.trim() || workId;
          const rating = document.querySelector('.work-head .stars')?.textContent?.trim() || '';
          const tags = Array.from(document.querySelectorAll('.work-head .chips span')).map(s => s.textContent.trim());
          toggleFavorite(workId, { name: title, rating, tags });
          syncDetailBtn();
        });

        detailHead.appendChild(btn);
      }
    }
  }

  function syncAllCardStates() {
    document.querySelectorAll('.archive-fav-btn').forEach(btn => {
      const id = btn.dataset.workId;
      const fav = isFavorited(id);
      btn.classList.toggle('is-favorited', fav);
      btn.setAttribute('aria-pressed', fav ? 'true' : 'false');
      btn.setAttribute('title', fav ? '已在心选中，点击取消' : '加入心选收藏');
    });
    const detailBtn = document.querySelector('.detail-fav-action');
    if (detailBtn) {
      const id = detailBtn.dataset.workId;
      const fav = isFavorited(id);
      detailBtn.classList.toggle('is-favorited', fav);
      const span = detailBtn.querySelector('span');
      if (span) span.textContent = fav ? '已在心选清单 ♥' : '收藏此作品 ♡';
    }
  }

  // 5. 侧滑抽屉 DOM 构造与渲染
  let drawerBackdrop = null;
  let drawerEl = null;

  function ensureDrawer() {
    if (drawerEl) return;

    drawerBackdrop = document.createElement('div');
    drawerBackdrop.className = 'fav-drawer-backdrop';
    drawerBackdrop.setAttribute('aria-hidden', 'true');

    drawerEl = document.createElement('aside');
    drawerEl.className = 'fav-drawer';
    drawerEl.id = 'archive-fav-drawer';
    drawerEl.setAttribute('aria-label', '访客心选档案抽屉');

    drawerEl.innerHTML = `
      <div class="fav-drawer__header">
        <div class="fav-drawer__title-wrap">
          <p class="fav-drawer__kicker">VISITOR'S PRIVATE KEEPSAKE</p>
          <h2 class="fav-drawer__title">
            <span>我的心选清单</span>
            <span class="fav-drawer__pill" id="fav-drawer-pill">0</span>
          </h2>
        </div>
        <button type="button" class="fav-drawer__close" id="fav-drawer-close" aria-label="关闭心选抽屉">✕</button>
      </div>
      <div class="fav-drawer__search-bar">
        <input type="search" class="fav-drawer__search-input" id="fav-drawer-search" placeholder="在心选中搜索作品名或标签..." aria-label="搜索心选">
      </div>
      <div class="fav-drawer__body" id="fav-drawer-body"></div>
      <div class="fav-drawer__footer">
        <div class="fav-drawer__btn-row">
          <a href="${root}favorites.html" class="fav-drawer__full-btn">查看完整心选清单页 ↗</a>
        </div>
        <div class="fav-drawer__btn-row">
          <button type="button" class="fav-drawer__copy-btn" id="fav-drawer-poster" style="background:#fff2f5;color:#c8426a;border-color:#f19db7;font-weight:700;">生成手账海报</button>
          <button type="button" class="fav-drawer__copy-btn" id="fav-drawer-copy">复制书单文本</button>
          <button type="button" class="fav-drawer__clear-btn" id="fav-drawer-clear">清空</button>
        </div>
      </div>
    `;

    document.body.appendChild(drawerBackdrop);
    document.body.appendChild(drawerEl);

    // 事件绑定
    drawerBackdrop.addEventListener('click', closeDrawer);
    drawerEl.querySelector('#fav-drawer-close').addEventListener('click', closeDrawer);
    drawerEl.querySelector('#fav-drawer-poster').addEventListener('click', () => {
      if (window.ArchivePosterGenerator) {
        window.ArchivePosterGenerator.openPosterModal();
      }
    });
    drawerEl.querySelector('#fav-drawer-copy').addEventListener('click', copyFavoritesAsText);
    drawerEl.querySelector('#fav-drawer-clear').addEventListener('click', clearAllFavorites);

    const searchInput = drawerEl.querySelector('#fav-drawer-search');
    searchInput.addEventListener('input', () => {
      renderDrawerList(searchInput.value.trim().toLowerCase());
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawerEl.classList.contains('is-open')) {
        closeDrawer();
      }
    });
  }

  function openDrawer() {
    ensureDrawer();
    renderDrawerList();
    drawerBackdrop.classList.add('is-open');
    drawerEl.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!drawerEl) return;
    drawerBackdrop.classList.remove('is-open');
    drawerEl.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function formatRelativeDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const m = d.getMonth() + 1;
    const date = d.getDate();
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${m}月${date}日 ${h}:${min}`;
  }

  function renderDrawerList(query = '') {
    if (!drawerEl) return;
    const list = getFavoritesList();
    const countEl = drawerEl.querySelector('#fav-drawer-pill');
    if (countEl) countEl.textContent = `${list.length} 部`;

    const body = drawerEl.querySelector('#fav-drawer-body');
    if (!body) return;

    const filtered = query
      ? list.filter(item => {
          const text = [item.name, item.platform, item.rating, ...(item.tags || [])].join(' ').toLowerCase();
          return text.includes(query);
        })
      : list;

    if (list.length === 0) {
      body.innerHTML = `
        <div class="fav-drawer__empty">
          <div class="fav-drawer__empty-icon">♡</div>
          <p class="fav-drawer__empty-text">
            你的心选书单目前空空如也~<br>
            浏览作品时，点亮卡片右上角的小粉心，就能收录在这里。
          </p>
          <a href="${root}works.html" class="fav-drawer__empty-btn">去逛逛作品一览 →</a>
        </div>
      `;
      return;
    }

    if (filtered.length === 0) {
      body.innerHTML = `
        <div class="fav-drawer__empty">
          <p class="fav-drawer__empty-text">未检索到与 “${query}” 相关的心选作品。</p>
        </div>
      `;
      return;
    }

    body.innerHTML = filtered.map(item => {
      const coverSrc = `${root}assets/covers/${item.id}.png`;
      const fallbackSrc = `${root}assets/covers/${item.id}.jpg`;
      const detailUrl = `${root}works/${item.id}.html`;
      const tagsStr = (item.tags || []).slice(0, 3).join(' · ');

      return `
        <div class="fav-item" data-work-id="${item.id}">
          <a href="${detailUrl}" class="fav-item__thumb-link">
            <img class="fav-item__thumb-img" src="${coverSrc}" alt="${item.name}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackSrc}';this.onerror=function(){this.style.opacity='0.4';}">
          </a>
          <div class="fav-item__content">
            <p class="fav-item__eyebrow">
              <span>${item.platform || '同人'}</span>
              ${item.status ? `<span>· ${item.status}</span>` : ''}
            </p>
            <h4 class="fav-item__title">
              <a href="${detailUrl}">${item.name}</a>
            </h4>
            <div class="fav-item__meta">
              ${item.rating ? `<span class="fav-item__stars">${item.rating}</span>` : ''}
              ${tagsStr ? `<span class="fav-item__tags">${tagsStr}</span>` : ''}
              <span class="fav-item__date">${formatRelativeDate(item.addedAt)}</span>
            </div>
          </div>
          <button type="button" class="fav-item__remove-btn" title="从心选中移除" data-remove-id="${item.id}" aria-label="移除 ${item.name}">✕</button>
        </div>
      `;
    }).join('');

    // 绑定移除按钮
    body.querySelectorAll('[data-remove-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.removeId;
        toggleFavorite(id);
      });
    });
  }

  // 6. 复制书单为优雅纯文本
  function copyFavoritesAsText() {
    const list = getFavoritesList();
    if (list.length === 0) {
      showToast('当前还没有收藏任何作品哦');
      return;
    }
    const lines = [
      '★ 《閲読器作品記録》· 访客心选书单 ★',
      `共收录 ${list.length} 部作品 · 导出时间：${new Date().toLocaleDateString()}`,
      '----------------------------------------'
    ];
    list.forEach((item, idx) => {
      const parts = [
        `${idx + 1}. ${item.name}`,
        item.platform ? `[${item.platform}]` : '',
        item.rating || '',
        (item.tags || []).slice(0, 3).join('/')
      ].filter(Boolean);
      lines.push(parts.join(' '));
    });
    lines.push('----------------------------------------');

    const text = lines.join('\n');
    navigator.clipboard?.writeText(text).then(() => {
      showToast('已复制完整心选书单到剪贴板');
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('已复制完整心选书单到剪贴板');
    });
  }

  // 7. 导出与导入 JSON 备份
  function exportFavoritesJson() {
    const map = getFavoritesMap();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(map, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `archive-favorites-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('已导出心选备份文件');
  }

  function importFavoritesJson(fileInput) {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (typeof imported !== 'object') throw new Error('格式不符合');
        const current = getFavoritesMap();
        const merged = { ...current, ...imported };
        saveFavoritesMap(merged);
        showToast(`成功恢复 ${Object.keys(imported).length} 条收藏记录`);
        updateAllUI();
      } catch (err) {
        alert('导入失败：文件格式不正确，请选择有效的备份 JSON 文件。');
      }
    };
    reader.readAsText(file);
    fileInput.value = '';
  }

  // 8. 全局 UI 统一更新
  function updateAllUI() {
    updateNavBadge();
    syncAllCardStates();
    if (drawerEl && drawerEl.classList.contains('is-open')) {
      const searchInput = drawerEl.querySelector('#fav-drawer-search');
      renderDrawerList(searchInput ? searchInput.value.trim().toLowerCase() : '');
    }
    // 如果当前就是 favorites.html，重新渲染主页内容
    if (document.body.dataset.archiveView === 'favorites' && window.renderFavoritesPage) {
      window.renderFavoritesPage();
    }
  }

  // 9. 监听跨标签页同步
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      updateAllUI();
    }
  });

  window.addEventListener('archive:favorites:changed', () => {
    updateAllUI();
  });

  // 10. 初始化与动态监视
  function initFavorites() {
    setupCardButtons();
    updateNavBadge();

    // 绑定导航栏入口点击呼出抽屉
    document.querySelectorAll('[data-nav-key="favorites"]').forEach(item => {
      if (item.dataset.hasDrawerBound) return;
      item.dataset.hasDrawerBound = '1';
      item.addEventListener('click', (e) => {
        // 如果是按住 Ctrl/Cmd 点击则允许打开独立标签页，普通点击滑出抽屉
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
          e.preventDefault();
          openDrawer();
        }
      });
    });

    // 监听后续动态添加的卡片（如搜索结果异步渲染、Tab 切换）
    if (!window.__favCardObserver) {
      const observer = new MutationObserver(() => {
        setupCardButtons();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      window.__favCardObserver = observer;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFavorites);
  } else {
    initFavorites();
  }
  // 额外延迟触发一次防止复杂单页或动态异步脚本渲染
  setTimeout(setupCardButtons, 200);

  // 挂载全局公共 API，供独立清单页及调试使用
  window.ArchiveFavorites = {
    getFavoritesList,
    getFavoritesMap,
    isFavorited,
    toggleFavorite,
    clearAllFavorites,
    openDrawer,
    closeDrawer,
    copyFavoritesAsText,
    exportFavoritesJson,
    importFavoritesJson,
    updateAllUI
  };
})();
