document.addEventListener('DOMContentLoaded', () => {
  const records = window.STORY_SEARCH || [];
  const form = document.getElementById('story-search-form');
  const input = document.getElementById('story-query');
  const grid = document.getElementById('story-result-grid');
  const title = document.getElementById('search-result-title');
  const note = document.getElementById('search-result-note');
  const intent = { 恋爱:['恋爱','恋综','bg','gl','爱情','言情'], 虐:['虐','虐心虐身','致郁','复仇'], 剧情:['悬疑','推理','正剧','大逃杀','无限流','原著'], 轻松:['日常','温馨'], 骨科:['骨科','含骨科（假骨）'], HP:['hp','哈利','霍格沃茨','蛇院','狮院','鹰院','獾院'] };
  const haystack = item => `${item.name} ${item.tags.join(' ')} ${item.characters} ${item.platform}`.toLowerCase();
  const render = (list, heading, detail) => { title.textContent = heading; note.textContent = detail; grid.innerHTML = list.length ? list.slice(0,18).map(item => item.card).join('') : '<div class="search-empty"><p>这一回没有找到很贴近的记录。</p><p>试试作品名、角色名，或回到 <a href="works.html">作品一览</a> 使用完整筛选。</p></div>'; };
  const query = raw => {
    const value = raw.trim();
    if (value === '__random__') { const shuffled=[...records].sort(()=>Math.random()-.5).slice(0,6); render(shuffled,'随机翻出几本','不问偏好，交给一点随机的缘分。'); return; }
    const lowered = value.toLowerCase();
    const inferred = Object.entries(intent).filter(([key, words]) => lowered.includes(key.toLowerCase()) || words.some(word => lowered.includes(word.toLowerCase()))).flatMap(([,words]) => words);
    const terms = [...new Set([...value.split(/[，,、\s]+/).filter(Boolean), ...inferred])].map(term => term.toLowerCase());
    const scored = records.map(item => ({item, score:terms.reduce((score, term) => score + (haystack(item).includes(term) ? 3 : 0),0) + (haystack(item).includes(lowered) ? 8 : 0)})).filter(entry=>entry.score).sort((a,b)=>b.score-a.score).map(entry=>entry.item);
    render(scored, value ? `为「${value}」找到的故事` : '说说你想找的故事吧', value ? `从作品名、标签和攻略角色中找到了 ${scored.length} 部可能合适的作品。` : '检索台会从馆主的作品档案中，为你翻出可能合适的记录。');
  };
  form.addEventListener('submit', event => { event.preventDefault(); query(input.value); });
  document.querySelectorAll('[data-prompt]').forEach(button => button.addEventListener('click', () => { input.value = button.dataset.prompt === '__random__' ? '' : button.dataset.prompt; query(button.dataset.prompt); }));
});
