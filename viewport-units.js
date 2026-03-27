export function updateViewportUnits(root = document.documentElement) {
  if (!root) {
    return () => {};
  }
  let timer = 0;
  const html = document.documentElement;
  const horizontal = /^h/.test(getComputedStyle(html).getPropertyValue('writing-mode'));
  const update = () => {
    if (timer) {
      return;
    }
    timer = requestAnimationFrame(() => {
      timer = 0;
      const width = html.clientWidth / 100;
      const height = html.clientHeight / 100;
      root.style.setProperty('--vw', String(width));
      root.style.setProperty('--vh', String(height));
      root.style.setProperty('--vi', String(horizontal ? width : height));
      root.style.setProperty('--vb', String(horizontal ? height : width));
      root.style.setProperty('--vmin', String(Math.min(width, height)));
      root.style.setProperty('--vmax', String(Math.max(width, height)));
    });
  };
  const controller = new AbortController();
  const { signal } = controller;
  window.addEventListener('resize', update, { signal });
  window.visualViewport?.addEventListener('resize', update, { signal });
  const observer = new ResizeObserver(update);
  observer.observe(html);
  document.fonts.ready.then(update);
  update();
  return () => {
    controller.abort();
    observer.disconnect();
    if (timer) {
      cancelAnimationFrame(timer);
    }
  };
}
