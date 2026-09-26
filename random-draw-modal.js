/**
 * RANDOM DRAW MODAL & PURE-TEXT TYPOGRAPHIC LONG POSTER
 * 随机安利弹窗界面与纯文字精美长图生成器 (参考图 1 风格)
 * 《閲読器作品記録》 · keyanrenshi.xyz
 */
(() => {
  const inWorksDir = /\/works\/work-\d+\.html$/i.test(location.pathname);
  const root = inWorksDir ? '../' : './';

  // 确保 work-excerpts.js 加载
  if (!window.WORK_EXCERPTS && !document.querySelector('script[data-work-excerpts-loader]')) {
    const s = document.createElement('script');
    s.src = root + 'work-excerpts.js';
    s.dataset.workExcerptsLoader = '1';
    document.head.appendChild(s);
  }

  // 确保 random-draw-modal.css 加载
  if (!document.querySelector('link[href*="random-draw-modal.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = root + 'random-draw-modal.css';
    document.head.appendChild(link);
  }

  let modalEl = null;
  let currentWork = null;

  function getAllWorks() {
    return window.WORKS || window.WORKS_DATA || window.STORY_SEARCH || [];
  }

  function getWorkExcerpt(w) {
    if (!w) return '';
    const map = window.WORK_EXCERPTS || {};
    if (map[w.id]) return map[w.id];

    // 精选馆主寄语（贴合不同分类的文青手账寄语）
    const tags = (w.tags || []).join(' ');
    if (tags.includes('HP')) {
      return '“霍格沃茨的走廊里藏着未言的秘密与少年人的执拗。在魔法与风雪之间，重温那份热烈而清醒的感动。”';
    }
    if (tags.includes('古风') || tags.includes('武侠') || tags.includes('修仙')) {
      return '“红尘路远，江湖未老。纵是纸页翻覆，也能在字里行间窥见那份快意恩仇与暗流涌动的柔肠。”';
    }
    if (tags.includes('恋综') || tags.includes('恋爱') || tags.includes('玛丽苏')) {
      return '“心动是一场无法预谋的冒险。在微妙的视线交错与情绪拉扯中，沉浸体验属于你的浪漫章节。”';
    }
    if (tags.includes('悬疑') || tags.includes('推理') || tags.includes('大逃杀')) {
      return '“迷局环生，步步惊心。真相隐匿于重重谎言之下，等待一次酣畅淋漓的推演与觉醒。”';
    }
    return '“一段值得静下心来品读的故事，藏在时光深处的感动与偏爱，等待你的开启与重逢。”';
  }

  // 1. 创建或获取弹窗 DOM
  function ensureRandomModal() {
    if (modalEl) return modalEl;

    modalEl = document.createElement('div');
    modalEl.className = 'random-draw-modal';
    modalEl.id = 'randomDrawModal';
    modalEl.innerHTML = `
      <div class="random-draw-modal__backdrop" id="randomDrawBackdrop"></div>
      <div class="random-draw-modal__dialog">
        <div class="random-draw-modal__header">
          <div>
            <p class="random-draw-modal__kicker">RANDOM RECOMMENDATION · 馆主安利</p>
            <div class="random-draw-modal__title-row">
              <h3 class="random-draw-modal__title">今日为你抽到的故事</h3>
            </div>
          </div>
          <button type="button" class="random-draw-modal__close" id="randomDrawClose" aria-label="关闭">✕</button>
        </div>

        <div class="random-draw-modal__body">
          <article class="random-work-card" id="randomWorkCard">
            <div class="random-work-card__eyebrow-row">
              <span class="random-work-card__pill" id="randomWorkPill">橙光 · 连载中</span>
              <span class="random-work-card__date" id="randomWorkDate">档案记录</span>
            </div>

            <h2 class="random-work-card__name" id="randomWorkTitle">《作品名》</h2>

            <div class="random-work-card__rating-row">
              <span class="random-work-card__stars" id="randomWorkStars">★★★★☆</span>
            </div>

            <div class="random-work-card__chips" id="randomWorkChips"></div>

            <div class="random-work-card__characters" id="randomWorkChars" hidden></div>

            <div class="random-work-card__quote-box" id="randomWorkQuote"></div>
          </article>
        </div>

        <div class="random-draw-modal__footer">
          <div class="random-draw-modal__actions-row">
            <button type="button" class="random-draw-btn random-draw-btn--poster" id="randomDrawGenPoster">
              生成手账长图
            </button>
            <button type="button" class="random-draw-btn random-draw-btn--reroll" id="randomDrawReroll">
              换一部
            </button>
          </div>
          <div class="random-draw-modal__actions-row">
            <button type="button" class="random-draw-btn random-draw-btn--fav" id="randomDrawFavBtn">
              加入心选
            </button>
            <a href="#" class="random-draw-btn random-draw-btn--repo" id="randomDrawRepoLink">
              查看作品档案 →
            </a>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalEl);

    // 绑定事件
    const close = () => {
      modalEl.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    modalEl.querySelector('#randomDrawBackdrop').addEventListener('click', close);
    modalEl.querySelector('#randomDrawClose').addEventListener('click', close);

    modalEl.querySelector('#randomDrawReroll').addEventListener('click', () => {
      rollRandomWork();
    });

    modalEl.querySelector('#randomDrawFavBtn').addEventListener('click', () => {
      if (currentWork && window.ArchiveFavorites) {
        window.ArchiveFavorites.toggleFavorite(currentWork.id, currentWork);
        updateFavButton();
      }
    });

    modalEl.querySelector('#randomDrawGenPoster').addEventListener('click', () => {
      if (currentWork) {
        generateWorkTextPoster(currentWork);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalEl.classList.contains('is-open')) close();
    });

    return modalEl;
  }

  function updateFavButton() {
    if (!modalEl || !currentWork) return;
    const favBtn = modalEl.querySelector('#randomDrawFavBtn');
    const isFav = window.ArchiveFavorites ? window.ArchiveFavorites.isFavorited(currentWork.id) : false;
    if (isFav) {
      favBtn.classList.add('is-favorited');
      favBtn.innerHTML = '已在心选';
    } else {
      favBtn.classList.remove('is-favorited');
      favBtn.innerHTML = '加入心选';
    }
  }

  // 2. 填充并展示弹窗内容
  function displayWorkInModal(w) {
    currentWork = w;
    const modal = ensureRandomModal();

    modal.querySelector('#randomWorkPill').textContent = [w.platform || '同人', w.status].filter(Boolean).join(' · ');
    modal.querySelector('#randomWorkDate').textContent = w.updated ? `更新于 ${w.updated.split(' ')[0]}` : '馆主珍藏';
    modal.querySelector('#randomWorkTitle').textContent = w.name;
    modal.querySelector('#randomWorkStars').textContent = w.rating || '★★★★☆';

    // 标签
    const chipsEl = modal.querySelector('#randomWorkChips');
    chipsEl.innerHTML = (w.tags || []).slice(0, 6).map(t => `<span class="random-work-card__chip">${t}</span>`).join('');

    // 角色
    const charsEl = modal.querySelector('#randomWorkChars');
    if (w.characters && w.characters.trim()) {
      charsEl.hidden = false;
      charsEl.innerHTML = `<b>攻略/核心角色：</b>${w.characters}`;
    } else {
      charsEl.hidden = true;
    }

    // 寄语与摘要
    const quoteEl = modal.querySelector('#randomWorkQuote');
    const quote = getWorkExcerpt(w);
    quoteEl.textContent = quote.replace(/^[“”"']+|[“”"']+$/g, '');

    // 链接
    const repoLink = modal.querySelector('#randomDrawRepoLink');
    repoLink.href = `${root}works/${w.id}.html`;

    updateFavButton();

    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function rollRandomWork() {
    const list = getAllWorks();
    if (!list.length) return;
    const randomIndex = Math.floor(Math.random() * list.length);
    const selected = list[randomIndex];
    displayWorkInModal(selected);
  }

  // 3. 辅助：带圆角的矩形
  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // 辅助：多行文字自动换行排版
  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split('');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n];
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
    return currentY + lineHeight;
  }

  // 4. 纯文字精美排版长图生成（1:1 贴合图 1 手账美学）
  async function generateWorkTextPoster(w) {
    const scale = 2; // Retina 2x 高清
    const width = 375 * scale; // 750px
    const padX = 20 * scale;
    const cardW = width - (padX * 2);

    // 先计算文本量以动态确定长图高度
    const excerpt = getWorkExcerpt(w).replace(/^[“”"']+|[“”"']+$/g, '');
    const approxLines = Math.ceil(excerpt.length / 18);
    const quoteBoxH = (approxLines * 22 + 40) * scale;
    const totalHeight = (420 * scale) + quoteBoxH;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d');

    // 全局背景：图 1 手账暖白底色
    ctx.fillStyle = '#fbf7ee';
    ctx.fillRect(0, 0, width, totalHeight);

    // 顶部手账装饰 Kicker
    ctx.fillStyle = '#a65d77';
    ctx.font = `bold ${10 * scale}px ui-monospace, SFMono-Regular, monospace`;
    ctx.textAlign = 'left';
    ctx.fillText("VISITOR'S PRIVATE ARCHIVE · 馆主安利", padX, 36 * scale);

    // 主卡片纸张（纯白 + 实心纸质投影 3px 3px 0 #ded1c0 + 柔和细边框）
    const cardY = 50 * scale;
    const cardH = totalHeight - cardY - (40 * scale);

    // 纸质阴影
    ctx.fillStyle = '#dfd3c2';
    roundRect(ctx, padX + (2.5 * scale), cardY + (2.5 * scale), cardW, cardH, 10 * scale);
    ctx.fill();

    // 纯白卡片主体
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, padX, cardY, cardW, cardH, 10 * scale);
    ctx.fill();

    ctx.strokeStyle = '#e4d8c9';
    ctx.lineWidth = 1.5 * scale;
    roundRect(ctx, padX, cardY, cardW, cardH, 10 * scale);
    ctx.stroke();

    // 卡片内边距与排版起点
    const innerPad = 18 * scale;
    const contentX = padX + innerPad;
    const contentW = cardW - (innerPad * 2);
    let curY = cardY + (28 * scale);

    // 1. 胶囊标签行：平台 · 状态
    const pillStr = [w.platform || '同人', w.status].filter(Boolean).join(' · ');
    ctx.font = `bold ${11 * scale}px ui-monospace, -apple-system, sans-serif`;
    const pillTextW = ctx.measureText(pillStr).width;
    const pillW = pillTextW + (16 * scale);
    const pillH = 22 * scale;

    ctx.fillStyle = '#ebd3de';
    roundRect(ctx, contentX, curY - (14 * scale), pillW, pillH, 11 * scale);
    ctx.fill();

    ctx.fillStyle = '#7a314c';
    ctx.fillText(pillStr, contentX + (8 * scale), curY);

    // 右侧手账编号
    ctx.fillStyle = '#b5a498';
    ctx.font = `bold ${10 * scale}px ui-monospace, monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(`NO. ${w.id.toUpperCase()}`, contentX + contentW, curY);
    ctx.textAlign = 'left';

    curY += 28 * scale;

    // 2. 作品大标题（纯文字优雅衬线大字）
    ctx.fillStyle = '#261e19';
    ctx.font = `bold ${21 * scale}px "Noto Serif SC", serif, -apple-system`;
    curY = wrapText(ctx, w.name, contentX, curY, contentW, 28 * scale);

    curY += 4 * scale;

    // 3. 推荐评分金黄色星级
    ctx.fillStyle = '#cc7832';
    ctx.font = `bold ${15 * scale}px sans-serif`;
    const stars = w.rating || '★★★★☆';
    ctx.fillText(stars, contentX, curY);

    ctx.fillStyle = '#8f7b6e';
    ctx.font = `${11 * scale}px -apple-system, sans-serif`;
    const starsW = ctx.measureText(stars + ' ').width;
    ctx.fillText('· 馆主精选安利', contentX + starsW, curY);

    curY += 18 * scale;

    // 4. 精美分隔虚线与花朵花饰
    ctx.strokeStyle = '#ebdcd0';
    ctx.lineWidth = 1 * scale;
    ctx.setLineDash([3 * scale, 3 * scale]);
    ctx.beginPath();
    ctx.moveTo(contentX, curY);
    ctx.lineTo(contentX + contentW, curY);
    ctx.stroke();
    ctx.setLineDash([]);

    curY += 20 * scale;

    // 5. 详细属性列表（纯文字规整优雅排版）
    function drawMetaRow(label, value) {
      if (!value) return;
      ctx.fillStyle = '#9c887b';
      ctx.font = `bold ${11 * scale}px "Noto Serif SC", serif`;
      ctx.fillText(label, contentX, curY);

      ctx.fillStyle = '#3a2d24';
      ctx.font = `${12 * scale}px -apple-system, sans-serif`;
      const labelW = 72 * scale;
      curY = wrapText(ctx, value, contentX + labelW, curY, contentW - labelW, 18 * scale);
      curY += 6 * scale;
    }

    drawMetaRow('【收录平台】', w.platform || '同人小说');
    drawMetaRow('【连载状态】', w.status || '完结');
    if (w.tags && w.tags.length) {
      drawMetaRow('【分类标签】', w.tags.join(' · '));
    }
    if (w.characters && w.characters.trim()) {
      drawMetaRow('【主要角色】', w.characters);
    }

    curY += 10 * scale;

    // 6. 馆主读后感/寄语引文卡片（精美手账引用块）
    const quoteBoxY = curY;
    const actualBoxH = quoteBoxH - (10 * scale);
    ctx.fillStyle = '#faf6ef';
    roundRect(ctx, contentX, quoteBoxY, contentW, actualBoxH, 6 * scale);
    ctx.fill();

    ctx.strokeStyle = '#e7dcce';
    ctx.lineWidth = 1 * scale;
    ctx.stroke();

    // 装饰性大引号
    ctx.fillStyle = '#dfcfc2';
    ctx.font = `bold ${30 * scale}px Georgia, serif`;
    ctx.fillText('“', contentX + (8 * scale), quoteBoxY + (26 * scale));

    // 引文正文
    ctx.fillStyle = '#524339';
    ctx.font = `italic ${12 * scale}px "Noto Serif SC", serif, -apple-system`;
    wrapText(ctx, excerpt, contentX + (24 * scale), quoteBoxY + (24 * scale), contentW - (36 * scale), 20 * scale);

    curY = quoteBoxY + actualBoxH + (22 * scale);

    // 7. 盖印复古圆章（RECOMMENDED STAMP）
    const stampX = contentX + contentW - (32 * scale);
    const stampY = quoteBoxY + actualBoxH + (4 * scale);

    ctx.save();
    ctx.translate(stampX, stampY);
    ctx.rotate((-12 * Math.PI) / 180);
    ctx.strokeStyle = '#e3a1b5';
    ctx.lineWidth = 1.2 * scale;
    ctx.setLineDash([2.5 * scale, 2 * scale]);
    ctx.beginPath();
    ctx.arc(0, 0, 18 * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#cf5679';
    ctx.font = `bold ${7 * scale}px ui-monospace, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('RECOMMENDED', 0, -3 * scale);
    ctx.fillText('♥ 閲読器', 0, 8 * scale);
    ctx.restore();

    // 8. 底部网站水印与长图保存引导
    ctx.fillStyle = '#7a6a5f';
    ctx.font = `bold ${11 * scale}px "Noto Serif SC", serif, -apple-system`;
    ctx.textAlign = 'center';
    ctx.fillText('閲 読 器 作 品 記 録 · 独 家 存 档', width / 2, totalHeight - (20 * scale));

    ctx.fillStyle = '#a69588';
    ctx.font = `${9 * scale}px ui-monospace, monospace`;
    ctx.fillText('keyanrenshi.xyz · 长按图片直接存储到手机相册', width / 2, totalHeight - (8 * scale));

    const dataUrl = canvas.toDataURL('image/png');

    // 调起海报预览弹窗
    if (window.ArchivePosterGenerator && window.ArchivePosterGenerator.ensurePosterModal) {
      // 复用海报弹窗
      const modal = window.ArchivePosterGenerator.ensurePosterModal();
      const loading = modal.querySelector('#favPosterLoading');
      const preview = modal.querySelector('#favPosterPreview');
      const img = modal.querySelector('#favPosterImg');
      const downloadBtn = modal.querySelector('#favPosterDownloadBtn');
      const titleEl = modal.querySelector('.fav-poster-modal__title');

      if (titleEl) titleEl.textContent = `《${w.name}》手账长图已生成`;
      loading.hidden = true;
      preview.hidden = false;
      img.src = dataUrl;
      downloadBtn.href = dataUrl;
      downloadBtn.download = `安利卡片-${w.name}.png`;

      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    } else {
      // 简单打开独立新窗口展示
      const win = window.open();
      win.document.write(`<title>《${w.name}》精美长图</title><img src="${dataUrl}" style="max-width:100%;height:auto;display:block;margin:20px auto;">`);
    }
  }

  // 5. 全局拦截 #random 按钮
  document.addEventListener('DOMContentLoaded', () => {
    // 监听所有点击随机安利按钮的事件
    const handleRandomClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      rollRandomWork();
    };

    const randomBtn = document.getElementById('random');
    if (randomBtn) {
      randomBtn.addEventListener('click', handleRandomClick);
      // 覆盖 inline 或旧 onclick
      randomBtn.onclick = handleRandomClick;
    }

    document.querySelectorAll('[data-archive-draw]').forEach(el => {
      el.addEventListener('click', handleRandomClick);
      el.onclick = handleRandomClick;
    });

    // 如果处于 random.html 或带 ?action=draw，则自动弹窗
    const view = document.body.dataset.archiveView;
    const urlParams = new URLSearchParams(location.search);
    if (view === 'random' || urlParams.get('action') === 'draw') {
      setTimeout(() => rollRandomWork(), 150);
    }
  });

  // 挂载全局方法
  window.openRandomDrawModal = (work) => {
    if (work) {
      displayWorkInModal(work);
    } else {
      rollRandomWork();
    }
  };
  window.generateWorkTextPoster = generateWorkTextPoster;
})();
