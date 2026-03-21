export function updateViewportUnits(root: HTMLElement = document.documentElement): () => void {
  if (!root) {
    return () => {};
  }
  const html = document.documentElement;
  let timer = 0;
  const update = () => {
    if (timer) {
      return;
    }
    timer = requestAnimationFrame(() => {
      timer = 0;
      const horizontal = /^h/.test(getComputedStyle(html).getPropertyValue('writing-mode'));
      const width = html.clientWidth / 100;
      const height = html.clientHeight / 100;
      Object.entries({
        '--vw': String(width),
        '--vh': String(height),
        '--vi': String(horizontal ? width : height),
        '--vb': String(horizontal ? height : width),
        '--vmin': String(Math.min(width, height)),
        '--vmax': String(Math.max(width, height)),
      }).forEach(([name, value]) => root.style.setProperty(name, value));
    });
  };
  const controller = new AbortController();
  const { signal } = controller;
  ['load', 'resize'].forEach((event) => window.addEventListener(event, update, { signal }));
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
