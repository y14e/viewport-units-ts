interface ObjectCtor extends ObjectConstructor {
  entries<K extends string, V>(o: Partial<Record<K, V>>): [K, V][];
}

// biome-ignore lint: enhanced type definitions for Object constructor
declare const Object: ObjectCtor;

const root = document.documentElement;
const initialized = new WeakSet<HTMLElement>();

export function updateViewportUnits(element = root): () => void {
  if (!(element instanceof HTMLElement)) {
    element = root;
    console.warn(`Invalid element. Fallback: <${element.tagName.toLowerCase()}> element.`);
  }

  if (initialized.has(element)) {
    console.warn('Already initialized');
    return () => {};
  }

  let timer: ReturnType<typeof requestAnimationFrame> | undefined;
  let lastVw: number | undefined;
  let lastVh: number | undefined;
  const isHorizontal = /^h/.test(getComputedStyle(root).getPropertyValue('writing-mode'));
  const { style } = element;

  function update(): void {
    timer = undefined;
    const { clientWidth: w, clientHeight: h } = root;
    const [vw, vh] = [w / 100, h / 100];

    if (vw === lastVw && vh === lastVh) {
      return;
    }

    lastVw = vw;
    lastVh = vh;

    for (const [name, value] of Object.entries({
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

  for (const viewport of [window, window.visualViewport]) {
    viewport?.addEventListener('resize', onResize, { signal });
  }

  let observer: ResizeObserver | null = new ResizeObserver(onResize);
  observer.observe(root);
  onResize();
  initialized.add(element);

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

    initialized.delete(element);
  };
}
