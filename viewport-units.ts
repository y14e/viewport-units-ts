/**
 * viewport-units.ts
 *
 * @version 1.0.0
 * @author Yusuke Kamiyamane
 * @license MIT
 * @copyright Copyright (c) 2026 Yusuke Kamiyamane
 * @see {@link https://github.com/y14e/viewport-units-ts}
 */

// =============================================================================
// APIs
// =============================================================================

export function updateViewportUnits(
  root: HTMLElement = document.documentElement,
): () => void {
  if (!(root instanceof HTMLElement)) {
    return () => {};
  }

  const html = document.documentElement;
  let timer: number | undefined;
  let lastVW: number | undefined;
  let lastVH: number | undefined;
  const isHorizontal = /^h/.test(
    getComputedStyle(html).getPropertyValue('writing-mode'),
  );

  function update() {
    timer = undefined;
    const vw = html.clientWidth / 100;
    const vh = html.clientHeight / 100;

    if (vw === lastVW && vh === lastVH) {
      return;
    }

    lastVW = vw;
    lastVH = vh;
    const { style } = root;
    style.setProperty('--vw', String(vw));
    style.setProperty('--vh', String(vh));
    style.setProperty('--vi', String(isHorizontal ? vw : vh));
    style.setProperty('--vb', String(isHorizontal ? vh : vw));
    style.setProperty('--vmin', String(Math.min(vw, vh)));
    style.setProperty('--vmax', String(Math.max(vw, vh)));
  }

  function onResize() {
    if (timer !== undefined) {
      return;
    }

    timer = requestAnimationFrame(update);
  }

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
