export function updateViewportUnits(root = document.documentElement) {
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
  const events = ['load', 'orientationchange', 'resize'];
  events.forEach((event) => window.addEventListener(event, update));
  window.visualViewport?.addEventListener('resize', update);
  const observer = new ResizeObserver(update);
  observer.observe(html);
  document.fonts.ready.then(update);
  update();
  return () => {
    events.forEach((event) => window.removeEventListener(event, update));
    window.visualViewport?.removeEventListener('resize', update);
    observer.disconnect();
    if (timer) {
      cancelAnimationFrame(timer);
    }
  };
}
