/**
 * viewport-units.ts
 *
 * @version 1.0.8
 * @author Yusuke Kamiyamane
 * @license MIT
 * @copyright Copyright (c) Yusuke Kamiyamane
 * @see {@link https://github.com/y14e/viewport-units-ts}
 */
// -----------------------------------------------------------------------------
// APIs
// -----------------------------------------------------------------------------
const initialized = new WeakMap();
export function updateViewportUnits(root = document.documentElement) {
  if (!(root instanceof HTMLElement)) {
    console.warn(
      `Invalid root element. Fallback: <${document.documentElement.tagName.toLowerCase()}> element.`,
    );
    root = document.documentElement;
  }
  if (initialized.has(root)) {
    console.warn('Already initialized');
    return () => {};
  }
  const html = document.documentElement;
  let timer;
  let lastVW;
  let lastVH;
  const isHorizontal = /^h/.test(
    getComputedStyle(html).getPropertyValue('writing-mode'),
  );
  function step() {
    timer = undefined;
    const vw = html.clientWidth / 100;
    const vh = html.clientHeight / 100;
    if (vw === lastVW && vh === lastVH) {
      return;
    }
    lastVW = vw;
    lastVH = vh;
    for (const [name, value] of Object.entries({
      vw: vw,
      vh: vh,
      vi: isHorizontal ? vw : vh,
      vb: isHorizontal ? vh : vw,
      vmin: Math.min(vw, vh),
      vmax: Math.max(vw, vh),
    })) {
      root.style.setProperty(`--${name}`, String(value));
    }
  }
  function onResize() {
    if (timer !== undefined) {
      return;
    }
    timer = requestAnimationFrame(step);
  }
  let controller = new AbortController();
  const { signal } = controller;
  window.addEventListener('resize', onResize, { signal });
  window.visualViewport?.addEventListener('resize', onResize, { signal });
  let observer = new ResizeObserver(onResize);
  observer.observe(html);
  onResize();
  initialized.set(root);
  return () => {
    controller?.abort();
    controller = null;
    observer?.disconnect();
    observer = null;
    if (timer !== undefined) {
      cancelAnimationFrame(timer);
      timer = undefined;
    }
    ['vw', 'vh', 'vi', 'vb', 'vmin', 'vmax'].forEach((name) => {
      root.style.removeProperty(`--${name}`);
    });
  };
}
