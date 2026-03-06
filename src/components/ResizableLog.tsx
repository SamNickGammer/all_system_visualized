'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { LogEntry } from '@/lib/types';
import { DEFAULT_LOG_HEIGHT, MIN_LOG_HEIGHT } from '@/lib/constants';

interface ResizableLogProps {
  entries: LogEntry[];
  accentRgb: string;
}

export default function ResizableLog({ entries, accentRgb }: ResizableLogProps) {
  const [height, setHeight] = useState(DEFAULT_LOG_HEIGHT);
  const logRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startY = useRef(0);
  const startH = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    startY.current = e.clientY;
    startH.current = height;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  }, [height]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    dragging.current = true;
    startY.current = e.touches[0].clientY;
    startH.current = height;
    e.preventDefault();
  }, [height]);

  useEffect(() => {
    const onMove = (clientY: number) => {
      if (!dragging.current) return;
      const maxH = window.innerHeight * 0.6;
      const newH = Math.max(MIN_LOG_HEIGHT, Math.min(maxH, startH.current + (startY.current - clientY)));
      setHeight(newH);
    };

    const onMouseMove = (e: MouseEvent) => onMove(e.clientY);
    const onTouchMove = (e: TouchEvent) => onMove(e.touches[0].clientY);

    const onEnd = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onEnd);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onEnd);
    };
  }, []);

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <>
      {/* Drag handle */}
      <div
        className="log-resize"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        style={{
          height: 7,
          cursor: 'ns-resize',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'background .15s',
          zIndex: 2,
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = `rgba(${accentRgb},.1)`;
        }}
        onMouseLeave={(e) => {
          if (!dragging.current) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
        }}
      >
        <div style={{
          width: 36, height: 2, borderRadius: 1,
          background: 'var(--dim)', opacity: 0.4,
          transition: 'opacity .15s',
        }} />
      </div>

      {/* Log panel */}
      <div
        ref={logRef}
        style={{
          height,
          overflowY: 'auto',
          borderTop: '1px solid var(--border)',
          padding: '10px 32px',
          fontSize: 9,
          lineHeight: 1.9,
          color: 'var(--dim)',
          flexShrink: 0,
        }}
      >
        {entries.map((entry) => (
          <div key={entry.id} className={`le ${entry.type}`} style={{ display: 'flex', gap: 10 }}>
            <span style={{ color: 'var(--dim)', minWidth: 65 }}>{entry.time}</span>
            <span className={`m-${entry.type}`} style={{
              color: entry.type === 'ok' ? 'var(--accent)'
                : entry.type === 'warn' ? 'var(--yellow)'
                : entry.type === 'err' ? 'var(--red)'
                : `rgb(${accentRgb})`,
            }}>
              {entry.msg}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
