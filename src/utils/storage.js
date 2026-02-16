import { STORAGE_KEY } from '../constants/defaults.js';

/**
 * Load all saved views from localStorage
 * @returns {Array} Array of saved estimation views
 */
export const loadViews = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading views from localStorage:', error);
    return [];
  }
};

/**
 * Save a view to localStorage
 * Updates existing view if ID matches, otherwise creates new one
 * @param {Object} view - The estimation view to save
 * @returns {boolean} Success status
 */
export const saveView = (view) => {
  try {
    const views = loadViews();
    const existingIndex = views.findIndex(v => v.id === view.id);

    const updatedView = {
      ...view,
      lastModified: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      views[existingIndex] = updatedView;
    } else {
      views.push(updatedView);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
    return true;
  } catch (error) {
    console.error('Error saving view to localStorage:', error);
    return false;
  }
};

/**
 * Delete a view from localStorage
 * @param {string} viewId - The ID of the view to delete
 * @returns {boolean} Success status
 */
export const deleteView = (viewId) => {
  try {
    const views = loadViews();
    const filteredViews = views.filter(v => v.id !== viewId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredViews));
    return true;
  } catch (error) {
    console.error('Error deleting view from localStorage:', error);
    return false;
  }
};

/**
 * Export a view to JSON format
 * @param {Object} view - The estimation view to export
 * @returns {string} JSON string
 */
export const exportToJSON = (view) => {
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    view: view
  };
  return JSON.stringify(exportData, null, 2);
};

/**
 * Export all views to JSON format
 * @returns {string} JSON string
 */
export const exportAllViews = () => {
  const views = loadViews();
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    views: views
  };
  return JSON.stringify(exportData, null, 2);
};

/**
 * Import a view from JSON string
 * Validates the format and returns the view
 * @param {string} jsonString - JSON string to parse
 * @returns {Object} Parsed view object or null if invalid
 */
export const importFromJSON = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);

    // Validate format
    if (!data.version || !data.view) {
      throw new Error('Invalid JSON format');
    }

    // Ensure the view has required fields
    if (!data.view.id || !data.view.name) {
      throw new Error('Invalid view data');
    }

    return data.view;
  } catch (error) {
    console.error('Error importing from JSON:', error);
    return null;
  }
};

/**
 * Import multiple views from JSON string
 * @param {string} jsonString - JSON string to parse
 * @returns {Array} Array of parsed view objects or empty array if invalid
 */
export const importMultipleFromJSON = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);

    // Validate format
    if (!data.version || !data.views || !Array.isArray(data.views)) {
      throw new Error('Invalid JSON format for multiple views');
    }

    return data.views;
  } catch (error) {
    console.error('Error importing multiple views from JSON:', error);
    return [];
  }
};

/**
 * Download a file with the given content
 * @param {string} content - File content
 * @param {string} filename - Name of the file to download
 */
export const downloadFile = (content, filename) => {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
