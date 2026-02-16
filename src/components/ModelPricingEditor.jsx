import { useState } from 'react';
import { AVAILABLE_MODELS } from '../constants/defaults.js';
import { fetchPricingWithFallback } from '../utils/azurePricing.js';

function ModelPricingEditor({ modelPricing, onChange }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handlePriceChange = (model, type, value) => {
    const numValue = parseFloat(value) || 0;
    onChange({
      ...modelPricing,
      [model]: {
        ...modelPricing[model],
        [type]: numValue
      }
    });
  };

  const handleFetchLatestPrices = async (e) => {
    e.stopPropagation(); // Prevent collapse/expand

    setIsLoading(true);
    setStatusMessage('Fetching latest prices...');

    try {
      const latestPricing = await fetchPricingWithFallback('eastus');

      // Merge new prices with existing PTU capacity values
      // Azure API doesn't provide PTU capacity, so we preserve existing values
      const mergedPricing = {};
      Object.keys(latestPricing).forEach(model => {
        mergedPricing[model] = {
          ...latestPricing[model],
          ptuCapacity: modelPricing[model]?.ptuCapacity || latestPricing[model]?.ptuCapacity || 4000
        };
      });

      // Update pricing
      onChange(mergedPricing);

      setStatusMessage('✓ Prices updated successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
      setStatusMessage('✗ Failed to fetch prices. Using defaults.');
      setTimeout(() => setStatusMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="collapsible-panel">
      <div className="collapsible-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h3 className="panel-title">
          Model Pricing (per 1M tokens)
          {statusMessage && (
            <span style={{
              marginLeft: 'var(--spacing-md)',
              fontSize: 'var(--font-size-sm)',
              color: statusMessage.includes('✓') ? 'var(--accent-green)' : 'var(--accent-orange)',
              fontWeight: 'normal'
            }}>
              {statusMessage}
            </span>
          )}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <button
            className="btn-secondary btn-small"
            onClick={handleFetchLatestPrices}
            disabled={isLoading}
            title="Fetch latest Azure OpenAI pricing"
          >
            {isLoading ? 'Fetching...' : 'Get Latest Prices'}
          </button>
          <span>{isCollapsed ? '▼' : '▲'}</span>
        </div>
      </div>

      {!isCollapsed && (
        <div className="collapsible-content">
          <table className="pricing-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Input ($/1M)</th>
                <th>Output ($/1M)</th>
                <th>PTU Capacity (tokens/sec)</th>
              </tr>
            </thead>
            <tbody>
              {AVAILABLE_MODELS.map(model => (
                <tr key={model}>
                  <td style={{ fontWeight: 500, color: 'var(--text-white)' }}>{model}</td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={modelPricing[model]?.input || 0}
                      onChange={(e) => handlePriceChange(model, 'input', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={modelPricing[model]?.output || 0}
                      onChange={(e) => handlePriceChange(model, 'output', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="100"
                      min="0"
                      value={modelPricing[model]?.ptuCapacity || 4000}
                      onChange={(e) => handlePriceChange(model, 'ptuCapacity', e.target.value)}
                      title="Tokens per second throughput per PTU for this model"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ModelPricingEditor;
