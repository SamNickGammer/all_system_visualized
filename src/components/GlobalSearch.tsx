'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllDiagramEntries, type DiagramSearchEntry } from '@/lib/diagrams';

const allEntries = getAllDiagramEntries();

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const filtered = query.trim().length === 0
    ? allEntries
    : allEntries.filter((e) => {
        const q = query.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.desc.toLowerCase().includes(q) ||
          e.categoryTitle.toLowerCase().includes(q) ||
          e.categorySlug.toLowerCase().includes(q)
        );
      });

  const openSearch = useCallback(() => {
    setOpen(true);
    setQuery('');
    setSelectedIdx(0);
  }, []);

  const closeSearch = useCallback(() => {
    setOpen(false);
    setQuery('');
    setSelectedIdx(0);
  }, []);

  const navigateTo = useCallback((entry: DiagramSearchEntry) => {
    closeSearch();
    router.push(`/${entry.categorySlug}?tab=${entry.diagramIndex}`);
  }, [closeSearch, router]);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) closeSearch();
        else openSearch();
      }
      if (e.key === 'Escape' && open) {
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, openSearch, closeSearch]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const item = listRef.current.children[selectedIdx] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [selectedIdx]);

  // Reset selection when filtered results change
  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIdx]) {
      e.preventDefault();
      navigateTo(filtered[selectedIdx]);
    }
  };

  if (!open) {
    return (
      <button
        onClick={openSearch}
        style={{
          position: 'fixed',
          top: 16,
          right: 24,
          zIndex: 100,
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          color: 'var(--dim)',
          padding: '7px 16px',
          fontSize: 10,
          fontFamily: 'inherit',
          letterSpacing: '.08em',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          transition: 'all .15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.color = 'var(--accent)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--dim)';
        }}
      >
        <span style={{ fontSize: 12 }}>&#8981;</span>
        Search diagrams
        <kbd style={{
          fontSize: 9,
          padding: '2px 6px',
          border: '1px solid var(--border)',
          borderRadius: 2,
          color: 'var(--dim)',
          marginLeft: 4,
        }}>
          {typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent) ? '\u2318' : 'Ctrl+'}K
        </kbd>
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 80,
      }}
    >
      {/* Backdrop */}
      <div
        onClick={closeSearch}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(10,12,16,.85)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 600,
          margin: '0 20px',
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 160px)',
        }}
      >
        {/* Search input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '14px 20px',
          gap: 12,
          borderBottom: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: 14, color: 'var(--dim)' }}>&#8981;</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search all 75 diagrams..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text)',
              fontSize: 13,
              fontFamily: 'inherit',
              letterSpacing: '.04em',
            }}
          />
          <kbd
            onClick={closeSearch}
            style={{
              fontSize: 9,
              padding: '3px 8px',
              border: '1px solid var(--border)',
              borderRadius: 2,
              color: 'var(--dim)',
              cursor: 'pointer',
              letterSpacing: '.06em',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          style={{
            overflowY: 'auto',
            maxHeight: 400,
          }}
        >
          {filtered.length === 0 && (
            <div style={{
              padding: '32px 20px',
              textAlign: 'center',
              fontSize: 11,
              color: 'var(--dim)',
              letterSpacing: '.06em',
            }}>
              no diagrams matching &quot;{query}&quot;
            </div>
          )}
          {filtered.map((entry, i) => (
            <div
              key={`${entry.categorySlug}-${entry.diagramIndex}`}
              onClick={() => navigateTo(entry)}
              onMouseEnter={() => setSelectedIdx(i)}
              style={{
                padding: '12px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                background: i === selectedIdx ? 'rgba(0,212,170,.06)' : 'transparent',
                borderLeft: i === selectedIdx ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all .1s',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: i === selectedIdx ? 'var(--accent)' : 'var(--text)',
                  letterSpacing: '.04em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {entry.title}
                </div>
                <div style={{
                  fontSize: 9,
                  color: 'var(--dim)',
                  marginTop: 3,
                  letterSpacing: '.02em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {entry.desc}
                </div>
              </div>
              <div style={{
                fontSize: 8,
                color: 'var(--dim)',
                padding: '3px 8px',
                border: '1px solid var(--border)',
                whiteSpace: 'nowrap',
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                flexShrink: 0,
              }}>
                {entry.categorySlug}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: 16,
          fontSize: 9,
          color: 'var(--dim)',
          letterSpacing: '.06em',
        }}>
          <span><kbd style={{ padding: '1px 4px', border: '1px solid var(--border)', borderRadius: 2, marginRight: 4 }}>&uarr;&darr;</kbd> navigate</span>
          <span><kbd style={{ padding: '1px 4px', border: '1px solid var(--border)', borderRadius: 2, marginRight: 4 }}>&crarr;</kbd> open</span>
          <span><kbd style={{ padding: '1px 4px', border: '1px solid var(--border)', borderRadius: 2, marginRight: 4 }}>esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
