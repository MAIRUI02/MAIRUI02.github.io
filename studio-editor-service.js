import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';
import { readWorksArray, writeWorksArray, saveCoverImage, syncWorkToCelebrity, syncMasterworksLibrary } from './admin-service.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const readMap = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const writeMap = (name, data) => fs.writeFileSync(path.join(root, name), JSON.stringify(data, null, 2) + '\n');
export const playStatuses = ['待读清单', '在读', '追平', '通关单线但仍有心仪分线，等待下周目', '读完', '弃游'];
const fields = { platform: '平台', status: '作品状态', playStatus: '游玩状态', characters: '攻略角色', sexuality: '性向', house: '主角学院', playTime: '游玩时长' };
const escape = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function readTagLibrary() {
  const file = path.join(root, 'studio-tags.json');
  const saved = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
  return [...new Set([...saved, ...readWorksArray().flatMap(w => w.tags || [])].map(t => String(t).trim()).filter(Boolean))].sort((a,b) => a.localeCompare(b, 'zh-CN'));
}
export function saveTag(tag) {
  const value = String(tag || '').trim();
  if (!value || value.length > 100) throw new Error('标签需要 1–100 个字符');
  const tags = [...new Set([...readTagLibrary(), value])];
  writeMap('studio-tags.json', tags);
  return tags;
}

