import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { load } from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_FILE = path.join(__dirname, 'admin-config.json');
const WORKS_DATA_FILE = path.join(__dirname, 'works-data.js');
const COVER_MAPPING_FILE = path.join(__dirname, 'new-cover-mapping.json');
const COVER_OVERRIDES_FILE = path.join(__dirname, 'cover-overrides.json');
const REPO_MAPPING_FILE = path.join(__dirname, 'repo-mapping.json');
const WORKS_DIR = path.join(__dirname, 'works');
const COVERS_DIR = path.join(__dirname, 'assets', 'covers');

// 确保目录和配置文件存在
if (!fs.existsSync(COVERS_DIR)) {
  fs.mkdirSync(COVERS_DIR, { recursive: true });
}

function getAdminConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch (e) {
      console.error('Failed to parse admin config, using default', e);
    }
  }
  // 默认馆主通行口令：keyan2026
  const defaultConfig = {
    passcode: 'keyan2026',
    jwtSecret: crypto.randomBytes(32).toString('hex')
  };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2), 'utf8');
  return defaultConfig;
}

export function verifyPasscode(passcode) {
  const config = getAdminConfig();
  return String(passcode).trim() === String(config.passcode).trim();
}

export function changePasscode(oldPasscode, newPasscode) {
  if (!verifyPasscode(oldPasscode)) {
    return { success: false, error: '原口令错误' };
  }
  if (!newPasscode || String(newPasscode).trim().length < 4) {
    return { success: false, error: '新口令长度至少需 4 位字符' };
  }
  const config = getAdminConfig();
  config.passcode = String(newPasscode).trim();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  return { success: true };
}

// 简单的 Session Token 生成与校验
const validTokens = new Set();
export function createSessionToken() {
  const token = 'studio_' + crypto.randomBytes(24).toString('hex');
  validTokens.add(token);
  return token;
}

export function checkSessionToken(token) {
  if (!token) return false;
  return validTokens.has(token);
}

// 读取全量 works 数组
export function readWorksArray() {
  if (!fs.existsSync(WORKS_DATA_FILE)) return [];
  const content = fs.readFileSync(WORKS_DATA_FILE, 'utf8');
  const match = content.match(/=\s*(\[[\s\S]*\]);/);
  if (!match) return [];
  try {
    return JSON.parse(match[1]);
  } catch (err) {
    console.error('JSON parse works-data error:', err);
    return [];
  }
}

// 写入全量 works 数组
export function writeWorksArray(works) {
  const jsContent = `window.WORKS = window.WORKS_DATA = ${JSON.stringify(works, null, 0)};\n`;
  fs.writeFileSync(WORKS_DATA_FILE, jsContent, 'utf8');
}

