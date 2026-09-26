/**
 * REAL-TIME FUZZY SEARCH AUTOCOMPLETE & SUGGESTIONS
 * 根据作品名、分类标签、攻略角色名称实时模糊匹配联想列表
 * 《閲読器作品記録》 · keyanrenshi.xyz
 */
(() => {
  const inWorksDir = /\/works\/work-\d+\.html$/i.test(location.pathname);
  const root = inWorksDir ? '../' : './';

  // 确保样式文件存在
  if (!document.querySelector('link[href*="search-autocomplete.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = root + 'search-autocomplete.css';
    document.head.appendChild(link);
  }

  let indexBuilt = false;
  let allWorks = [];
  let tagIndex = []; // { name: string, count: number }
  let charIndex = []; // { name: string, count: number }

  function buildSearchIndex() {
    if (indexBuilt && allWorks.length > 0) return;

    allWorks = window.WORKS || window.WORKS_DATA || window.STORY_SEARCH || [];
    if (!allWorks.length) return;

    const tagCountMap = new Map();
    const charCountMap = new Map();

    allWorks.forEach(w => {
      // 提取标签
      (w.tags || []).forEach(t => {
        t = t.trim();
        if (!t) return;
        tagCountMap.set(t, (tagCountMap.get(t) || 0) + 1);
      });

      // 提取攻略/核心角色
      if (w.characters) {
        w.characters.split(/[,，、\s]+/).forEach(c => {
          c = c.trim();
          if (!c || c.length < 2) return;
          charCountMap.set(c, (charCountMap.get(c) || 0) + 1);
        });
      }
    });

    tagIndex = Array.from(tagCountMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    charIndex = Array.from(charCountMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    indexBuilt = true;
  }

  // 辅助：转义正则特殊字符
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // 辅助：高亮匹配文字
  function highlightText(text, keyword) {
    if (!keyword || !keyword.trim()) return text;
    try {
      const reg = new RegExp(`(${escapeRegExp(keyword)})`, 'gi');
      return text.replace(reg, '<mark class="ac-hl">$1</mark>');
    } catch (e) {
      return text;
    }
  }

  // 核心联想搜索算法
  function findSuggestions(queryStr) {
    buildSearchIndex();
    const q = queryStr.trim().toLowerCase();
    if (!q) return null;

    // 1. 匹配标签 (Tag Matches)
    const matchedTags = tagIndex
      .filter(item => {
        const lower = item.name.toLowerCase();
        return lower.includes(q) || q.includes(lower);
      })
      .slice(0, 4);

    // 2. 匹配攻略角色 (Character Matches)
    const matchedChars = charIndex
      .filter(item => {
        const lower = item.name.toLowerCase();
        return lower.includes(q) || q.includes(lower);
      })
      .slice(0, 4);

    // 3. 匹配作品 (Work Matches: 作品名优先，其次角色与标签)
    const scoredWorks = allWorks.map(w => {
      let score = 0;
      const lowerName = w.name.toLowerCase();
      const lowerChars = (w.characters || '').toLowerCase();
      const lowerTags = (w.tags || []).join(' ').toLowerCase();

      // 作品标题匹配权重最高
      if (lowerName.includes(q)) score += 50;
      if (lowerName.startsWith(q) || lowerName.includes(`《${q}`)) score += 30;

      // 角色匹配
      if (lowerChars.includes(q)) score += 20;

      // 标签匹配
      if (lowerTags.includes(q)) score += 15;

      return { work: w, score };
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(entry => entry.work);

    return {
      query: q,
      tags: matchedTags,
      characters: matchedChars,
      works: scoredWorks,
      totalCount: matchedTags.length + matchedChars.length + scoredWorks.length
    };
  }

  // 挂载自动联想框到一个输入框上
  function attachAutocomplete(input) {
    if (!input || input.dataset.hasAutocomplete) return;
    input.dataset.hasAutocomplete = '1';

    // 确保外层有 relative 定位
    let parent = input.parentElement;
    if (parent && !parent.classList.contains('search-autocomplete-wrapper')) {
      parent.classList.add('search-autocomplete-wrapper');
    }

    // 创建下拉提示层
    const dropdown = document.createElement('div');
    dropdown.className = 'search-autocomplete-dropdown';
    parent.appendChild(dropdown);

    let focusedIndex = -1;
    let currentItems = [];

    function closeDropdown() {
      dropdown.classList.remove('is-open');
      dropdown.innerHTML = '';
      focusedIndex = -1;
      currentItems = [];
    }

    function renderDropdown(data) {
      if (!data || data.totalCount === 0) {
        dropdown.innerHTML = `
          <div class="ac-empty">
            <p>未找到关于「<b>${data ? data.query : ''}</b>」的直接联想</p>
            <small>按 Enter 键可执行全局模糊检索</small>
          </div>
        `;
        dropdown.classList.add('is-open');
        return;
      }

      let html = '';
      const itemsList = [];

      // 分类 1: 标签匹配
      if (data.tags.length > 0) {
        html += `
          <div class="ac-category">
            <div class="ac-category-header">
              <span>分类与标签</span>
              <span>${data.tags.length} 个标签</span>
            </div>
        `;
        data.tags.forEach(t => {
          itemsList.push({ type: 'tag', value: t.name });
          html += `
            <div class="ac-item" data-ac-type="tag" data-ac-value="${t.name}">
              <div class="ac-item-left">
                <span class="ac-item-kind ac-item-kind--tag">标签</span>
                <div class="ac-item-text">
                  <span class="ac-item-title">${highlightText(t.name, data.query)}</span>
                  <span class="ac-item-meta">点击查看该标签下的全部作品</span>
                </div>
              </div>
              <div class="ac-item-right">
                <span class="ac-badge">${t.count} 部作品</span>
              </div>
            </div>
          `;
        });
        html += `</div>`;
      }

      // 分类 2: 攻略角色匹配
      if (data.characters.length > 0) {
        html += `
          <div class="ac-category">
            <div class="ac-category-header">
              <span>登场与攻略角色</span>
              <span>${data.characters.length} 位角色</span>
            </div>
        `;
        data.characters.forEach(c => {
          itemsList.push({ type: 'char', value: c.name });
          html += `
            <div class="ac-item" data-ac-type="char" data-ac-value="${c.name}">
              <div class="ac-item-left">
                <span class="ac-item-kind ac-item-kind--char">角色</span>
                <div class="ac-item-text">
                  <span class="ac-item-title">${highlightText(c.name, data.query)}</span>
                  <span class="ac-item-meta">攻略对象 · 核心出场</span>
                </div>
              </div>
              <div class="ac-item-right">
                <span class="ac-badge">${c.count} 部作品</span>
              </div>
            </div>
          `;
        });
        html += `</div>`;
      }

      // 分类 3: 匹配具体作品
      if (data.works.length > 0) {
        html += `
          <div class="ac-category">
            <div class="ac-category-header">
              <span>作品档案直达</span>
              <span>${data.works.length} 部记录</span>
            </div>
        `;
        data.works.forEach(w => {
          const detailUrl = `${root}works/${w.id}.html`;
          const metaStr = [w.platform || '同人', w.status, w.rating].filter(Boolean).join(' · ');
          itemsList.push({ type: 'work', value: w.name, id: w.id });

          html += `
            <div class="ac-item" data-ac-type="work" data-ac-value="${w.name}" data-ac-id="${w.id}">
              <div class="ac-item-left">
                <span class="ac-item-kind ac-item-kind--work">档案</span>
                <div class="ac-item-text">
                  <span class="ac-item-title">${highlightText(w.name, data.query)}</span>
                  <span class="ac-item-meta">${metaStr}</span>
                </div>
              </div>
              <div class="ac-item-right">
                <a href="${detailUrl}" class="ac-jump-btn" title="查看详情 Repo">Repo ↗</a>
              </div>
            </div>
          `;
        });
        html += `</div>`;
      }

      // 底部操作提示
      html += `
        <div class="ac-footer">
          <span>↑↓ 方向键选择 · Enter 确认</span>
          <span>Esc 关闭联想</span>
        </div>
      `;

      dropdown.innerHTML = html;
      currentItems = itemsList;
      focusedIndex = -1;
      dropdown.classList.add('is-open');

      // 绑定单项点击事件
      dropdown.querySelectorAll('.ac-item').forEach(el => {
        el.addEventListener('click', (e) => {
          // 如果点击的是 Repo ↗ 跳转链接，则不拦截默认点击
          if (e.target.closest('.ac-jump-btn')) return;

          const type = el.dataset.acType;
          const val = el.dataset.acValue;
          selectSuggestion(val, type, el.dataset.acId);
        });
      });
    }

    function selectSuggestion(val, type, id) {
      input.value = val;
      // 触发原生 input 与 change 事件以驱动页面现存的检索逻辑
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));

      // 如果有父级表单并且不是主作品一览页的直接过滤，触发提交
      const form = input.closest('form');
      if (form && input.id === 'story-query') {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }

      closeDropdown();
      input.focus();
    }

    // 防抖处理输入事件
    let timer = null;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      const val = input.value;
      if (!val || !val.trim()) {
        closeDropdown();
        return;
      }
      timer = setTimeout(() => {
        const res = findSuggestions(val);
        renderDropdown(res);
      }, 70);
    });

    // 聚焦时若有内容重新打开
    input.addEventListener('focus', () => {
      if (input.value && input.value.trim()) {
        const res = findSuggestions(input.value);
        renderDropdown(res);
      }
    });

    // 键盘上下导航支持
    input.addEventListener('keydown', (e) => {
      if (!dropdown.classList.contains('is-open') || currentItems.length === 0) return;

      const itemEls = dropdown.querySelectorAll('.ac-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        focusedIndex = (focusedIndex + 1) % itemEls.length;
        updateFocus(itemEls);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        focusedIndex = (focusedIndex - 1 + itemEls.length) % itemEls.length;
        updateFocus(itemEls);
      } else if (e.key === 'Enter') {
        if (focusedIndex >= 0 && focusedIndex < itemEls.length) {
          e.preventDefault();
          const target = itemEls[focusedIndex];
          selectSuggestion(target.dataset.acValue, target.dataset.acType, target.dataset.acId);
        }
      } else if (e.key === 'Escape') {
        closeDropdown();
      }
    });

    function updateFocus(itemEls) {
      itemEls.forEach((el, idx) => {
        el.classList.toggle('is-focused', idx === focusedIndex);
        if (idx === focusedIndex) {
          el.scrollIntoView({ block: 'nearest' });
        }
      });
    }

    // 点击外部自动关闭
    document.addEventListener('click', (e) => {
      if (!parent.contains(e.target)) {
        closeDropdown();
      }
    });
  }

  // 初始化扫描所有可能存在的搜索框
  function initAllInputs() {
    buildSearchIndex();
    const selectors = ['#search', '#story-query', '#fav-drawer-search'];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(input => {
        attachAutocomplete(input);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initAllInputs();
    setTimeout(initAllInputs, 150);
  });

  window.attachSearchAutocomplete = attachAutocomplete;
})();
