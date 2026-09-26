/**
 * VISITOR'S FAVORITES SHARE POSTER GENERATOR (心选清单长图分享生成器)
 * 1:1 完美复刻心选抽屉手账卡片风格（图1 样式 · 纯净暖白长图）
 * 《閲読器作品記録》 · keyanrenshi.xyz
 */
(() => {
  // 辅助：加载图片并转为 Image 元素
  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      // 超时兜底，防止网络图片卡住
      setTimeout(() => resolve(null), 2000);
      img.src = src;
    });
  }

  // 辅助：带圆角的矩形
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

  // 辅助：文字单行截断
  function truncateText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let t = text;
    while (t.length > 0 && ctx.measureText(t + '…').width > maxWidth) {
      t = t.slice(0, -1);
    }
    return t + '…';
  }

  // 辅助：格式化日期（如 "9月26日 18:25"）
  function formatPosterDate(ts) {
    const d = ts ? new Date(ts) : new Date();
    const m = d.getMonth() + 1;
    const date = d.getDate();
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${m}月${date}日 ${h}:${min}`;
  }

  // 核心：在 Canvas 上渲染 1:1 贴合图 1 心选抽屉样式的优雅长图
  async function renderPosterCanvas(favoritesList) {
    const scale = 2; // Retina 2x 高清
    const width = 375 * scale; // 750px
    const maxItems = Math.min(favoritesList.length, 12);
    const listToDraw = favoritesList.slice(0, maxItems);

    const headerHeight = 96 * scale;
    const cardHeight = 116 * scale;
    const cardGap = 12 * scale;
    const footerHeight = 84 * scale;
    const totalHeight = headerHeight + (listToDraw.length * (cardHeight + cardGap)) + footerHeight;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d');

    // 1. 全局背景：图1 抽屉的经典手账柔润暖白色
    ctx.fillStyle = '#fbf7ee';
    ctx.fillRect(0, 0, width, totalHeight);

    // 2. 顶部 Header 区（1:1 复刻图1 顶部手账排版）
    const padX = 16 * scale;

    // Kicker: VISITOR'S PRIVATE KEEPSAKE
    ctx.fillStyle = '#a65d77';
    ctx.font = `bold ${10 * scale}px ui-monospace, SFMono-Regular, monospace`;
    ctx.textAlign = 'left';
    ctx.fillText("VISITOR'S PRIVATE KEEPSAKE", padX, 36 * scale);

    // Main Title: 我的心选清单
    ctx.fillStyle = '#2c231d';
    ctx.font = `bold ${22 * scale}px "Noto Serif SC", serif, -apple-system`;
    const titleText = '我的心选清单';
    ctx.fillText(titleText, padX, 68 * scale);

    // Count Pill: 3 部 (粉色胶囊徽章)
    const titleWidth = ctx.measureText(titleText).width;
    const pillX = padX + titleWidth + (10 * scale);
    const pillY = 52 * scale;
    const pillText = `${favoritesList.length} 部`;
    ctx.font = `bold ${12 * scale}px ui-monospace, -apple-system, sans-serif`;
    const pillTextW = ctx.measureText(pillText).width;
    const pillW = pillTextW + (14 * scale);
    const pillH = 20 * scale;

    ctx.fillStyle = '#ebd3de';
    roundRect(ctx, pillX, pillY, pillW, pillH, 10 * scale);
    ctx.fill();

    ctx.fillStyle = '#7a314c';
    ctx.fillText(pillText, pillX + (7 * scale), pillY + (14 * scale));

    // 右上角微缩手账圆圈关闭装饰
    const closeR = 14 * scale;
    const closeX = width - padX - closeR;
    const closeY = 54 * scale;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(closeX, closeY, closeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d7cbbe';
    ctx.lineWidth = 1 * scale;
    ctx.stroke();
    ctx.fillStyle = '#7a6a5f';
    ctx.font = `${13 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('✕', closeX, closeY + (4.5 * scale));

    // 细致横线分隔
    ctx.strokeStyle = '#e9dfd0';
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(padX, 86 * scale);
    ctx.lineTo(width - padX, 86 * scale);
    ctx.stroke();

    // 3. 预加载所有封面图片
    const coverImages = await Promise.all(
      listToDraw.map(w => {
        const p1 = `assets/covers/${w.id}.png`;
        const p2 = `assets/covers/${w.id}.jpg`;
        return loadImage(p1).then(img => img || loadImage(p2));
      })
    );

    // 4. 逐一绘制每部作品的白色质感纸质卡片（1:1 复刻图1 样式）
    const cardW = width - (padX * 2);
    const startY = headerHeight + (6 * scale);

    for (let i = 0; i < listToDraw.length; i++) {
      const item = listToDraw[i];
      const y = startY + (i * (cardHeight + cardGap));

      // 卡片实体纸张（纯白 + 实心纸质投影 2px 2px 0 #ded1c0 + 柔和细边框）
      // 阴影块
      ctx.fillStyle = '#dfd3c2';
      roundRect(ctx, padX + (2 * scale), y + (2 * scale), cardW, cardHeight, 9 * scale);
      ctx.fill();

      // 卡片主体
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, padX, y, cardW, cardHeight, 9 * scale);
      ctx.fill();

      ctx.strokeStyle = '#e4d8c9';
      ctx.lineWidth = 1.5 * scale;
      roundRect(ctx, padX, y, cardW, cardHeight, 9 * scale);
      ctx.stroke();

      // 卡片右上角细小 ✕
      ctx.fillStyle = '#c5b5aa';
      ctx.font = `${11 * scale}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('✕', padX + cardW - (12 * scale), y + (16 * scale));

      // 左侧封面缩略图 (宽 68px, 高 90px)
      const thumbW = 66 * scale;
      const thumbH = 88 * scale;
      const thumbX = padX + (12 * scale);
      const thumbY = y + (14 * scale);

      ctx.save();
      roundRect(ctx, thumbX, thumbY, thumbW, thumbH, 4 * scale);
      ctx.clip();

      const coverImg = coverImages[i];
      if (coverImg) {
        ctx.drawImage(coverImg, thumbX, thumbY, thumbW, thumbH);
      } else {
        // 如果无封面，完美复刻图1 中《Elite精英》的浅灰底 + 蓝绿色 [?] 图标框！
        ctx.fillStyle = '#f5efe6';
        ctx.fillRect(thumbX, thumbY, thumbW, thumbH);

        const qBoxSize = 28 * scale;
        const qBoxX = thumbX + (thumbW - qBoxSize) / 2;
        const qBoxY = thumbY + (thumbH - qBoxSize) / 2;

        ctx.fillStyle = '#def0f6';
        roundRect(ctx, qBoxX, qBoxY, qBoxSize, qBoxSize, 4 * scale);
        ctx.fill();
        ctx.strokeStyle = '#a6d5e5';
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        ctx.fillStyle = '#4c92a5';
        ctx.font = `bold ${14 * scale}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('?', qBoxX + qBoxSize / 2, qBoxY + (19 * scale));
      }
      ctx.restore();

      // 封面精致细边框
      ctx.strokeStyle = '#ded3c3';
      ctx.lineWidth = 1 * scale;
      roundRect(ctx, thumbX, thumbY, thumbW, thumbH, 4 * scale);
      ctx.stroke();

      // 右侧文字排版
      const textX = thumbX + thumbW + (12 * scale);
      const maxTextW = cardW - thumbW - (38 * scale);
      ctx.textAlign = 'left';

      // Line 1: 平台 · 作品状态（如 "橙光 · 断更"）
      ctx.fillStyle = '#8c776a';
      ctx.font = `${11 * scale}px -apple-system, sans-serif`;
      const eyebrowStr = [item.platform || '同人', item.status].filter(Boolean).join(' · ');
      ctx.fillText(eyebrowStr, textX, y + (28 * scale));

      // Line 2: 作品全名（如 "《Elite精英》"）
      ctx.fillStyle = '#2c231e';
      ctx.font = `bold ${15 * scale}px "Noto Serif SC", serif, -apple-system`;
      const titleTrun = truncateText(ctx, item.name, maxTextW);
      ctx.fillText(titleTrun, textX, y + (52 * scale));

      // Line 3: 推荐指数星级 + 标签（如 "★★★☆☆  BTS · 书中人觉醒 · 大女主"）
      ctx.fillStyle = '#cc7832';
      ctx.font = `bold ${12 * scale}px sans-serif`;
      const stars = item.rating || '★★★☆☆';
      ctx.fillText(stars, textX, y + (74 * scale));

      const starsW = ctx.measureText(stars + '  ').width;
      ctx.fillStyle = '#7a675d';
      ctx.font = `${11 * scale}px -apple-system, sans-serif`;
      const tagsStr = (item.tags || []).slice(0, 3).join(' · ');
      if (tagsStr) {
        ctx.fillText(truncateText(ctx, tagsStr, maxTextW - starsW), textX + starsW, y + (74 * scale));
      }

      // Line 4: 收藏时间（如 "9月26日 18:25"）
      ctx.fillStyle = '#a69488';
      ctx.font = `${10 * scale}px ui-monospace, monospace`;
      const dateLine = formatPosterDate(item.addedAt);
      ctx.fillText(dateLine, textX, y + (96 * scale));
    }

    // 5. 底部优雅品牌留白与印章（清新纯净手账收尾）
    const footerY = totalHeight - footerHeight;

    // 底部波浪线或细线
    ctx.strokeStyle = '#e7dccd';
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(padX, footerY + (12 * scale));
    ctx.lineTo(width - padX, footerY + (12 * scale));
    ctx.stroke();

    // 网站水印
    ctx.fillStyle = '#5c4b42';
    ctx.font = `bold ${12 * scale}px "Noto Serif SC", serif, -apple-system`;
    ctx.textAlign = 'center';
    ctx.fillText('閲 読 器 作 品 記 録 · 访 客 私 人 心 选', width / 2, footerY + (38 * scale));

    ctx.fillStyle = '#9c897d';
    ctx.font = `${10 * scale}px ui-monospace, monospace`;
    ctx.fillText('keyanrenshi.xyz · 长按保存手账长图', width / 2, footerY + (56 * scale));

    return canvas.toDataURL('image/png');
  }

  // 6. 海报弹窗控制器 (Modal)
  let modalEl = null;

  function ensurePosterModal() {
    if (modalEl) return modalEl;

    modalEl = document.createElement('div');
    modalEl.className = 'fav-poster-modal';
    modalEl.id = 'favPosterModal';
    modalEl.innerHTML = `
      <div class="fav-poster-modal__backdrop" id="favPosterBackdrop"></div>
      <div class="fav-poster-modal__dialog">
        <div class="fav-poster-modal__header">
          <div>
            <h3 class="fav-poster-modal__title">心选清单手账长图</h3>
            <p class="fav-poster-modal__hint">长按图片直接存储到手机相册，或点击下方按钮下载</p>
          </div>
          <button type="button" class="fav-poster-modal__close" id="favPosterClose" aria-label="关闭">✕</button>
        </div>

        <div class="fav-poster-modal__body">
          <div class="fav-poster-loading" id="favPosterLoading">
            <div class="fav-poster-loading__spinner"></div>
            <p>正在生成手账长图海报…</p>
          </div>
          <div class="fav-poster-preview" id="favPosterPreview" hidden>
            <img id="favPosterImg" src="" alt="心选书单长图" class="fav-poster-img">
          </div>
        </div>

        <div class="fav-poster-modal__footer">
          <a id="favPosterDownloadBtn" href="#" download="我的心选清单长图.png" class="fav-poster-action-btn fav-poster-action-btn--primary">
            下载手账长图 (PNG)
          </a>
          <button type="button" id="favPosterDismissBtn" class="fav-poster-action-btn">
            关闭
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalEl);

    // 绑定关闭
    const close = () => {
      modalEl.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    modalEl.querySelector('#favPosterBackdrop').addEventListener('click', close);
    modalEl.querySelector('#favPosterClose').addEventListener('click', close);
    modalEl.querySelector('#favPosterDismissBtn').addEventListener('click', close);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalEl.classList.contains('is-open')) close();
    });

    return modalEl;
  }

  async function openPosterModal() {
    const list = window.ArchiveFavorites ? window.ArchiveFavorites.getFavoritesList() : [];
    if (list.length === 0) {
      alert('你的心选清单里还没有作品哦！先点亮几部心动的故事再来生成海报吧~');
      return;
    }

    const modal = ensurePosterModal();
    const loading = modal.querySelector('#favPosterLoading');
    const preview = modal.querySelector('#favPosterPreview');
    const img = modal.querySelector('#favPosterImg');
    const downloadBtn = modal.querySelector('#favPosterDownloadBtn');

    loading.hidden = false;
    preview.hidden = true;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    try {
      const dataUrl = await renderPosterCanvas(list);
      img.src = dataUrl;
      downloadBtn.href = dataUrl;
      downloadBtn.download = `我的心选清单长图-${new Date().toISOString().slice(0, 10)}.png`;

      loading.hidden = true;
      preview.hidden = false;
    } catch (err) {
      console.error('海报生成失败', err);
      loading.innerHTML = '<p style="color:#b83d5a;">长图生成遇到了点小问题，请稍后重试。</p>';
    }
  }

  // 挂载到全局
  window.ArchivePosterGenerator = {
    renderPosterCanvas,
    openPosterModal,
    ensurePosterModal
  };
})();
