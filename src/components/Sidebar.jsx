import React from 'react';

function Sidebar({ views, currentView, onNewView, onLoadView, onDeleteView }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">AI Credit Calculator</h2>
        <button className="btn-primary" onClick={onNewView} style={{ width: '100%' }}>
          + New Estimation
        </button>
      </div>

      <div className="sidebar-list">
        {views.length === 0 ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No saved estimations
          </div>
        ) : (
          views.map(view => (
            <div
              key={view.id}
              className={`sidebar-item ${currentView?.id === view.id ? 'active' : ''}`}
              onClick={() => onLoadView(view)}
            >
              <div className="sidebar-item-name" title={view.name}>
                {view.name}
              </div>
              <button
                className="sidebar-item-delete btn-danger btn-small"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete "${view.name}"?`)) {
                    onDeleteView(view.id);
                  }
                }}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Sidebar;
