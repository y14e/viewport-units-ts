/**
 * viewport-units.ts
 *
 * @version 1.0.11
 * @author Yusuke Kamiyamane
 * @license MIT
 * @copyright Copyright (c) Yusuke Kamiyamane
 * @see {@link https://github.com/y14e/viewport-units-ts}
 */

// -----------------------------------------------------------------------------
// APIs
// -----------------------------------------------------------------------------

const initialized = new WeakMap<HTMLElement, void>();

export function updateViewportUnits(
  root = document.documentElement,
): () => void {
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

  function step(): void {
    timer = undefined;
    const vw = html.clientWidth / 100;
    const vh = html.clientHeight / 100;

    if (vw === lastVW && vh === lastVH) {
      return;
    }

    lastVW = vw;
    lastVH = vh;

    for (const [name, value] of Object.entries({
      vb: isHorizontal ? vh : vw,
      vh: vh,
      vi: isHorizontal ? vw : vh,
      vmax: Math.max(vw, vh),
      vmin: Math.min(vw, vh),
      vw: vw,
    })) {
      root.style.setProperty(`--${name}`, String(value));
    }
  }

  function onResize(): void {
    if (timer === undefined) {
      timer = requestAnimationFrame(step);
    }
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

    for (const name of ['vb', 'vh', 'vi', 'vmax', 'vmin', 'vw']) {
      root.style.removeProperty(`--${name}`);
    }

    initialized.delete(root);
  };
}
