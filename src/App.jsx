import { useState, useEffect } from 'react';
import { createDefaultView } from './constants/defaults.js';
import { loadViews, saveView, deleteView as deleteViewFromStorage } from './utils/storage.js';
import Sidebar from './components/Sidebar.jsx';
import ModelPricingEditor from './components/ModelPricingEditor.jsx';
import ActionBuilder from './components/ActionBuilder.jsx';
import CustomerMetrics from './components/CustomerMetrics.jsx';
import GlobalSettings from './components/GlobalSettings.jsx';
import ResultsPanel from './components/ResultsPanel.jsx';
import ExportImport from './components/ExportImport.jsx';

function App() {
  const [savedViews, setSavedViews] = useState([]);
  const [currentView, setCurrentView] = useState(null);

  // Migrate old customer metrics structure to new cohort-based model
  const migrateCustomerMetrics = (metrics) => {
    // If it has the old structure (numCustomers), migrate it
    if (metrics.numCustomers !== undefined && !metrics.newCustomersPerYear) {
      return {
        ...metrics,
        newCustomersPerYear: [metrics.numCustomers], // Convert total customers to Year 1 cohort
        numCustomers: undefined // Remove old field
      };
    }
    return metrics;
  };

  // Load saved views on mount
  useEffect(() => {
    const views = loadViews();

    // Migrate old views to new data structure
    const migratedViews = views.map(view => ({
      ...view,
      customerMetrics: migrateCustomerMetrics(view.customerMetrics)
    }));

    setSavedViews(migratedViews);

    // Load the first view or create a new one
    if (migratedViews.length > 0) {
      setCurrentView(migratedViews[0]);
    } else {
      const newView = createDefaultView();
      setCurrentView(newView);
    }
  }, []);

  // Create new view
  const handleNewView = () => {
    const newView = createDefaultView();
    setCurrentView(newView);
  };

  // Save current view
  const handleSaveView = () => {
    if (!currentView) return;

    const success = saveView(currentView);
    if (success) {
      // Reload views
      const views = loadViews();
      setSavedViews(views);
    }
  };

  // Auto-save when currentView changes (debounced)
  useEffect(() => {
    if (!currentView) return;

    const timeoutId = setTimeout(() => {
      handleSaveView();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [currentView]);

  // Load a view
  const handleLoadView = (view) => {
    setCurrentView(view);
  };

  // Delete a view
  const handleDeleteView = (viewId) => {
    const success = deleteViewFromStorage(viewId);
    if (success) {
      const views = loadViews();
      setSavedViews(views);

      // If the deleted view was the current one, load another or create new
      if (currentView?.id === viewId) {
        if (views.length > 0) {
          setCurrentView(views[0]);
        } else {
          setCurrentView(createDefaultView());
        }
      }
    }
  };

  // Update current view
  const updateView = (updates) => {
    setCurrentView(prev => ({
      ...prev,
      ...updates,
      lastModified: new Date().toISOString()
    }));
  };

  // Update view name
  const handleNameChange = (name) => {
    updateView({ name });
  };

  // Update model pricing
  const handleModelPricingChange = (modelPricing) => {
    updateView({ modelPricing });
  };

  // Update action
  const handleActionChange = (action) => {
    updateView({ action });
  };

  // Update customer metrics
  const handleCustomerMetricsChange = (customerMetrics) => {
    updateView({ customerMetrics });
  };

  // Update settings
  const handleSettingsChange = (settings) => {
    updateView({ settings });
  };

  // Import views (accepts array)
  const handleImportViews = (importedViews) => {
    importedViews.forEach(view => saveView(view));
    const updatedViews = loadViews();
    setSavedViews(updatedViews);
    if (importedViews.length > 0) {
      setCurrentView(importedViews[0]);
    }
  };

  if (!currentView) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app-container">
      <Sidebar
        views={savedViews}
        currentView={currentView}
        onNewView={handleNewView}
        onLoadView={handleLoadView}
        onDeleteView={handleDeleteView}
      />

      <div className="main-content">
        <div className="main-header">
          <input
            type="text"
            className="view-name-input"
            value={currentView.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Estimation Name"
          />
          <ExportImport
            currentView={currentView}
            savedViews={savedViews}
            onImport={handleImportViews}
          />
        </div>

        <ModelPricingEditor
          modelPricing={currentView.modelPricing}
          onChange={handleModelPricingChange}
        />

        <ActionBuilder
          action={currentView.action}
          onChange={handleActionChange}
          customerMetrics={currentView.customerMetrics}
          onCustomerMetricsChange={handleCustomerMetricsChange}
        />

        <CustomerMetrics
          metrics={currentView.customerMetrics}
          onChange={handleCustomerMetricsChange}
        />

        <GlobalSettings
          settings={currentView.settings}
          onChange={handleSettingsChange}
        />

        <ResultsPanel
          action={currentView.action}
          modelPricing={currentView.modelPricing}
          customerMetrics={currentView.customerMetrics}
          settings={currentView.settings}
        />
      </div>
    </div>
  );
}

export default App;
