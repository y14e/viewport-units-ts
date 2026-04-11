export function updateViewportUnits(root = document.documentElement) {
  if (!root) {
    return () => {};
  }
  let timer;
  let cachedVW;
  let cachedVH;
  const html = document.documentElement;
  const horizontal = /^h/.test(getComputedStyle(html).getPropertyValue('writing-mode'));
  const update = () => {
    if (timer !== undefined) {
      return;
    }
    timer = requestAnimationFrame(() => {
      timer = undefined;
      const vw = html.clientWidth / 100;
      const vh = html.clientHeight / 100;
      if (vw === cachedVW && vh === cachedVH) {
        return;
      }
      cachedVW = vw;
      cachedVH = vh;
      const style = root.style;
      style.setProperty('--vw', String(vw));
      style.setProperty('--vh', String(vh));
      style.setProperty('--vi', String(horizontal ? vw : vh));
      style.setProperty('--vb', String(horizontal ? vh : vw));
      style.setProperty('--vmin', String(Math.min(vw, vh)));
      style.setProperty('--vmax', String(Math.max(vw, vh)));
    });
  };
  let controller = new AbortController();
  const { signal } = controller;
  window.addEventListener('resize', update, { signal });
  window.visualViewport?.addEventListener('resize', update, { signal });
  const observer = new ResizeObserver(update);
  observer.observe(html);
  update();
  return () => {
    controller?.abort();
    controller = null;
    observer.disconnect();
    if (timer !== undefined) {
      cancelAnimationFrame(timer);
      timer = undefined;
    }
    const style = root.style;
    style.removeProperty('--vw');
    style.removeProperty('--vh');
    style.removeProperty('--vi');
    style.removeProperty('--vb');
    style.removeProperty('--vmin');
    style.removeProperty('--vmax');
  };
}
