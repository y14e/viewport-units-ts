/**
 * viewport-units.ts
 *
 * @version 1.0.6
 * @author Yusuke Kamiyamane
 * @license MIT
 * @copyright Copyright (c) Yusuke Kamiyamane
 * @see {@link https://github.com/y14e/viewport-units-ts}
 */

// -----------------------------------------------------------------------------
// APIs
// -----------------------------------------------------------------------------

const initialized = new WeakMap<HTMLElement, void>();

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
  let timer: number | undefined;
  let lastVW: number | undefined;
  let lastVH: number | undefined;
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

    timer = requestAnimationFrame(step);
  }

  let controller: AbortController | null = new AbortController();
  const { signal } = controller;
  window.addEventListener('resize', onResize, { signal });
  window.visualViewport?.addEventListener('resize', onResize, { signal });
  let observer: ResizeObserver | null = new ResizeObserver(onResize);
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

    const { style } = root;
    style.removeProperty('--vw');
    style.removeProperty('--vh');
    style.removeProperty('--vi');
    style.removeProperty('--vb');
    style.removeProperty('--vmin');
    style.removeProperty('--vmax');
  };
}
