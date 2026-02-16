import { useState } from 'react';
import { calculatePayGoTotal, calculatePTUTotal } from '../utils/calculations.js';
import CostTable from './CostTable.jsx';
import CombinedProjectionTable from './CombinedProjectionTable.jsx';
import InfoTooltip from './InfoTooltip.jsx';

function ResultsPanel({ action, modelPricing, customerMetrics, settings }) {
  const [showCredits, setShowCredits] = useState(false);
  const [showPayGo, setShowPayGo] = useState(true);
  const [showPTU, setShowPTU] = useState(true);

  // Calculate both PayGo and PTU totals
  const payGoData = calculatePayGoTotal(action, modelPricing, customerMetrics, settings);
  const ptuData = calculatePTUTotal(action, modelPricing, customerMetrics, settings);

  const payGoTooltip = {
    summary: "Pay-as-You-Go (PayGo) - Pay only for what you use",
    details: [
      {
        title: "How it works",
        content: "You're charged per token processed. Each API call consumes tokens based on the input (prompt) and output (response) size."
      },
      {
        title: "Pricing breakdown",
        content: `• Input tokens: Charged at the model's input rate per million tokens
• Output tokens: Charged at the model's output rate per million tokens
• Token caching: ${settings.inputTokenCachingPercent}% of input tokens are reused from cache, saving ${settings.cachedTokenDiscountPercent}% on those tokens
• Volume discount: ${settings.payGoDiscountPercent}% discount applied to all token costs
• Reranker: Additional $${settings.rerankerCostPerAction} per action if semantic ranking is enabled`
      },
      {
        title: "Best for",
        content: "Variable workloads, development/testing, or lower usage volumes where you want predictable per-use costs."
      }
    ]
  };

  const ptuTooltip = {
    summary: "Provisioned Throughput Units (PTU) - Reserved capacity pricing",
    details: [
      {
        title: "How it works",
        content: "You reserve dedicated AI processing capacity upfront. PTUs guarantee availability and consistent performance for high-volume production workloads."
      },
      {
        title: "Pricing breakdown",
        content: `• PTU capacity: Each PTU costs $${settings.yearlyPTUCost.toLocaleString()}/year (billed monthly)
• Increment size: PTUs are purchased in blocks of ${settings.ptuIncrements}
• Model throughput: Each model has different tokens/sec capacity per PTU (configurable in Model Pricing)
• Capacity planning: Required PTUs calculated from peak throughput (estimated at 2× average usage)
• Unlimited tokens: Once reserved, process unlimited tokens within your PTU capacity
• Reranker: Additional $${settings.rerankerCostPerAction} per action if semantic ranking is enabled`
      },
      {
        title: "Best for",
        content: "High-volume production workloads with predictable usage patterns where cost per token decreases significantly."
      }
    ]
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-lg)',
        marginTop: 'var(--spacing-2xl)'
      }}>
        <h2 style={{ margin: 0 }}>Cost Estimation Results</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            Show in:
          </span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={showCredits}
              onChange={(e) => setShowCredits(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
          <span style={{
            fontSize: 'var(--font-size-sm)',
            color: showCredits ? 'var(--accent-teal)' : 'var(--accent-orange)',
            fontWeight: 600,
            minWidth: '80px'
          }}>
            {showCredits ? 'AI Credits' : 'Dollars ($)'}
          </span>
        </div>
      </div>

      {/* Pricing Model Selection */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-lg)',
        marginTop: 'var(--spacing-md)',
        paddingBottom: 'var(--spacing-md)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <span style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-secondary)',
          fontWeight: 500
        }}>
          Display Pricing Models:
        </span>

        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-xs)',
          cursor: 'pointer',
          fontSize: 'var(--font-size-sm)'
        }}>
          <input
            type="checkbox"
            checked={showPayGo}
            onChange={(e) => setShowPayGo(e.target.checked || !showPTU)}
            style={{ cursor: 'pointer' }}
          />
          <span>Pay-as-You-Go</span>
        </label>

        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-xs)',
          cursor: 'pointer',
          fontSize: 'var(--font-size-sm)'
        }}>
          <input
            type="checkbox"
            checked={showPTU}
            onChange={(e) => setShowPTU(e.target.checked || !showPayGo)}
            style={{ cursor: 'pointer' }}
          />
          <span>PTU</span>
        </label>
      </div>

      <div className="results-container" style={{
        display: 'grid',
        gridTemplateColumns: (showPayGo && showPTU) ? '1fr 1fr' : '1fr',
        gap: 'var(--spacing-xl)',
        marginTop: 'var(--spacing-xl)'
      }}>
        {showPayGo && (
          <CostTable
            title="Pay-as-You-Go Pricing"
            tooltipSections={payGoTooltip}
            data={payGoData}
            action={action}
            customerMetrics={customerMetrics}
            settings={settings}
            isPTU={false}
            showCredits={showCredits}
          />
        )}

        {showPTU && (
          <CostTable
            title="PTU Pricing"
            tooltipSections={ptuTooltip}
            data={ptuData}
            action={action}
            customerMetrics={customerMetrics}
            settings={settings}
            isPTU={true}
            showCredits={showCredits}
          />
        )}
      </div>

      {/* Unified 5-Year Projection Table */}
      <CombinedProjectionTable
        payGoData={payGoData}
        ptuData={ptuData}
        showPayGo={showPayGo}
        showPTU={showPTU}
        showCredits={showCredits}
        settings={settings}
      />
    </div>
  );
}

export default ResultsPanel;
