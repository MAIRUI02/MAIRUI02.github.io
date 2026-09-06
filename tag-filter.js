document.addEventListener('DOMContentLoaded', () => {
  const applyTag = value => {
    const input = document.getElementById('search');
    if (!input) return;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles:true }));
    document.getElementById('works')?.scrollIntoView({ behavior:'smooth', block:'start' });
  };
  const selected = new URLSearchParams(location.search).get('tag');
  if (selected && document.body.dataset.archiveView === 'works') setTimeout(() => applyTag(selected), 60);
  document.addEventListener('click', event => {
    const chip = event.target.closest('.card .chips span');
    if (!chip) return;
    event.preventDefault();
    event.stopPropagation();
    const value = chip.textContent.trim();
    if (document.body.dataset.archiveView === 'works') applyTag(value);
    else location.href = `works.html?tag=${encodeURIComponent(value)}`;
  });
});
