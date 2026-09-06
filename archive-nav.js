document.addEventListener('DOMContentLoaded', () => {
  const navConfig = window.ARCHIVE_NAV || {};
  document.querySelectorAll('[data-nav-key]').forEach(item => {
    const setting = navConfig[item.dataset.navKey];
    if (!setting) return;
    item.querySelector('.archive-nav__icon').textContent = setting.icon || '';
    // 页面本身的文字是来源；配置文件只负责馆主以后想换的小图标，避免旧缓存覆盖新版导航名称。
    const label = item.dataset.tooltip || setting.label || '导航';
    item.querySelector('.archive-nav__label').textContent = label;
    item.setAttribute('aria-label', label);
  });
  const search = document.getElementById('search');
  const view = document.body.dataset.archiveView;
  if (search && view === 'hp') { search.value = 'HP'; search.dispatchEvent(new Event('input', {bubbles:true})); }
  if (search && view === 'celebrity') { search.value = '真人区'; search.dispatchEvent(new Event('input', {bubbles:true})); }
  if (new URLSearchParams(location.search).has('search')) setTimeout(() => search?.focus(), 100);
  if (view === 'random') setTimeout(() => document.getElementById('random')?.click(), 100);
  document.querySelectorAll('[data-archive-filter]').forEach(link => link.addEventListener('click', () => {
    if (!search) return;
    search.value = link.dataset.archiveFilter;
    search.dispatchEvent(new Event('input', {bubbles:true}));
  }));
  document.querySelector('[data-archive-draw]')?.addEventListener('click', () => document.getElementById('random')?.click());
  document.querySelector('[data-archive-search]')?.addEventListener('click', () => setTimeout(() => search?.focus(), 350));
});
