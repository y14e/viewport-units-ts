const initialized = new WeakMap<HTMLElement, void>();

interface ObjectCtor extends ObjectConstructor {
  entries<K extends PropertyKey, V>(o: Record<K, V>): [K, V][];
}

const OBJECT_CTOR: ObjectCtor = Object;

export function updateViewportUnits(root = document.documentElement): () => void {
  if (!(root instanceof HTMLElement)) {
    root = document.documentElement;
    console.warn(`Invalid root element. Fallback: <${root.tagName.toLowerCase()}> element.`);
  }

  if (initialized.has(root)) {
    console.warn('Already initialized');
    return () => {};
  }

  const html = document.documentElement;
  let timer: number | undefined;
  let lastVW: number | undefined;
  let lastVH: number | undefined;
  const isHorizontal = /^h/.test(getComputedStyle(html).getPropertyValue('writing-mode'));
  const { style } = root;

  function update(): void {
    timer = undefined;
    const { clientWidth: w, clientHeight: h } = html;
    const [vw, vh] = [w / 100, h / 100];

    if (vw === lastVW && vh === lastVH) {
      return;
    }

    lastVW = vw;
    lastVH = vh;

    for (const [name, value] of OBJECT_CTOR.entries({
      vb: isHorizontal ? vh : vw,
      vh: vh,
      vi: isHorizontal ? vw : vh,
      vmax: Math.max(vw, vh),
      vmin: Math.min(vw, vh),
      vw: vw,
    })) {
      style.setProperty(`--${name}`, `${value}`);
    }
  }

  function onResize(): void {
    if (timer === undefined) {
      timer = requestAnimationFrame(update);
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

    for (const name of ['vb', 'vh', 'vi', 'vmax', 'vmin', 'vw'] as const) {
      style.removeProperty(`--${name}`);
    }

    initialized.delete(root);
  };
}
