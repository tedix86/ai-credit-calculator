import { exportToJSON, exportAllViews, importFromJSON, importMultipleFromJSON, downloadFile } from '../utils/storage.js';

function ExportImport({ currentView, onImport }) {
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

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;

        // Try importing single view first
        let importedView = importFromJSON(content);

        if (importedView) {
          // Generate new ID to avoid conflicts
          importedView = {
            ...importedView,
            id: crypto.randomUUID(),
            name: `${importedView.name} (Imported)`,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
          };
          onImport(importedView);
          alert('View imported successfully!');
        } else {
          // Try importing multiple views
          const importedViews = importMultipleFromJSON(content);
          if (importedViews.length > 0) {
            alert(`Imported ${importedViews.length} views successfully!`);
            // Import the first one as current
            const firstView = {
              ...importedViews[0],
              id: crypto.randomUUID(),
              name: `${importedViews[0].name} (Imported)`,
              createdAt: new Date().toISOString(),
              lastModified: new Date().toISOString()
            };
            onImport(firstView);
          } else {
            alert('Failed to import: Invalid JSON format');
          }
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Failed to import: Invalid JSON file');
      }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = '';
  };

  return (
    <div className="export-import-section">
      <button className="btn-secondary btn-small" onClick={handleExportCurrent}>
        Export Current
      </button>

      <button className="btn-secondary btn-small" onClick={handleExportAll}>
        Export All
      </button>

      <div className="file-input-wrapper">
        <button className="btn-secondary btn-small">
          Import JSON
        </button>
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
        />
      </div>
    </div>
  );
}

export default ExportImport;
