(() => {
  const improve = () => document.querySelectorAll('.item').forEach(item => {
    if (item.dataset.livePreviewReady) return;
    const x = item.querySelector('.x'), y = item.querySelector('.y'), preview = item.querySelector('.preview');
    if (!x || !y || !preview) return;
    item.dataset.livePreviewReady = 'true';
    const label = document.createElement('label');
    label.innerHTML = '缩放（放大后可看见裁剪位置）<input class="zoom" type="range" min="100" max="150" value="100"><output>100%</output>';
    item.append(label);
    const zoom = label.querySelector('.zoom'), output = label.querySelector('output');
    const update = () => {
      const image = preview.querySelector('img');
      if (!image) return;
      output.textContent = `${zoom.value}%`;
      image.style.objectPosition = `${x.value}% ${y.value}%`;
      image.style.transformOrigin = `${x.value}% ${y.value}%`;
      image.style.transform = `scale(${Number(zoom.value) / 100})`;
    };
    [x, y, zoom].forEach(control => control.addEventListener('input', update));
    update();
  });
  const list = document.getElementById('list');
  new MutationObserver(improve).observe(list, {childList:true, subtree:true});
  improve();
})();
