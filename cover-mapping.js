(() => {
  const inWorksDir = /\/works\/work-\d+\.html$/i.test(location.pathname);
  const root = inWorksDir ? "../" : "./";
  const mappingUrl = root + "new-cover-mapping.json";
  const coverDir = root + "assets/covers/";
  const cacheKey = Date.now().toString();

  function workIdFromHref(href) {
    const match = (href || "").match(/work-(\d+)\.html/i);
    return match ? "work-" + match[1] : null;
  }

  function setCover(cover, workId, entry) {
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
    cover.classList.remove("fallback");
    cover.classList.add("verified");
    cover.dataset.coverMapping = "true";
  }

  function applyCards(mapping) {
    document.querySelectorAll('a[href*="work-"][href$=".html"]').forEach(link => {
      const workId = workIdFromHref(link.getAttribute("href"));
      if (!workId || !mapping[workId]) return;
      const card = link.closest(".card") || link;
      setCover(card.querySelector(".cover"), workId, mapping[workId]);
    });
  }

  function applyDetail(mapping) {
    const match = location.pathname.match(/\/(work-\d+)\.html$/i);
    if (!match || !mapping[match[1]]) return;
    setCover(document.querySelector(".work-head .cover"), match[1], mapping[match[1]]);
  }

  async function init() {
    try {
      const response = await fetch(mappingUrl + "?v=" + cacheKey, { cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const mapping = await response.json();
      applyCards(mapping);
      applyDetail(mapping);
    } catch (error) {
      console.error("[cover-mapping] 加载失败", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