export function readEditableWork(id) {
  const work = readWorksArray().find(w => w.id === id);
  if (!work) return null;
  const html = fs.readFileSync(path.join(root, 'works', id + '.html'), 'utf8');
  const $ = load(html);
  const result = { ...work };
  for (const [key, label] of Object.entries(fields)) {
    const dt = $('.facts dt').filter((i, el) => $(el).text().trim() === label).first();
    result[key] = dt.length ? dt.next('dd').text() : (work[key] || '');
  }
  const img = $('.work-head .cover img').first();
  const mapping = readMap('new-cover-mapping.json')[id];
  const style = img.attr('style') || '';
  const pos = style.match(/object-position:\s*([\d.]+)%\s+([\d.]+)%/);
  const scale = style.match(/scale\(([\d.]+)\)/);
  const crop = readMap('cover-overrides.json')[id] || {};
  result.cropX = crop.x ?? Number(pos?.[1] ?? 50);
  result.cropY = crop.y ?? Number(pos?.[2] ?? 20);
  result.zoom = crop.zoom ?? Math.round(Number(scale?.[1] ?? 1) * 100);
  result.coverUrl = mapping?.file ? 'assets/covers/' + encodeURIComponent(mapping.file) : (img.attr('src') || '').replace(/^\.\.\//, '');
  const repo = $('article.repo').first().clone();
  repo.children('.kicker, h1').remove();
  result.repoHtml = repo.html() || '';
  return result;
}

function safeRepo(html) {
  const $ = load(String(html), null, false);
  $('script,iframe,object,embed,style,link,meta,base,form,input,button').remove();
  $('*').each((i, el) => {
    for (const [name, value] of Object.entries(el.attribs || {})) {
      if (/^on/i.test(name) || name === 'srcdoc' || (['href','src','xlink:href'].includes(name) && /^\s*(javascript|vbscript|data):/i.test(value))) $(el).removeAttr(name);
    }
  });
  return $.html();
}

export function editExistingWork(id, input) {
  const original = readEditableWork(id);
  if (!original) return { success: false, error: '未找到作品' };
  if (input.playStatus !== undefined && !playStatuses.includes(input.playStatus)) return { success: false, error: '请选择六种游玩状态之一' };
  const data = { ...original, ...input };
  if (!String(data.name).trim()) return { success: false, error: '作品名不能为空' };
  for (const [key, max] of [['cropX',100],['cropY',100],['zoom',155]]) {
    if (!Number.isFinite(Number(data[key])) || Number(data[key]) < (key === 'zoom' ? 100 : 0) || Number(data[key]) > max) return { success: false, error: '封面微调数值无效' };
  }
  const works = readWorksArray();
  const work = works.find(w => w.id === id);
  for (const key of ['name','platform','status','rating','tags','characters','playStatus','playTime','house','sexuality']) if (data[key] !== undefined) work[key] = data[key];
  work.updated = new Date().toLocaleDateString('zh-CN');
  const mapping = readMap('new-cover-mapping.json');
  if (input.coverImageBase64) {
    const filename = saveCoverImage(id, input.coverImageBase64);
    mapping[id] = { file: filename };
    writeMap('new-cover-mapping.json', mapping);
    data.coverUrl = 'assets/covers/' + encodeURIComponent(filename);
  }
  const overrides = readMap('cover-overrides.json');
  overrides[id] = { x:Number(data.cropX), y:Number(data.cropY), zoom:Number(data.zoom) };
  const detailPath = path.join(root, 'works', id + '.html');
  const $ = load(fs.readFileSync(detailPath, 'utf8'));
  $('title').text(work.name + '｜閲読器作品記録');
  $('.work-head h1').text(work.name);
  $('.work-head .stars').text(work.rating || '').attr('aria-label', '推荐指数 ' + (work.rating || '暂无评分'));
  $('.work-head .chips').html((work.tags || []).map(t => '<span>' + escape(t) + '</span>').join(''));
  for (const [key, label] of Object.entries({...fields, tags:'游戏标签'})) {
    const value = key === 'tags' ? (data.tags || []).join(', ') : data[key];
    const dt = $('.facts dt').filter((i, el) => $(el).text().trim() === label).first();
    if (dt.length) dt.next('dd').text(value || '');
    else if (value) $('.facts').append('<dt>' + label + '</dt><dd>' + escape(value) + '</dd>');
  }
  const cropStyle = `object-position:${data.cropX}% ${data.cropY}%;transform-origin:${data.cropX}% ${data.cropY}%;transform:scale(${Number(data.zoom)/100});`;
  if (data.coverUrl) {
    const cover = $('.work-head .cover');
    if (!cover.find('img').length) cover.empty().append('<img>');
    cover.removeClass('fallback').addClass('verified').find('img').attr('src', '../' + data.coverUrl).attr('style', cropStyle);
  }
  // Leave the existing article untouched unless the editor changed its body.
  if (input.repoHtml !== undefined && input.repoHtml !== original.repoHtml) {
    $('article.repo').html('<p class="kicker">REPO / PLAY NOTES</p><h1>' + escape(work.name) + ' Repo</h1>' + safeRepo(input.repoHtml));
  }
  if (!$('script[src="../cover-mapping.js"]').length) $('body').append('<script src="../cover-mapping.js"></script>');
  const writes = [[detailPath, $.html()]];
  // Update existing placements without adding the work to unrelated categories.
  for (const filename of fs.readdirSync(root).filter(f => f.endsWith('.html') && f !== 'studio.html')) {
    const file = path.join(root, filename), html = fs.readFileSync(file, 'utf8');
    if (!html.includes('works/' + id + '.html')) continue;
    const page = load(html);
    page(`a[href="works/${id}.html"]`).each((i, el) => {
      const card = page(el).closest('.card');
      if (!card.length) return;
      card.find('h3').text(work.name);
      card.find('.eyebrow').text((work.platform || '') + ' · ' + (work.status || ''));
      card.find('.stars').text(work.rating || '').attr('aria-label', '推荐指数 ' + (work.rating || '暂无评分'));
      card.find('.chips').html((work.tags || []).map(t => '<span>' + escape(t) + '</span>').join(''));
      if (data.coverUrl) {
        const cover = card.find('.cover');
        if (!cover.find('img').length) cover.empty().append('<img>');
        cover.removeClass('fallback').addClass('verified').find('img').attr('src', data.coverUrl).attr('style', cropStyle);
      }
    });
    page('script:not([src])').each((i, el) => {
      const text = page(el).html() || '';
      const match = text.match(/^\s*window\.WORKS\s*=\s*(\[[\s\S]*\]);?\s*$/);
      if (match) {
        const items = JSON.parse(match[1]);
        const idx = items.findIndex(w => w.id === id);
        if (idx !== -1) items[idx] = work;
        page(el).text('window.WORKS=' + JSON.stringify(items).replace(/</g, '\\u003c') + ';');
      }
    });
    writes.push([file, page.html()]);
  }
  writeWorksArray(works);
  writeMap('cover-overrides.json', overrides);
  for (const [file, html] of writes) fs.writeFileSync(file, html);
  syncWorkToCelebrity(work, { cropX: data.cropX, cropY: data.cropY, zoom: data.zoom });
  syncMasterworksLibrary();
  return { success:true, work, detailUrl:'works/' + id + '.html' };
}
