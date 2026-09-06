document.addEventListener('DOMContentLoaded', () => {
  const buttons = [...document.querySelectorAll('[data-house]')];
  const results = [...document.querySelectorAll('[data-house-results]')];
  const hint = document.getElementById('express-hint');
  const showHouse = key => {
    buttons.forEach(button => button.classList.toggle('is-selected', button.dataset.house === key));
    results.forEach(section => section.hidden = section.dataset.houseResults !== key);
    const title = document.querySelector(`[data-house="${key}"] .house-ticket__name`)?.textContent || '';
    if (hint) hint.textContent = `已加入 ${title} 学院。`;
    document.querySelector(`[data-house-results="${key}"]`)?.scrollIntoView({ behavior:'smooth', block:'start' });
  };
  buttons.forEach(button => button.addEventListener('click', () => showHouse(button.dataset.house)));
});
