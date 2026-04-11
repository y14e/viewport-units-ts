export function updateViewportUnits(root: HTMLElement = document.documentElement): () => void {
  if (!root) {
    return () => {};
  }
  let timer: ReturnType<typeof requestAnimationFrame> | null = null;
  let cachedVW: number | undefined;
  let cachedVH: number | undefined;
  const html = document.documentElement;
  const horizontal = /^h/.test(getComputedStyle(html).getPropertyValue('writing-mode'));
  const update = () => {
    if (timer !== null) {
      return;
    }
    timer = requestAnimationFrame(() => {
      timer = null;
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
  let controller: AbortController | null = new AbortController();
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
    if (timer) {
      cancelAnimationFrame(timer);
      timer = null;
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
