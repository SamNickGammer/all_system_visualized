import type { NodeOptions, FlyOptions, BadgeOptions } from './types';

/**
 * Creates a positioned node element on the canvas.
 */
export function mkNode(canvas: HTMLDivElement, opts: NodeOptions): HTMLDivElement {
  const d = document.createElement('div');
  d.className = `node ${opts.cls}`;
  d.style.cssText = `left:${opts.x}px;top:${opts.y}px;width:${opts.w}px`;
  d.innerHTML = opts.label + (opts.sub ? `<div class="sub">${opts.sub}</div>` : '');
  canvas.appendChild(d);
  return d;
}

/**
 * Shorthand for mkNode — matches the original function signature.
 */
export function createNode(
  canvas: HTMLDivElement,
  x: number, y: number, w: number,
  label: string, sub: string, cls: string
): HTMLDivElement {
  return mkNode(canvas, { x, y, w, label, sub: sub || undefined, cls });
}

/**
 * Animates a small packet element flying between two points.
 */
export function flyPkt(canvas: HTMLDivElement, opts: FlyOptions): void {
  const p = document.createElement('div');
  p.className = 'pkt';
  p.style.cssText = `left:${opts.sx}px;top:${opts.sy}px;background:${opts.color}22;border:1px solid ${opts.color};color:${opts.color}`;
  p.textContent = opts.label;
  canvas.appendChild(p);

  const start = performance.now();
  function step(now: number): void {
    const t = Math.min((now - start) / opts.duration, 1);
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    p.style.left = (opts.sx + (opts.ex - opts.sx) * ease) + 'px';
    p.style.top = (opts.sy + (opts.ey - opts.sy) * ease) + 'px';
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      p.remove();
      opts.onComplete?.();
    }
  }
  requestAnimationFrame(step);
}

/**
 * Creates a styled badge element at the given position.
 */
export function createBadge(canvas: HTMLDivElement, opts: BadgeOptions): HTMLDivElement {
  const d = document.createElement('div');
  d.className = 'msg-badge';
  d.style.cssText = `left:${opts.x}px;top:${opts.y}px;background:${opts.color}22;border-color:${opts.color};color:${opts.color}`;
  d.textContent = opts.text;
  canvas.appendChild(d);
  return d;
}

/**
 * Animates a badge element flying to a target position and removes it.
 */
export function flyBadge(
  el: HTMLDivElement,
  ex: number, ey: number,
  duration: number,
  onComplete?: () => void
): void {
  const sx = parseInt(el.style.left);
  const sy = parseInt(el.style.top);
  const start = performance.now();

  function step(now: number): void {
    const t = Math.min((now - start) / duration, 1);
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    el.style.left = (sx + (ex - sx) * ease) + 'px';
    el.style.top = (sy + (ey - sy) * ease) + 'px';
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      el.remove();
      onComplete?.();
    }
  }
  requestAnimationFrame(step);
}

/**
 * Creates an SVG overlay for arrow/line drawing on the canvas.
 */
export function createSvgOverlay(canvas: HTMLDivElement): SVGSVGElement {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
  s.innerHTML = `<defs>
    <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M0,0 L0,6 L6,3 z" fill="#2a3545"/>
    </marker>
    <marker id="arr-g" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M0,0 L0,6 L6,3 z" fill="#00d4aa"/>
    </marker>
  </defs>`;
  canvas.appendChild(s);
  return s;
}

/**
 * Draws a line with arrow marker on an SVG overlay.
 */
export function drawArrow(
  svg: SVGSVGElement,
  x1: number, y1: number,
  x2: number, y2: number,
  color?: string
): SVGLineElement {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  g.setAttribute('x1', String(x1));
  g.setAttribute('y1', String(y1));
  g.setAttribute('x2', String(x2));
  g.setAttribute('y2', String(y2));
  g.setAttribute('stroke', color || '#2a3545');
  g.setAttribute('stroke-width', '1');
  g.setAttribute('marker-end', 'url(#arr)');
  svg.appendChild(g);
  return g;
}

/**
 * Temporarily activates a node (glow effect) for a given duration.
 */
export function flashNode(node: HTMLDivElement, duration = 400): void {
  node.classList.add('active');
  setTimeout(() => node.classList.remove('active'), duration);
}

/**
 * Formats current time as HH:MM:SS.
 */
export function timestamp(): string {
  const n = new Date();
  return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}:${String(n.getSeconds()).padStart(2, '0')}`;
}

/**
 * Creates a positioned label/div on the canvas.
 */
export function createLabel(
  canvas: HTMLDivElement,
  x: number, y: number,
  text: string,
  style: string
): HTMLDivElement {
  const d = document.createElement('div');
  d.style.cssText = `position:absolute;left:${x}px;top:${y}px;${style}`;
  d.textContent = text;
  canvas.appendChild(d);
  return d;
}

/**
 * Creates a dashed border region (tunnel/zone indicator).
 */
export function createZone(
  canvas: HTMLDivElement,
  x: number, y: number, w: number, h: number,
  borderColor: string,
  bgColor: string
): HTMLDivElement {
  const d = document.createElement('div');
  d.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border:1px dashed ${borderColor};background:${bgColor}`;
  canvas.appendChild(d);
  return d;
}
