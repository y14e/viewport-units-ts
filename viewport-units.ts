export function updateViewportUnits(root: HTMLElement = document.documentElement): () => void {
  if (!root) {
    return () => {};
  }

  const html = document.documentElement;
  let timer: number | undefined;
  let cachedVW: number | undefined;
  let cachedVH: number | undefined;
  const isHorizontal = /^h/.test(getComputedStyle(html).getPropertyValue('writing-mode'));

  const update = () => {
    timer = undefined;
    const vw = html.clientWidth / 100;
    const vh = html.clientHeight / 100;

    if (vw === cachedVW && vh === cachedVH) {
      return;
    }

    cachedVW = vw;
    cachedVH = vh;
    const { style } = root;
    style.setProperty('--vw', String(vw));
    style.setProperty('--vh', String(vh));
    style.setProperty('--vi', String(isHorizontal ? vw : vh));
    style.setProperty('--vb', String(isHorizontal ? vh : vw));
    style.setProperty('--vmin', String(Math.min(vw, vh)));
    style.setProperty('--vmax', String(Math.max(vw, vh)));
  };

  const onResize = () => {
    if (timer !== undefined) {
      return;
    }

    timer = requestAnimationFrame(update);
  };

  const controller = new AbortController();
  const { signal } = controller;
  window.addEventListener('resize', onResize, { signal });
  window.visualViewport?.addEventListener('resize', onResize, { signal });
  let observer: ResizeObserver | null = new ResizeObserver(onResize);
  observer.observe(html);
  onResize();
  return () => {
    controller.abort();
    observer?.disconnect();
    observer = null;

    if (timer !== undefined) {
      cancelAnimationFrame(timer);
      timer = undefined;
    }

    const { style } = root;
    style.removeProperty('--vw');
    style.removeProperty('--vh');
    style.removeProperty('--vi');
    style.removeProperty('--vb');
    style.removeProperty('--vmin');
    style.removeProperty('--vmax');
  };
}
