import { useRef, useState } from 'react';
import { exportToJSON, exportAllViews, importFromJSON, importMultipleFromJSON, downloadFile } from '../utils/storage.js';

function ExportImport({ currentView, savedViews, onImport }) {
  const fileInputRef = useRef(null);
  const [conflictState, setConflictState] = useState(null);
  // conflictState shape:
  // {
  //   queue: [{ importedView, existingView }],   // remaining conflicts
  //   resolved: [],                              // views ready to import
  // }

  const handleExportCurrent = () => {
    const json = exportToJSON(currentView);
    const filename = `${currentView.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
    downloadFile(json, filename);
  };

  const handleExportAll = () => {
    const json = exportAllViews();
    const filename = `all-estimations-${Date.now()}.json`;
    downloadFile(json, filename);
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const readFileAsText = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    event.target.value = '';

    // Read all files and collect views
    const allViews = [];
    for (const file of files) {
      try {
        const content = await readFileAsText(file);
        const single = importFromJSON(content);
        if (single) {
          allViews.push(single);
        } else {
          const multiple = importMultipleFromJSON(content);
          allViews.push(...multiple);
        }
      } catch (e) {
        console.error('Failed to read file:', file.name, e);
      }
    }

    if (allViews.length === 0) {
      alert('No valid estimations found in the selected files.');
      return;
    }

    // Detect conflicts (same name, case-insensitive)
    const conflicts = [];
    const noConflicts = [];

    for (const view of allViews) {
      const existing = savedViews.find(
        sv => sv.name.trim().toLowerCase() === view.name.trim().toLowerCase()
      );
      if (existing) {
        conflicts.push({ importedView: view, existingView: existing });
      } else {
        noConflicts.push(view);
      }
    }

    const alreadyResolved = noConflicts.map(v => ({
      ...v,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }));

    if (conflicts.length === 0) {
      onImport(alreadyResolved);
      alert(`${alreadyResolved.length} estimation(s) imported successfully.`);
    } else {
      setConflictState({ queue: conflicts, resolved: alreadyResolved });
    }
  };

  const finishImport = (resolved) => {
    setConflictState(null);
    if (resolved.length > 0) {
      onImport(resolved);
      alert(`${resolved.length} estimation(s) imported successfully.`);
    } else {
      alert('No new estimations were imported.');
    }
  };

  const handleConflictChoice = (choice, applyAll) => {
    const { queue, resolved } = conflictState;
    const [current, ...remaining] = queue;

    let newResolved = [...resolved];
    if (choice === 'use') {
      newResolved.push({
        ...current.importedView,
        id: current.existingView.id,
        lastModified: new Date().toISOString()
      });
    }

    if (applyAll) {
      const allRemainingResolved = choice === 'use'
        ? remaining.map(c => ({
            ...c.importedView,
            id: c.existingView.id,
            lastModified: new Date().toISOString()
          }))
        : [];
      finishImport([...newResolved, ...allRemainingResolved]);
      return;
    }

    if (remaining.length === 0) {
      finishImport(newResolved);
      return;
    }

    setConflictState({ queue: remaining, resolved: newResolved });
  };

  return (
    <>
      <div className="export-import-section">
        <button className="btn-secondary btn-small" onClick={handleExportCurrent}>
          Export Current
        </button>
        <button className="btn-secondary btn-small" onClick={handleExportAll}>
          Export All
        </button>
        <button className="btn-secondary btn-small" onClick={handleImportClick}>
          Import JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {conflictState && (
        <div className="import-conflict-overlay">
          <div className="import-conflict-modal">
            <h3 className="import-conflict-title">Import Conflict</h3>
            <p className="import-conflict-message">
              An estimation named <strong>"{conflictState.queue[0].existingView.name}"</strong> already exists.
              Which version would you like to keep?
            </p>
            {conflictState.queue.length > 1 && (
              <p className="import-conflict-remaining">
                {conflictState.queue.length - 1} more conflict(s) after this one
              </p>
            )}
            <div className="import-conflict-actions">
              <button
                className="btn-secondary btn-small"
                onClick={() => handleConflictChoice('keep', false)}
              >
                Keep Existing
              </button>
              <button
                className="btn-primary btn-small"
                onClick={() => handleConflictChoice('use', false)}
              >
                Use Imported
              </button>
            </div>
            {conflictState.queue.length > 1 && (
              <div className="import-conflict-apply-all">
                <button
                  className="btn-secondary btn-small"
                  onClick={() => handleConflictChoice('keep', true)}
                >
                  Keep All Existing
                </button>
                <button
                  className="btn-primary btn-small"
                  onClick={() => handleConflictChoice('use', true)}
                >
                  Use All Imported
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ExportImport;
