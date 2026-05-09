'use client';
import { Home, Plus, X, LayoutGrid } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/editorStore';
import { addPage, deletePage, setActivePage } from '../../store/slices/pagesSlice';
import { removePageElements } from '../../store/slices/elementsSlice';

export default function PageTabs() {
  const dispatch = useAppDispatch();
  const { pages, activePageId } = useAppSelector(s => s.pages);

  const handleDeletePage = (pageId: string) => {
    if (pages.length <= 1) return;
    dispatch(removePageElements(pageId));
    dispatch(deletePage(pageId));
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 3,
      padding: '0 8px',
      height: 36,
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      overflowX: 'auto',
      flexShrink: 0,
    }}>
      {/* Home button */}
      <button
        className="btn-icon"
        style={{
          width: 28, height: 28,
          background: 'var(--accent-blue)',
          color: 'white',
          borderRadius: 'var(--radius-sm)',
          flexShrink: 0,
        }}
        title="Home"
      >
        <Home size={14} />
      </button>

      {/* Page tabs */}
      {pages.map((page) => (
        <div
          key={page.id}
          style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}
        >
          {/* Page name button */}
          <button
            onClick={() => dispatch(setActivePage(page.id))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 10px',
              background: activePageId === page.id ? page.color : 'var(--bg-card)',
              border: 'none',
              borderRadius: pages.length > 1 ? 'var(--radius-sm) 0 0 var(--radius-sm)' : 'var(--radius-sm)',
              color: activePageId === page.id ? 'white' : 'var(--text-secondary)',
              fontSize: 12,
              fontWeight: activePageId === page.id ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
              height: 26,
              whiteSpace: 'nowrap',
            }}
          >
            {page.name}
          </button>

          {/* Layout tag */}
          <button
            onClick={() => dispatch(setActivePage(page.id))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              padding: '3px 6px',
              background: 'var(--bg-tertiary)',
              border: 'none',
              borderLeft: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontSize: 10,
              cursor: 'pointer',
              height: 26,
              transition: 'background 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
          >
            <LayoutGrid size={10} />
            Layout
          </button>

          {/* Delete button */}
          {pages.length > 1 && (
            <button
              onClick={() => handleDeletePage(page.id)}
              style={{
                display: 'flex', alignItems: 'center',
                padding: '3px 4px',
                background: 'var(--bg-tertiary)',
                border: 'none',
                borderLeft: '1px solid var(--border-color)',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                height: 26,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-red)';
                (e.currentTarget as HTMLButtonElement).style.color = 'white';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-tertiary)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
              }}
            >
              <X size={10} />
            </button>
          )}
        </div>
      ))}

      {/* Add page button */}
      <button
        onClick={() => dispatch(addPage())}
        className="btn-icon"
        title="Add Page"
        style={{ flexShrink: 0 }}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
