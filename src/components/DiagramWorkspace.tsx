'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { DiagramInstance, DiagramParam, LogEntry, LogType } from '@/lib/types';
import type { AccentTheme } from '@/lib/types';
import { timestamp } from '@/lib/helpers';
import { MAX_LOG_ENTRIES } from '@/lib/constants';
import { getDiagramsByCategory } from '@/lib/diagrams';
import ResizableLog from './ResizableLog';

/* ── Diagram group definitions per category ────────────────────── */

interface DiagramGroup {
  label: string;
  indices: number[];
}

const CATEGORY_GROUPS: Record<string, DiagramGroup[]> = {
  'algorithms-cs': [
    { label: 'Sorting', indices: [0, 10, 11] },
    { label: 'Graph Traversal', indices: [1, 12] },
    { label: 'Shortest Path', indices: [6, 13] },
    { label: 'Search', indices: [5] },
    { label: 'Data Structures', indices: [14, 15, 16, 17, 18, 7] },
    { label: 'Techniques', indices: [19, 20, 21] },
    { label: 'Hashing & Probabilistic', indices: [2, 8, 9] },
    { label: 'Distributed Concepts', indices: [3, 4] },
  ],
  'distributed-systems': [
    { label: 'Load & Routing', indices: [0, 1] },
    { label: 'Orchestration', indices: [2, 4, 5] },
    { label: 'Data & Messaging', indices: [3, 6, 7] },
    { label: 'Resilience', indices: [8, 9] },
  ],
  'networking-security': [
    { label: 'Protocols', indices: [0, 1] },
    { label: 'Auth & Encryption', indices: [2, 5, 7] },
    { label: 'Infrastructure', indices: [3, 4, 6] },
  ],
  'data-ml-pipelines': [
    { label: 'Data Pipelines', indices: [0, 1, 5] },
    { label: 'ML & AI', indices: [2, 3, 4, 6, 7] },
  ],
  'app-web-architecture': [
    { label: 'Request Flow', indices: [0, 2, 3] },
    { label: 'Rendering', indices: [1, 5] },
    { label: 'Runtime', indices: [4, 6, 7] },
  ],
  'databases-storage': [
    { label: 'Indexing & Query', indices: [0, 1] },
    { label: 'Write & Scale', indices: [2, 3, 4] },
  ],
  'devops-cloud': [
    { label: 'Infrastructure', indices: [0, 1] },
    { label: 'Networking & Deploy', indices: [2, 3, 4] },
  ],
  'auth-identity': [
    { label: 'Token Auth', indices: [0, 1] },
    { label: 'Access & Trust', indices: [2, 3] },
  ],
  'business-processes': [
    { label: 'Workflows', indices: [0, 1, 2] },
    { label: 'Operations', indices: [3, 4] },
  ],
};

/* ── Speed presets ──────────────────────────────────────────────── */

const SPEED_LABELS = ['0.25x', '0.5x', '1x', '1.5x', '2x', '3x'] as const;
const SPEED_MULTIPLIERS = [4, 2, 1, 0.67, 0.5, 0.33];

/* ── Helpers ────────────────────────────────────────────────────── */

function getDefaultParams(defs?: DiagramParam[]): Record<string, number> {
  const out: Record<string, number> = {};
  defs?.forEach(p => { out[p.key] = p.default; });
  return out;
}

/* ── Component ──────────────────────────────────────────────────── */

interface DiagramWorkspaceProps {
  title: string;
  categorySlug: string;
  accent: AccentTheme;
  accentRgb: string;
}

