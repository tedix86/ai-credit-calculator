import { useState } from 'react';
import InfoTooltip from './InfoTooltip.jsx';

function GlobalSettings({ settings, onChange }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleChange = (field, value) => {
    const numValue = value === '' ? '' : parseFloat(value) || 0;
    onChange({
      ...settings,
      [field]: numValue
    });
  };

  const handleBlur = (field, value) => {
    if (value === '') {
      onChange({
        ...settings,
        [field]: 0
      });
    }
  };

  return (
    <div className="collapsible-panel">
      <div className="collapsible-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h3 className="panel-title">Global Settings</h3>
        <span>{isCollapsed ? '▼' : '▲'}</span>
      </div>

      {!isCollapsed && (
        <div className="collapsible-content">
          <div className="settings-grid">
            <div className="metric-field">
              <label>
                AI Credit Conversion Rate (credits per $1)
                <InfoTooltip text="Converts dollar costs to AI credits. Used in final results to show credit consumption. Example: $1 × 200 = 200 AI credits." />
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={settings.aiCreditConversionRate}
                onChange={(e) => handleChange('aiCreditConversionRate', e.target.value)}
                onBlur={(e) => handleBlur('aiCreditConversionRate', e.target.value)}
              />
            </div>

            <div className="metric-field">
              <label>
                Reranker Cost per Action ($)
                <InfoTooltip text="Cost added when semantic reranking is enabled. Applied once per AI action. Used to improve search result relevance." />
              </label>
              <input
                type="number"
                min="0"
                step="0.0001"
                value={settings.rerankerCostPerAction}
                onChange={(e) => handleChange('rerankerCostPerAction', e.target.value)}
                onBlur={(e) => handleBlur('rerankerCostPerAction', e.target.value)}
              />
            </div>

            <div className="metric-field">
              <label>
                PayGo Discount (%)
                <InfoTooltip text="Discount applied to Pay-as-You-Go token costs. Azure often provides volume discounts. Only affects PayGo pricing, not PTU." />
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={settings.payGoDiscountPercent}
                onChange={(e) => handleChange('payGoDiscountPercent', e.target.value)}
                onBlur={(e) => handleBlur('payGoDiscountPercent', e.target.value)}
              />
            </div>

            <div className="metric-field">
              <label>
                Input Token Caching (%)
                <InfoTooltip text="Percentage of input tokens that benefit from prompt caching. Cached tokens cost less. Typically 25% for repeated prompts." />
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={settings.inputTokenCachingPercent}
                onChange={(e) => handleChange('inputTokenCachingPercent', e.target.value)}
                onBlur={(e) => handleBlur('inputTokenCachingPercent', e.target.value)}
              />
            </div>

            <div className="metric-field">
              <label>
                Cached Token Discount (%)
                <InfoTooltip text="Discount on cached input tokens. Azure typically offers 75% off cached tokens. Reduces costs for repeated prompt patterns." />
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={settings.cachedTokenDiscountPercent}
                onChange={(e) => handleChange('cachedTokenDiscountPercent', e.target.value)}
                onBlur={(e) => handleBlur('cachedTokenDiscountPercent', e.target.value)}
              />
            </div>

            <div className="metric-field">
              <label>
                Yearly Cost per PTU ($)
                <InfoTooltip text="Annual cost for one Provisioned Throughput Unit. PTUs provide reserved capacity. Used to calculate PTU pricing option." />
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={settings.yearlyPTUCost}
                onChange={(e) => handleChange('yearlyPTUCost', e.target.value)}
                onBlur={(e) => handleBlur('yearlyPTUCost', e.target.value)}
              />
            </div>

            <div className="metric-field">
              <label>
                PTU Increments
                <InfoTooltip text="PTUs are purchased in increments (typically 25). System rounds up to nearest increment when calculating required PTUs." />
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={settings.ptuIncrements}
                onChange={(e) => handleChange('ptuIncrements', e.target.value)}
                onBlur={(e) => handleBlur('ptuIncrements', e.target.value)}
              />
            </div>

            <div className="metric-field">
              <label>
                Context Window (tokens)
                <InfoTooltip text="Maximum token context size for models. Used as reference for throughput calculations. Standard is 1M tokens for latest models." />
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={settings.contextWindow}
                onChange={(e) => handleChange('contextWindow', e.target.value)}
                onBlur={(e) => handleBlur('contextWindow', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GlobalSettings;
