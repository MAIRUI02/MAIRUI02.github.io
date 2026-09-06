(() => {
  const inWorksDir = /\/works\/work-\d+\.html$/i.test(location.pathname);
  const root = inWorksDir ? "../" : "./";
  const mappingUrl = root + "new-cover-mapping.json";
  const overridesUrl = root + "cover-overrides.json";
  const coverDir = root + "assets/covers/";
  const cacheKey = Date.now().toString();

  function workIdFromHref(href) {
    const match = (href || "").match(/work-(\d+)\.html/i);
    return match ? "work-" + match[1] : null;
  }

  function applyCrop(img, override) {
    if (!img || !override) return;
    const x = Number.isFinite(Number(override.x)) ? Number(override.x) : 50;
    const y = Number.isFinite(Number(override.y)) ? Number(override.y) : 50;
    const zoom = Number.isFinite(Number(override.zoom)) ? Number(override.zoom) : 100;
    img.style.objectPosition = x + "% " + y + "%";
    img.style.transformOrigin = x + "% " + y + "%";
    img.style.transform = "scale(" + (zoom / 100) + ")";
  }

  function setCover(cover, workId, entry, override) {
    if (!cover || !entry || !entry.file) return;
    let img = cover.querySelector("img");
    if (!img) {
      cover.innerHTML = "";
      img = document.createElement("img");
      img.alt = workId + " 封面";
      cover.appendChild(img);
    }
    img.src = coverDir + encodeURIComponent(entry.file) + "?v=" + cacheKey;
    img.loading = "lazy";
    applyCrop(img, override);
    cover.classList.remove("fallback");
    cover.classList.add("verified");
    cover.dataset.coverMapping = "true";
  }

  function applyCards(mapping, overrides) {
    document.querySelectorAll('a[href*="work-"][href$=".html"]').forEach(link => {
      const workId = workIdFromHref(link.getAttribute("href"));
      if (!workId || !mapping[workId]) return;
      const card = link.closest(".card") || link;
      setCover(card.querySelector(".cover"), workId, mapping[workId], overrides[workId]);
    });
  }

  function applyDetail(mapping, overrides) {
    const match = location.pathname.match(/\/(work-\d+)\.html$/i);
    if (!match || !mapping[match[1]]) return;
    setCover(document.querySelector(".work-head .cover"), match[1], mapping[match[1]], overrides[match[1]]);
  }

  async function fetchJson(url, fallback = {}) {
    try {
      const response = await fetch(url + "?v=" + cacheKey, { cache: "no-store" });
      if (!response.ok) return fallback;
      return await response.json();
    } catch (_) {
      return fallback;
    }
  }

  async function init() {
    const [mapping, overrides] = await Promise.all([
      fetchJson(mappingUrl, {}),
      fetchJson(overridesUrl, {})
    ]);
    applyCards(mapping, overrides);
    applyDetail(mapping, overrides);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/* Repo badges: generated from the original Notion database's Repo URL property. */
(() => {
  if (window.__archiveRepoBadges) return;
  window.__archiveRepoBadges = true;
  const scriptUrl = document.currentScript?.src || new URL('cover-mapping.js', location.href).href;
  const mappingUrl = new URL('repo-mapping.json', scriptUrl);

  function apply(mapping) {
    if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) return;
    const style = document.createElement('style');
    style.textContent = `
      .card.repo-marked .card-link { position: relative; display: block; }
      .card.repo-marked .card-body { padding-bottom: 48px !important; }
      .card .repo-badge { position: absolute; right: 14px; bottom: 12px;
        display: inline-block; padding: 3px 8px; border: 1px solid #b98b42;
        background: #302016; color: #ffe0a0; font: 600 12px/1.4 Georgia, serif;
        letter-spacing: .08em; white-space: nowrap; pointer-events: none; }
    `;
    document.head.appendChild(style);
    function markCards() {
      document.querySelectorAll('.card .card-link[href]').forEach(link => {
        const id = new URL(link.getAttribute('href'), location.href).pathname.match(/\/(work-\d+)\.html$/i)?.[1];
        const entry = id && mapping[id];
        if (!entry || typeof entry.url !== 'string' || !/^https?:\/\//i.test(entry.url)) return;
        if (link.querySelector('.repo-badge')) return;
        const badge = document.createElement('span');
        badge.className = 'repo-badge';
        badge.textContent = '【repo】';
        badge.title = '已写 Repo';
        badge.setAttribute('aria-label', '已写 Repo');
        link.closest('.card').classList.add('repo-marked');
        link.appendChild(badge);
      });
    }
    markCards();
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      queueMicrotask(() => { queued = false; markCards(); });
    }).observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
  }
  async function init() {
    try {
      const response = await fetch(mappingUrl, { cache: 'no-store' });
      if (!response.ok) throw Error('HTTP ' + response.status);
      apply(await response.json());
    } catch (error) { console.warn('Repo 标记加载失败：', error); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
