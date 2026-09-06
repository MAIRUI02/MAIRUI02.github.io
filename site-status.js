/* 修改引号里的作品名；重新部署后公告板会同步给所有访客。 */
window.SITE_STATUS = {
  currentWork: '《待补充作品名》',
  source: 'https://gist.githubusercontent.com/MAIRUI02/eb4227c706ad0c902f40bb7eba421efd/raw/status.json'
};

document.addEventListener('DOMContentLoaded', async () => {
  const target = document.getElementById('current-work');
  if (!target) return;
  target.textContent = window.SITE_STATUS.currentWork;
  try {
    const response = await fetch(`${window.SITE_STATUS.source}?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return;
    const status = await response.json();
    if (status.currentWork) target.textContent = status.currentWork;
  } catch { /* 静态部署时保留备用内容。 */ }
});
