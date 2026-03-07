export function updateViewportUnit(root = document.documentElement) {
  if (!root) {
    return;
  }
  const html = document.documentElement;
  const horizontal = /^h/.test(window.getComputedStyle(html).getPropertyValue('writing-mode'));
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
}
