'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { DiagramInstance, LogEntry, LogType } from '@/lib/types';
import type { AccentTheme } from '@/lib/types';
import { timestamp } from '@/lib/helpers';
import { MAX_LOG_ENTRIES } from '@/lib/constants';
import { getDiagramsByCategory } from '@/lib/diagrams';
import ResizableLog from './ResizableLog';

interface DiagramWorkspaceProps {
  title: string;
  categorySlug: string;
  accent: AccentTheme;
  accentRgb: string;
}

export default function DiagramWorkspace({ title, categorySlug, accent, accentRgb }: DiagramWorkspaceProps) {
  const diagrams = getDiagramsByCategory(categorySlug);
  const [activeTab, setActiveTab] = useState(0);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<DiagramInstance | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logIdRef = useRef(0);

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

  const initDiagram = useCallback((index: number) => {
    stopAnimation();
    instanceRef.current?.cleanup?.();

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.innerHTML = '';
    clearLog();

    const diagram = diagrams[index];
    const instance = diagram.init({ canvas, log, clearLog });
    instanceRef.current = instance;
  }, [diagrams, log, clearLog, stopAnimation]);

  const startAnimation = useCallback(() => {
    if (running || !instanceRef.current) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      instanceRef.current?.tick();
    }, instanceRef.current.interval);
  }, [running]);

  const pauseAnimation = useCallback(() => {
    stopAnimation();
  }, [stopAnimation]);

  const resetDiagram = useCallback(() => {
    stopAnimation();
    initDiagram(activeTab);
  }, [stopAnimation, initDiagram, activeTab]);

  // Init on tab change
  useEffect(() => {
    initDiagram(activeTab);
    return () => {
      stopAnimation();
      instanceRef.current?.cleanup?.();
    };
  }, [activeTab, initDiagram, stopAnimation]);

  const handleTabClick = useCallback((index: number) => {
    setActiveTab(index);
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
      </header>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        overflowX: 'auto',
        zIndex: 1,
        position: 'relative',
        flexShrink: 0,
      }}>
        {diagrams.map((d, i) => (
          <div
            key={d.title}
            onClick={() => handleTabClick(i)}
            style={{
              fontSize: 10,
              letterSpacing: '.08em',
              padding: '12px 18px',
              cursor: 'pointer',
              borderBottom: `2px solid ${i === activeTab ? accent.color : 'transparent'}`,
              whiteSpace: 'nowrap',
              color: i === activeTab ? accent.color : 'var(--dim)',
              transition: 'all .15s',
              textTransform: 'uppercase',
            }}
            onMouseEnter={(e) => {
              if (i !== activeTab) (e.currentTarget as HTMLElement).style.color = 'var(--text)';
            }}
            onMouseLeave={(e) => {
              if (i !== activeTab) (e.currentTarget as HTMLElement).style.color = 'var(--dim)';
            }}
          >
            {d.title}
          </div>
        ))}
      </div>

      {/* Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', zIndex: 1, position: 'relative' }}>
        {/* Diagram info */}
        <div style={{ padding: '20px 32px 0', display: 'flex', gap: 24, alignItems: 'baseline' }}>
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
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          style={{
            flex: 1,
            padding: 32,
            minHeight: 320,
            position: 'relative',
            overflow: 'hidden',
          }}
        />

        {/* Resizable Log */}
        <ResizableLog entries={logEntries} accentRgb={accentRgb} />
      </div>
    </div>
  );
}