// 获取下一个新的 Work ID（如 work-138）
export function getNextWorkId() {
  const works = readWorksArray();
  let maxNum = 0;
  works.forEach(w => {
    const match = (w.id || '').match(/work-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  const nextNum = maxNum + 1;
  return `work-${String(nextNum).padStart(3, '0')}`;
}

// 读取/更新 JSON 字典文件
function readJsonSafe(file, defaultVal = {}) {
  if (fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
      return defaultVal;
    }
  }
  return defaultVal;
}

function writeJsonSafe(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// 保存封面图片（从 base64）
export function saveCoverImage(workId, base64Data) {
  if (!base64Data || typeof base64Data !== 'string') return null;
  const matches = base64Data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
  const ext = matches ? (matches[1] === 'jpeg' ? 'jpg' : matches[1]) : 'png';
  const buffer = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(base64Data, 'base64');
  const fileName = `${workId}.${ext}`;
  const filePath = path.join(COVERS_DIR, fileName);
  fs.writeFileSync(filePath, buffer);
  return fileName;
}

// 生成单个作品独立 HTML 详情页 (works/work-XXX.html)
export function generateWorkDetailHtml(work, extra = {}) {
  const {
    playStatus = '待读清单',
    playTime = '待记录',
    house = '未设定',
    sexuality = 'bg',
    repoContent = '',
    coverFileName = `${work.id}.png`,
    cropX = 50,
    cropY = 20,
    zoom = 100
  } = extra;

  const chipsHtml = (work.tags || []).slice(0, 6).map(t => `<span>${escapeHtml(t)}</span>`).join('');
  const tagsText = (work.tags || []).join(', ') || '暂无标签';

  // 格式化正文段落
  let repoBodyHtml = '';
  if (repoContent && repoContent.trim()) {
    const paragraphs = repoContent.trim().split(/\n\s*\n/).map(p => {
      const trimmed = p.trim();
      if (trimmed.startsWith('# ')) {
        return `<h2>${escapeHtml(trimmed.slice(2))}</h2>`;
      }
      if (trimmed.startsWith('## ')) {
        return `<h3>${escapeHtml(trimmed.slice(3))}</h3>`;
      }
      return `<p>${escapeHtml(trimmed).replace(/\n/g, '<br>')}</p>`;
    });
    repoBodyHtml = paragraphs.join('\n');
  } else {
    repoBodyHtml = `<p>馆主正在整理这部作品的深度 Repo 游玩手记与角色分线评述，敬请期待更新…</p>`;
  }

  const zoomScale = (zoom / 100).toFixed(2);

  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(work.name)}｜閲読器作品記録</title><link rel="stylesheet" href="../style.css"><link rel="stylesheet" href="retro.css"><link rel="stylesheet" href="../repo-images.css"><link rel="stylesheet" href="../favorites.css"></head><body><nav class="top"><a href="../works.html">← 返回作品记录</a><a class="logo" href="../index.html">閲読器作品記録</a></nav><main class="detail"><section class="work-head"><div class="cover verified"><img src="../assets/covers/${encodeURIComponent(coverFileName)}" alt="${escapeHtml(work.name)} 封面" style="object-position:${cropX}% ${cropY}%;transform:scale(${zoomScale});transform-origin:${cropX}% ${cropY}%;"><small>作品封面</small></div><div><p class="kicker">WORK RECORD</p><h1>${escapeHtml(work.name)}</h1><span class="stars" aria-label="推荐指数 ${escapeHtml(work.rating || '暂无评分')}">${escapeHtml(work.rating || '暂无评分')}</span><div class="chips">${chipsHtml}</div></div></section><dl class="facts"><dt>平台</dt><dd>${escapeHtml(work.platform || '橙光')}</dd><dt>作品状态</dt><dd>${escapeHtml(work.status || '连载中')}</dd><dt>游玩状态</dt><dd>${escapeHtml(playStatus)}</dd><dt>游戏标签</dt><dd>${escapeHtml(tagsText)}</dd><dt>攻略角色</dt><dd>${escapeHtml(work.characters || '暂无')}</dd><dt>性向</dt><dd>${escapeHtml(sexuality)}</dd><dt>主角学院</dt><dd>${escapeHtml(house)}</dd><dt>游玩时长</dt><dd>${escapeHtml(playTime)}</dd></dl><article class="repo"><p class="kicker">REPO / PLAY NOTES</p><h1>${escapeHtml(work.name)} 馆主手记</h1>${repoBodyHtml}</article></main><footer>閲読器作品記録</footer><script src="../cover-mapping.js"></script><script src="../favorites.js"></script></body></html>`;
}

// 在 works.html / index.html 中同步插入新卡片与更新计数
export function injectWorkIntoHtml(pageFile, work, coverFileName, cropX = 50, cropY = 20, zoom = 100) {
  const filePath = path.join(__dirname, pageFile);
  if (!fs.existsSync(filePath)) return;

  let html = fs.readFileSync(filePath, 'utf8');

  // 构建标准卡片 HTML
  const zoomScale = (zoom / 100).toFixed(2);
  const chipsHtml = (work.tags || []).slice(0, 4).map(t => `<span>${escapeHtml(t)}</span>`).join('');
  const cardHtml = `<article class="card"><a href="works/${work.id}.html" class="card-link"><div class="cover verified"><img src="assets/covers/${encodeURIComponent(coverFileName)}" alt="${escapeHtml(work.name)} 封面" style="object-position:${cropX}% ${cropY}%;transform:scale(${zoomScale});transform-origin:${cropX}% ${cropY}%;"><small>作品封面</small></div><div class="card-body"><p class="eyebrow">${escapeHtml(work.platform || '橙光')} · ${escapeHtml(work.status || '连载中')}</p><h3>${escapeHtml(work.name)}</h3><span class="stars" aria-label="推荐指数 ${escapeHtml(work.rating || '暂无评分')}">${escapeHtml(work.rating || '暂无评分')}</span><div class="chips">${chipsHtml}</div></div></a></article>`;

  // 插入到 #catalog 末尾
  const catalogMarker = '<div id="catalog" class="grid">';
  if (html.includes(catalogMarker)) {
    // 检查是否已经存在该 work id，若存在则替换，不存在则追加
    const regex = new RegExp(`<article class="card"><a href="works/${work.id}\\.html"[\\s\\S]*?<\\/article>`, 'i');
    if (regex.test(html)) {
      html = html.replace(regex, cardHtml);
    } else {
      // 插入在开头或末尾，这里插入在 #catalog 开头让馆主刚添加的最新作品排在第一位，方便立即查看！
      html = html.replace(catalogMarker, catalogMarker + cardHtml);
    }
  }

  // 更新总数显示（如 137 部作品，等待被翻阅）
  const works = readWorksArray();
  html = html.replace(/<h2>\d+\s*部作品[，,]\s*等待被翻阅<\/h2>/g, `<h2>${works.length} 部作品，等待被翻阅</h2>`);

  fs.writeFileSync(filePath, html, 'utf8');
}

export function syncWorkToCelebrity(work, options = {}) {
  const filePath = path.join(__dirname, 'celebrity.html');
  if (!fs.existsSync(filePath) || !work?.id) return { synced: false, groups: [] };
  const $ = load(fs.readFileSync(filePath, 'utf8'));
  const tags = new Set((work.tags || []).map(t => String(t).trim()).filter(Boolean));
  const isCelebrity = tags.has('真人区');

  $('.celebrity-shelf .card').each((_, el) => {
    if ($(el).find('a[href="works/' + work.id + '.html"]').length) $(el).remove();
  });

  const groups = $('[data-celebrity-group]').map((_, el) => String($(el).attr('data-celebrity-group') || '').trim()).get();
  let targets = isCelebrity ? groups.filter(g => g && g !== '其他真人' && tags.has(g)) : [];
  if (isCelebrity && targets.length === 0 && groups.includes('其他真人')) targets = ['其他真人'];

  if (isCelebrity) {
    const coverMap = readJsonSafe(COVER_MAPPING_FILE);
    const coverFileName = options.coverFileName || coverMap[work.id]?.file || (work.id + '.png');
    const overrides = readJsonSafe(COVER_OVERRIDES_FILE)[work.id] || {};
    const cropX = Number(options.cropX ?? overrides.x ?? 50);
    const cropY = Number(options.cropY ?? overrides.y ?? 20);
    const zoom = Number(options.zoom ?? overrides.zoom ?? 100);
    const scale = (zoom / 100).toFixed(2);
    const chips = (work.tags || []).slice(0, 4).map(t => '<span>' + escapeHtml(t) + '</span>').join('');
    const card = '<article class="card"><a href="works/' + work.id + '.html" class="card-link"><div class="cover verified"><img src="assets/covers/' + encodeURIComponent(coverFileName) + '" alt="' + escapeHtml(work.name) + ' 封面" style="object-position:' + cropX + '% ' + cropY + '%;transform:scale(' + scale + ');transform-origin:' + cropX + '% ' + cropY + '%;"><small>作品封面</small></div><div class="card-body"><p class="eyebrow">' + escapeHtml(work.platform || '橙光') + ' · ' + escapeHtml(work.status || '连载中') + '</p><h3>' + escapeHtml(work.name) + '</h3><span class="stars" aria-label="推荐指数 ' + escapeHtml(work.rating || '暂无评分') + '">' + escapeHtml(work.rating || '暂无评分') + '</span><div class="chips">' + chips + '</div></div></a></article>';
    for (const group of targets) {
      const shelf = $('[data-celebrity-shelf]').filter((_, el) => String($(el).attr('data-celebrity-shelf') || '').trim() === group).first();
      shelf.find('.celebrity-grid').first().prepend(card);
    }
  }

  $('[data-celebrity-shelf]').each((_, el) => {
    const shelf = $(el);
    const group = String(shelf.attr('data-celebrity-shelf') || '').trim();
    const count = shelf.find('.celebrity-grid > .card').length;
    shelf.find('.celebrity-shelf__heading span').first().text(count + ' 部记录');
    $('[data-celebrity-group]').filter((_, btn) => String($(btn).attr('data-celebrity-group') || '').trim() === group).find('b').first().text(String(count));
  });

  fs.writeFileSync(filePath, $.html(), 'utf8');
  return { synced: isCelebrity, groups: targets };
}

// 核心业务：录入并全站发布新作品
export function createNewWork(inputData) {
  const name = String(inputData.name || '').trim();
  if (!name) {
    return { success: false, error: '作品名称不能为空' };
  }

  const newId = getNextWorkId();
  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

  const workRecord = {
    id: newId,
    name: name.startsWith('《') && name.endsWith('》') ? name : `《${name}》`,
    platform: inputData.platform || '橙光',
    status: inputData.status || '连载中',
    rating: inputData.rating || '',
    tags: Array.isArray(inputData.tags) ? inputData.tags.map(t => String(t).trim()).filter(Boolean) : [],
    characters: String(inputData.characters || '').trim(),
    updated: inputData.updated || dateStr
  };

  // 1. 保存封面图片
  let coverFileName = `${newId}.png`;
  if (inputData.coverImageBase64) {
    const savedName = saveCoverImage(newId, inputData.coverImageBase64);
    if (savedName) coverFileName = savedName;
  }

  const cropX = Number.isFinite(Number(inputData.cropX)) ? Number(inputData.cropX) : 50;
  const cropY = Number.isFinite(Number(inputData.cropY)) ? Number(inputData.cropY) : 20;
  const zoom = Number.isFinite(Number(inputData.zoom)) ? Number(inputData.zoom) : 100;

  // 2. 更新 new-cover-mapping.json
  const coverMap = readJsonSafe(COVER_MAPPING_FILE);
  coverMap[newId] = { file: coverFileName };
  writeJsonSafe(COVER_MAPPING_FILE, coverMap);

  // 3. 更新 cover-overrides.json
  const overridesMap = readJsonSafe(COVER_OVERRIDES_FILE);
  overridesMap[newId] = { x: cropX, y: cropY, zoom };
  writeJsonSafe(COVER_OVERRIDES_FILE, overridesMap);

  // 4. 更新 repo-mapping.json
  const repoMap = readJsonSafe(REPO_MAPPING_FILE);
  repoMap[newId] = { url: `works/${newId}.html` };
  writeJsonSafe(REPO_MAPPING_FILE, repoMap);

  // 5. 追加到 works-data.js
  const works = readWorksArray();
  works.push(workRecord);
  writeWorksArray(works);

  // 6. 自动生成 works/work-XXX.html 详情页
  const detailHtml = generateWorkDetailHtml(workRecord, {
    playStatus: inputData.playStatus || '待读清单',
    playTime: inputData.playTime || '未设定',
    house: inputData.house || '未设定',
    sexuality: inputData.sexuality || 'bg',
    repoContent: inputData.repoContent || '',
    coverFileName,
    cropX,
    cropY,
    zoom
  });
  fs.writeFileSync(path.join(WORKS_DIR, `${newId}.html`), detailHtml, 'utf8');

  // 7. 更新 works.html 与 index.html 中的卡片
  injectWorkIntoHtml('works.html', workRecord, coverFileName, cropX, cropY, zoom);
  injectWorkIntoHtml('index.html', workRecord, coverFileName, cropX, cropY, zoom);
  syncWorkToCelebrity(workRecord, { coverFileName, cropX, cropY, zoom });

  return {
    success: true,
    work: workRecord,
    detailUrl: `works/${newId}.html`,
    totalWorks: works.length
  };
}

// 删除已有作品及其本地生成资源
export function deleteExistingWork(workId) {
  const id = String(workId || '').trim();
  if (!/^work-\d+$/i.test(id)) return { success: false, error: '作品 ID 格式无效' };

  const works = readWorksArray();
  const target = works.find(w => w.id === id);
  if (!target) return { success: false, error: '未找到指定作品 ID' };

  const coverMap = readJsonSafe(COVER_MAPPING_FILE);
  const mappedCover = coverMap[id]?.file;
  const nextWorks = works.filter(w => w.id !== id);
  writeWorksArray(nextWorks);

  delete coverMap[id];
  writeJsonSafe(COVER_MAPPING_FILE, coverMap);
  const overridesMap = readJsonSafe(COVER_OVERRIDES_FILE);
  delete overridesMap[id];
  writeJsonSafe(COVER_OVERRIDES_FILE, overridesMap);
  const repoMap = readJsonSafe(REPO_MAPPING_FILE);
  delete repoMap[id];
  writeJsonSafe(REPO_MAPPING_FILE, repoMap);

  const detailPath = path.join(WORKS_DIR, id + '.html');
  if (fs.existsSync(detailPath)) fs.unlinkSync(detailPath);

  if (mappedCover) {
    const safeCoverName = path.basename(mappedCover);
    const coverPath = path.join(COVERS_DIR, safeCoverName);
    if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
  }

  for (const filename of fs.readdirSync(__dirname).filter(f => f.endsWith('.html') && f !== 'studio.html')) {
    const filePath = path.join(__dirname, filename);
    let html = fs.readFileSync(filePath, 'utf8');
    const originalHtml = html;
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cardRegex = new RegExp('<article\\b[^>]*class=["\'][^"\']*\\bcard\\b[^"\']*["\'][^>]*>[\\s\\S]*?<a\\b[^>]*href=["\']works/' + escapedId + '\\.html["\'][^>]*>[\\s\\S]*?<\\/article>', 'gi');
    html = html.replace(cardRegex, '');
    const linkRegex = new RegExp('<a\\b[^>]*href=["\']works/' + escapedId + '\\.html["\'][^>]*>[\\s\\S]*?<\\/a>', 'gi');
    html = html.replace(linkRegex, '');

    html = html.replace(
      /window\.(?:WORKS|WORKS_DATA)\s*=\s*(\[[\s\S]*?\]);/g,
      (match, json) => {
        try {
          const items = JSON.parse(json);
          const filtered = items.filter(w => w?.id !== id);
          const varName = match.match(/window\.(WORKS|WORKS_DATA)/)?.[1] || 'WORKS';
          return 'window.' + varName + '=' + JSON.stringify(filtered).replace(/</g, '\\u003c') + ';';
        } catch (_) {
          return match;
        }
      }
    );
    html = html.replace(/<h2>\d+\s*部作品[，,]\s*等待被翻阅<\/h2>/g, '<h2>' + nextWorks.length + ' 部作品，等待被翻阅</h2>');
    if (html !== originalHtml) fs.writeFileSync(filePath, html, 'utf8');
  }

  return { success: true, deletedId: id, deletedName: target.name, totalWorks: nextWorks.length };
}

// 更新已有作品信息
export function updateExistingWork(workId, inputData) {
  const works = readWorksArray();
  const idx = works.findIndex(w => w.id === workId);
  if (idx === -1) {
    return { success: false, error: '未找到指定作品 ID' };
  }

  const target = works[idx];
  if (inputData.name) {
    const n = String(inputData.name).trim();
    target.name = n.startsWith('《') && n.endsWith('》') ? n : `《${n}》`;
  }
  if (inputData.platform !== undefined) target.platform = inputData.platform;
  if (inputData.status !== undefined) target.status = inputData.status;
  if (inputData.rating !== undefined) target.rating = inputData.rating;
  if (Array.isArray(inputData.tags)) target.tags = inputData.tags;
  if (inputData.characters !== undefined) target.characters = inputData.characters;
  target.updated = new Date().toLocaleDateString('zh-CN');

  // 封面变更
  let coverFileName = `${workId}.png`;
  const coverMap = readJsonSafe(COVER_MAPPING_FILE);
  if (coverMap[workId]?.file) coverFileName = coverMap[workId].file;

  if (inputData.coverImageBase64) {
    const savedName = saveCoverImage(workId, inputData.coverImageBase64);
    if (savedName) coverFileName = savedName;
    coverMap[workId] = { file: coverFileName };
    writeJsonSafe(COVER_MAPPING_FILE, coverMap);
  }

  const cropX = Number.isFinite(Number(inputData.cropX)) ? Number(inputData.cropX) : 50;
  const cropY = Number.isFinite(Number(inputData.cropY)) ? Number(inputData.cropY) : 20;
  const zoom = Number.isFinite(Number(inputData.zoom)) ? Number(inputData.zoom) : 100;

  const overridesMap = readJsonSafe(COVER_OVERRIDES_FILE);
  overridesMap[workId] = { x: cropX, y: cropY, zoom };
  writeJsonSafe(COVER_OVERRIDES_FILE, overridesMap);

  writeWorksArray(works);

  // 重新生成详情页
  const detailHtml = generateWorkDetailHtml(target, {
    playStatus: inputData.playStatus || '已游玩',
    playTime: inputData.playTime || '未设定',
    house: inputData.house || '未设定',
    sexuality: inputData.sexuality || 'bg',
    repoContent: inputData.repoContent || '',
    coverFileName,
    cropX,
    cropY,
    zoom
  });
  fs.writeFileSync(path.join(WORKS_DIR, `${workId}.html`), detailHtml, 'utf8');

  // 更新卡片
  injectWorkIntoHtml('works.html', target, coverFileName, cropX, cropY, zoom);
  injectWorkIntoHtml('index.html', target, coverFileName, cropX, cropY, zoom);

  return { success: true, work: target };
}

// 辅助 HTML 转义
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
