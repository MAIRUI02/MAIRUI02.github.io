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
