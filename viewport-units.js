export function updateViewportUnits(root = document.documentElement) {
  if (!root) return () => {};
  let timer = 0;
  let cacheVW;
  let cacheVH;
  const html = document.documentElement;
  const horizontal = /^h/.test(getComputedStyle(html).getPropertyValue('writing-mode'));
  const update = () => {
    if (timer) return;
    timer = requestAnimationFrame(() => {
      timer = 0;
      const vw = html.clientWidth / 100;
      const vh = html.clientHeight / 100;
      if (vw === cacheVW && vh === cacheVH) return;
      cacheVW = vw;
      cacheVH = vh;
      root.style.setProperty('--vw', String(vw));
      root.style.setProperty('--vh', String(vh));
      root.style.setProperty('--vi', String(horizontal ? vw : vh));
      root.style.setProperty('--vb', String(horizontal ? vh : vw));
      root.style.setProperty('--vmin', String(Math.min(vw, vh)));
      root.style.setProperty('--vmax', String(Math.max(vw, vh)));
    });
  };
  const controller = new AbortController();
  const { signal } = controller;
  window.addEventListener('resize', update, { signal });
  window.visualViewport?.addEventListener('resize', update, { signal });
  const observer = new ResizeObserver(update);
  observer.observe(html);
  update();
  return () => {
    if (timer) {
      cancelAnimationFrame(timer);
    }
    controller.abort();
    observer.disconnect();
    ['--vw', '--vh', '--vi', '--vb', '--vmin', '--vmax'].forEach((name) => root.style.removeProperty(name));
  };
}
