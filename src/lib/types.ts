/** Log severity levels used in diagram event logs */
export type LogType = 'ok' | 'warn' | 'err' | 'info';

/** Function signature for the diagram's log output */
export type LogFn = (type: LogType, msg: string) => void;

/** Cleanup function returned by diagram init — called on unmount */
export type CleanupFn = () => void;

/** Tick function called on each animation interval */
export type TickFn = () => void;

/** Configurable parameter for a diagram */
export interface DiagramParam {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

/** Core diagram definition */
export interface DiagramDef {
  title: string;
  desc: string;
  /** Optional configurable parameters (array size, node count, etc.) */
  params?: DiagramParam[];
  /**
   * Initializes the diagram on the canvas.
   * Returns a tick function (called repeatedly) and optional cleanup.
   */
  init: (ctx: DiagramContext) => DiagramInstance;
}

/** Context passed to each diagram's init function */
export interface DiagramContext {
  canvas: HTMLDivElement;
  log: LogFn;
  clearLog: () => void;
  /** Current values of configurable params */
  params: Record<string, number>;
}

/** Returned by diagram init — controls animation lifecycle */
export interface DiagramInstance {
  tick: TickFn;
  interval: number; // ms between ticks
  cleanup?: CleanupFn;
}

/** Accent color configuration for a category */
export interface AccentTheme {
  color: string;       // CSS variable name or hex
  rgb: string;         // r,g,b for rgba usage
  cssVar: string;      // e.g. 'var(--accent)'
}

/** Category metadata for the hub page */
export interface CategoryMeta {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  accent: AccentTheme;
  cardClass: string;
}

/** DOM node helper options */
export interface NodeOptions {
  x: number;
  y: number;
  w: number;
  label: string;
  sub?: string;
  cls: string;
}

/** Flying packet/badge animation options */
export interface FlyOptions {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  color: string;
  label: string;
  duration: number;
  onComplete?: () => void;
}

/** Badge creation options */
export interface BadgeOptions {
  x: number;
  y: number;
  text: string;
  color: string;
}

/** Log entry for display */
export interface LogEntry {
  id: number;
  type: LogType;
  time: string;
  msg: string;
}