export default function DiagramWorkspace({ title, categorySlug, accent, accentRgb }: DiagramWorkspaceProps) {
  const diagrams = getDiagramsByCategory(categorySlug);
  const groups = CATEGORY_GROUPS[categorySlug] ?? null;
  const searchParams = useSearchParams();

  const initialTab = (() => {
    const t = searchParams.get('tab');
    if (t !== null) {
      const n = parseInt(t, 10);
      if (!isNaN(n) && n >= 0 && n < diagrams.length) return n;
    }
    return 0;
  })();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [speedIdx, setSpeedIdx] = useState(2);
  const [paramsOpen, setParamsOpen] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, number>>(() =>
    getDefaultParams(diagrams[initialTab]?.params)
  );
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(() => {
    if (!groups) return new Set([0]);
    const s = new Set<number>();
    groups.forEach((g, gi) => {
      if (g.indices.includes(initialTab)) s.add(gi);
    });
    if (s.size === 0) s.add(0);
    return s;
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<DiagramInstance | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logIdRef = useRef(0);
  const speedIdxRef = useRef(speedIdx);
  const paramValuesRef = useRef(paramValues);

  useEffect(() => { speedIdxRef.current = speedIdx; }, [speedIdx]);
  useEffect(() => { paramValuesRef.current = paramValues; }, [paramValues]);

  const currentParams = diagrams[activeTab]?.params;

  const clearLog = useCallback(() => {
    setLogEntries([]);
    logIdRef.current = 0;
  }, []);

  const log = useCallback((type: LogType, msg: string) => {
    setLogEntries((prev) => {
      const entry: LogEntry = {
        id: ++logIdRef.current,
        type,
        time: timestamp(),
        msg,
      };
      const next = [...prev, entry];
      return next.length > MAX_LOG_ENTRIES ? next.slice(-MAX_LOG_ENTRIES) : next;
    });
  }, []);

  const stopAnimation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const initDiagram = useCallback((index: number, pv?: Record<string, number>) => {
    stopAnimation();
    instanceRef.current?.cleanup?.();

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.innerHTML = '';
    clearLog();

    const diagram = diagrams[index];
    const params = pv ?? paramValuesRef.current;
    const instance = diagram.init({ canvas, log, clearLog, params });
    instanceRef.current = instance;
  }, [diagrams, log, clearLog, stopAnimation]);

  const startAnimation = useCallback(() => {
    if (running || !instanceRef.current) return;
    setRunning(true);
    const baseInterval = instanceRef.current.interval;
    const adjustedInterval = Math.round(baseInterval * SPEED_MULTIPLIERS[speedIdxRef.current]);
    intervalRef.current = setInterval(() => {
      instanceRef.current?.tick();
    }, adjustedInterval);
  }, [running]);

  const pauseAnimation = useCallback(() => {
    stopAnimation();
  }, [stopAnimation]);

  const resetDiagram = useCallback(() => {
    stopAnimation();
    initDiagram(activeTab);
  }, [stopAnimation, initDiagram, activeTab]);

  const handleSpeedChange = useCallback((newIdx: number) => {
    setSpeedIdx(newIdx);
    if (running && instanceRef.current) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const baseInterval = instanceRef.current.interval;
      const adjustedInterval = Math.round(baseInterval * SPEED_MULTIPLIERS[newIdx]);
      intervalRef.current = setInterval(() => {
        instanceRef.current?.tick();
      }, adjustedInterval);
    }
  }, [running]);

  const handleParamChange = useCallback((key: string, value: number) => {
    setParamValues(prev => {
      const next = { ...prev, [key]: value };
      // Reinit diagram with new params
      stopAnimation();
      setTimeout(() => initDiagram(activeTab, next), 0);
      return next;
    });
  }, [stopAnimation, initDiagram, activeTab]);

  // Init on tab change
  useEffect(() => {
    const newDefaults = getDefaultParams(diagrams[activeTab]?.params);
    setParamValues(newDefaults);
    setParamsOpen(false);
    initDiagram(activeTab, newDefaults);
    return () => {
      stopAnimation();
      instanceRef.current?.cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleDiagramSelect = useCallback((index: number) => {
    setActiveTab(index);
    if (groups) {
      groups.forEach((g, gi) => {
        if (g.indices.includes(index)) {
          setExpandedGroups(prev => new Set(prev).add(gi));
        }
      });
    }
  }, [groups]);

  const toggleGroup = useCallback((gi: number) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(gi)) next.delete(gi);
      else next.add(gi);
      return next;
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', zIndex: 1, position: 'relative' }}>
      {/* Header */}
      <header style={{
        padding: '20px 32px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        zIndex: 1,
        position: 'relative',
      }}>
        <Link
          href="/"
          style={{
            fontSize: 11,
            color: 'var(--dim)',
            textDecoration: 'none',
            letterSpacing: '.1em',
            transition: 'color .15s',
          }}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.color = accent.color; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--dim)'; }}
        >
          &larr; hub
        </Link>
        <h1 style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '.15em',
          textTransform: 'uppercase',
          color: accent.color,
        }}>
          {title}
        </h1>
        <span style={{ fontSize: 10, color: 'var(--dim)' }}>
          // {diagrams.length} animated flow diagrams
        </span>

        <button
          onClick={() => setSidebarOpen(prev => !prev)}
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--dim)',
            padding: '5px 10px',
            fontSize: 10,
            fontFamily: 'inherit',
            cursor: 'pointer',
            letterSpacing: '.06em',
            transition: 'all .15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent.color; e.currentTarget.style.color = accent.color; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--dim)'; }}
        >
          {sidebarOpen ? '\u2630 Hide' : '\u2630 Browse'}
        </button>
      </header>

      {/* Main area: sidebar + workspace */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Sidebar ──────────────────────────────────────── */}
        <div style={{
          width: sidebarOpen ? 260 : 0,
          minWidth: sidebarOpen ? 260 : 0,
          borderRight: sidebarOpen ? '1px solid var(--border)' : 'none',
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'width .25s ease, min-width .25s ease',
          flexShrink: 0,
          zIndex: 2,
          position: 'relative',
        }}>
          {sidebarOpen && (
            <div style={{ padding: '8px 0' }}>
              {groups ? (
                groups.map((group, gi) => (
                  <div key={gi}>
                    <div
                      onClick={() => toggleGroup(gi)}
                      style={{
                        padding: '10px 18px',
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '.12em',
                        textTransform: 'uppercase',
                        color: expandedGroups.has(gi) ? accent.color : 'var(--dim)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'color .15s',
                        userSelect: 'none',
                      }}
                      onMouseEnter={(e) => { if (!expandedGroups.has(gi)) e.currentTarget.style.color = 'var(--text)'; }}
                      onMouseLeave={(e) => { if (!expandedGroups.has(gi)) e.currentTarget.style.color = 'var(--dim)'; }}
                    >
                      <span style={{
                        fontSize: 8,
                        transition: 'transform .2s',
                        display: 'inline-block',
                        transform: expandedGroups.has(gi) ? 'rotate(90deg)' : 'rotate(0deg)',
                      }}>&#9654;</span>
                      {group.label}
                      <span style={{ marginLeft: 'auto', fontSize: 8, opacity: 0.5 }}>{group.indices.length}</span>
                    </div>
                    {expandedGroups.has(gi) && (
                      <div>
                        {group.indices.map((dIdx) => (
                          <div
                            key={dIdx}
                            onClick={() => handleDiagramSelect(dIdx)}
                            style={{
                              padding: '8px 18px 8px 34px',
                              fontSize: 10,
                              letterSpacing: '.04em',
                              cursor: 'pointer',
                              color: dIdx === activeTab ? accent.color : 'var(--dim)',
                              background: dIdx === activeTab ? `rgba(${accentRgb},.06)` : 'transparent',
                              borderLeft: dIdx === activeTab ? `2px solid ${accent.color}` : '2px solid transparent',
                              transition: 'all .15s',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            onMouseEnter={(e) => { if (dIdx !== activeTab) e.currentTarget.style.color = 'var(--text)'; }}
                            onMouseLeave={(e) => { if (dIdx !== activeTab) e.currentTarget.style.color = 'var(--dim)'; }}
                          >
                            {diagrams[dIdx]?.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                diagrams.map((d, i) => (
                  <div
                    key={d.title}
                    onClick={() => handleDiagramSelect(i)}
                    style={{
                      padding: '8px 18px',
                      fontSize: 10,
                      letterSpacing: '.04em',
                      cursor: 'pointer',
                      color: i === activeTab ? accent.color : 'var(--dim)',
                      background: i === activeTab ? `rgba(${accentRgb},.06)` : 'transparent',
                      borderLeft: i === activeTab ? `2px solid ${accent.color}` : '2px solid transparent',
                      transition: 'all .15s',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    onMouseEnter={(e) => { if (i !== activeTab) e.currentTarget.style.color = 'var(--text)'; }}
                    onMouseLeave={(e) => { if (i !== activeTab) e.currentTarget.style.color = 'var(--dim)'; }}
                  >
                    {d.title}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── Right: workspace ─────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Diagram info */}
          <div style={{ padding: '16px 32px 0', display: 'flex', gap: 24, alignItems: 'baseline' }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
              {diagrams[activeTab]?.title}
            </h2>
            <p style={{ fontSize: 10, color: 'var(--dim)', letterSpacing: '.04em' }}>
              {diagrams[activeTab]?.desc}
            </p>
          </div>

          {/* Controls */}
          <div style={{
            padding: '12px 32px',
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            borderBottom: '1px solid var(--border)',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={startAnimation}
              className="btn"
              style={{ borderColor: accent.color, color: accent.color }}
              onMouseEnter={(e) => { const t = e.currentTarget; t.style.background = accent.color; t.style.color = 'var(--bg)'; }}
              onMouseLeave={(e) => { const t = e.currentTarget; t.style.background = 'transparent'; t.style.color = accent.color; }}
            >
              &#9654; Start
            </button>
            <button
              onClick={pauseAnimation}
              className="btn"
              style={{ borderColor: 'var(--dim)', color: 'var(--dim)' }}
              onMouseEnter={(e) => { const t = e.currentTarget; t.style.borderColor = 'var(--text)'; t.style.color = 'var(--text)'; }}
              onMouseLeave={(e) => { const t = e.currentTarget; t.style.borderColor = 'var(--dim)'; t.style.color = 'var(--dim)'; }}
            >
              &#9208; Pause
            </button>
            <button
              onClick={resetDiagram}
              className="btn"
              style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
              onMouseEnter={(e) => { const t = e.currentTarget; t.style.background = 'var(--red)'; t.style.color = 'var(--bg)'; }}
              onMouseLeave={(e) => { const t = e.currentTarget; t.style.background = 'transparent'; t.style.color = 'var(--red)'; }}
            >
              &#8634; Reset
            </button>

            {/* Speed control */}
            <div style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '.06em', marginRight: 4 }}>SPEED</span>
              {SPEED_LABELS.map((label, i) => (
                <button
                  key={label}
                  onClick={() => handleSpeedChange(i)}
                  style={{
                    background: i === speedIdx ? `rgba(${accentRgb},.15)` : 'transparent',
                    border: `1px solid ${i === speedIdx ? accent.color : 'var(--border)'}`,
                    color: i === speedIdx ? accent.color : 'var(--dim)',
                    padding: '3px 8px',
                    fontSize: 9,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    transition: 'all .15s',
                    letterSpacing: '.04em',
                  }}
                  onMouseEnter={(e) => { if (i !== speedIdx) { e.currentTarget.style.borderColor = 'var(--text)'; e.currentTarget.style.color = 'var(--text)'; } }}
                  onMouseLeave={(e) => { if (i !== speedIdx) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--dim)'; } }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas wrapper (relative for popover positioning) */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

            {/* Config popover toggle — only show if diagram has params */}
            {currentParams && currentParams.length > 0 && (
              <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
                <button
                  onClick={() => setParamsOpen(prev => !prev)}
                  style={{
                    background: paramsOpen ? `rgba(${accentRgb},.12)` : 'var(--panel)',
                    border: `1px solid ${paramsOpen ? accent.color : 'var(--border)'}`,
                    color: paramsOpen ? accent.color : 'var(--dim)',
                    padding: '5px 10px',
                    fontSize: 9,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    letterSpacing: '.06em',
                    transition: 'all .15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent.color; e.currentTarget.style.color = accent.color; }}
                  onMouseLeave={(e) => {
                    if (!paramsOpen) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--dim)'; }
                  }}
                >
                  <span style={{ fontSize: 12 }}>&#9881;</span>
                  Config
                </button>

                {/* Popover panel */}
                {paramsOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 6,
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                    padding: '16px 20px',
                    minWidth: 240,
                    zIndex: 20,
                    boxShadow: '0 8px 32px rgba(0,0,0,.5)',
                  }}>
                    <div style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: accent.color,
                      letterSpacing: '.12em',
                      textTransform: 'uppercase',
                      marginBottom: 14,
                    }}>
                      Parameters
                    </div>

                    {currentParams.map((p) => (
                      <div key={p.key} style={{ marginBottom: 14 }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 6,
                        }}>
                          <label style={{ fontSize: 10, color: 'var(--text)', letterSpacing: '.04em' }}>
                            {p.label}
                          </label>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: accent.color,
                            minWidth: 32,
                            textAlign: 'right',
                          }}>
                            {paramValues[p.key] ?? p.default}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 8, color: 'var(--dim)' }}>{p.min}</span>
                          <input
                            type="range"
                            min={p.min}
                            max={p.max}
                            step={p.step}
                            value={paramValues[p.key] ?? p.default}
                            onChange={(e) => handleParamChange(p.key, Number(e.target.value))}
                            style={{
                              flex: 1,
                              height: 4,
                              appearance: 'none',
                              background: 'var(--border)',
                              outline: 'none',
                              cursor: 'pointer',
                              accentColor: accent.color,
                            }}
                          />
                          <span style={{ fontSize: 8, color: 'var(--dim)' }}>{p.max}</span>
                        </div>
                      </div>
                    ))}

                    <div style={{
                      fontSize: 8,
                      color: 'var(--dim)',
                      letterSpacing: '.04em',
                      marginTop: 4,
                      borderTop: '1px solid var(--border)',
                      paddingTop: 10,
                    }}>
                      // changes reset &amp; reinitialize the diagram
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Canvas */}
            <div
              ref={canvasRef}
              style={{
                height: '100%',
                padding: 32,
                minHeight: 320,
                position: 'relative',
                overflow: 'hidden',
              }}
            />
          </div>

          {/* Resizable Log */}
          <ResizableLog entries={logEntries} accentRgb={accentRgb} />
        </div>
      </div>
    </div>
  );
}
