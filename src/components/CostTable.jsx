import { getCostsByModel } from '../utils/calculations.js';
import InfoTooltip from './InfoTooltip.jsx';

function CostTable({ title, tooltip, tooltipSections, data, action, customerMetrics, settings, isPTU = false, showCredits = false }) {
  const formatCurrency = (amount) => {
    return `$${amount.toFixed(3)}`;
  };

  const formatCredits = (amount) => {
    const credits = amount * settings.aiCreditConversionRate;
    return credits.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' credits';
  };

  const formatNumber = (num) => {
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  // Helper to format value based on toggle
  const formatValue = (dollarAmount) => {
    return showCredits ? formatCredits(dollarAmount) : formatCurrency(dollarAmount);
  };

  // Helper to get the correct CSS class for values
  const getValueClass = () => {
    return `result-value ${showCredits ? 'credits' : 'cost'}`;
  };

  // Helper to get just the color class (for inline values)
  const getColorClass = () => {
    return showCredits ? 'credits' : 'cost';
  };

  // Get Year 5 metrics for display (final year with highest adoption)
  const getYear5Metrics = () => {
    if (!data.yearlyBreakdown || data.yearlyBreakdown.length === 0) {
      return { monthly: 0, yearly: 0 };
    }
    const finalYear = data.yearlyBreakdown[data.yearlyBreakdown.length - 1];
    return {
      monthly: finalYear.totalActionsPerMonth || 0,
      yearly: (finalYear.totalActionsPerMonth || 0) * 12
    };
  };

  const year5Actions = getYear5Metrics();

  return (
    <div className="result-card">
      <div className="result-card-header">
        {title}
        {tooltipSections && <InfoTooltip sections={tooltipSections} />}
        {tooltip && !tooltipSections && <InfoTooltip text={tooltip} />}
      </div>

      {/* Per Action - Monthly */}
      <div className="result-section">
        <div className="result-section-title">
          Per AI Action (Monthly)
          <InfoTooltip sections={{
            summary: "Cost per single AI action (Year 5)",
            details: [{
              title: "What is this?",
              content: "The cost for one AI action based on Year 5 metrics, when adoption is highest. This represents the mature state cost per action."
            }, {
              title: "Calculation",
              content: "Monthly Cost ÷ Total AI Actions Per Month (Year 5)"
            }]
          }} />
        </div>
        {year5Actions.monthly > 0 && (
          <div className="result-row" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
            <span># of AI actions per month (Year 5): {formatNumber(year5Actions.monthly)}</span>
          </div>
        )}

        {!isPTU && (
          <>
            {/* Model breakdown for PayGo */}
            <div className="model-breakdown">
              {Object.entries(getCostsByModel(action.requests, data.requestBreakdowns || [])).map(([model, costs]) => (
                <div key={model} className="model-item">
                  <div className="model-name">{model}</div>
                  <div className="model-details">
                    <div>Input (cached): <span className={getColorClass()} style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 500 }}>{formatValue(costs.inputCachedCost)}</span></div>
                    <div>Input (uncached): <span className={getColorClass()} style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 500 }}>{formatValue(costs.inputUncachedCost)}</span></div>
                    <div>Output: <span className={getColorClass()} style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 500 }}>{formatValue(costs.outputCost)}</span></div>
                    <div style={{ fontWeight: 600, marginTop: '4px' }}>
                      Total: <span className={getColorClass()} style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 600 }}>{formatValue(costs.totalCost)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {action.useReranker && (
              <div className="result-row">
                <span className="result-label">Semantic Ranking Cost</span>
                <span className={getValueClass()}>{formatValue(data.actionCostBreakdown?.rerankerCost || 0)}</span>
              </div>
            )}

            <div className="result-row">
              <span className="result-label">
                Raw Token Cost (before {data.actionCostBreakdown?.payGoDiscount}% discount)
              </span>
              <span className={getValueClass()}>{formatValue(data.actionCostBreakdown?.rawTokenCost || 0)}</span>
            </div>

            <div className="result-row">
              <span className="result-label">Token Cost (after discount)</span>
              <span className={getValueClass()}>{formatValue(data.actionCostBreakdown?.tokenCost || 0)}</span>
            </div>
          </>
        )}

        {isPTU && data.yearlyBreakdown && data.yearlyBreakdown[0] && (
          <>
            <div className="result-row">
              <span className="result-label">Required PTUs</span>
              <span className="result-value">{data.yearlyBreakdown[0].requiredPTUs}</span>
            </div>

            <div className="result-row">
              <span className="result-label">PTU Cost</span>
              <span className={getValueClass()}>{formatValue(data.yearlyBreakdown[0].ptuMonthlyCost)}</span>
            </div>

            {action.useReranker && (
              <div className="result-row">
                <span className="result-label">Semantic Ranking Cost</span>
                <span className={getValueClass()}>{formatValue(data.yearlyBreakdown[0].rerankerMonthlyCost)}</span>
              </div>
            )}
          </>
        )}

        <div className="result-total">
          <div className="result-row">
            <span className="result-label">{showCredits ? 'Total AI Credits' : 'Total Cost'}</span>
            <span className={getValueClass()}>{formatValue(isPTU && data.yearlyBreakdown?.[0] ? data.yearlyBreakdown[0].monthlyCost : data.perActionCost || 0)}</span>
          </div>
        </div>
      </div>

      {/* Per Action - Yearly */}
      <div className="result-section">
        <div className="result-section-title">
          Per AI Action (Yearly)
          <InfoTooltip sections={{
            summary: "Annual cost per single AI action (Year 5)",
            details: [{
              title: "Calculation",
              content: "This is the monthly per-action cost (Year 5) multiplied by 12 months."
            }]
          }} />
        </div>
        {year5Actions.yearly > 0 && (
          <div className="result-row" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
            <span># of AI actions per year (Year 5): {formatNumber(year5Actions.yearly)}</span>
          </div>
        )}
        <div className="result-row">
          <span className="result-label">{showCredits ? 'Total AI Credits' : 'Total Cost'}</span>
          <span className={getValueClass()}>
            {formatValue((isPTU && data.yearlyBreakdown?.[0] ? data.yearlyBreakdown[0].monthlyCost : data.perActionCost || 0) * 12)}
          </span>
        </div>
      </div>

      {/* Per User - Monthly */}
      <div className="result-section">
        <div className="result-section-title">
          Per User (Monthly)
          <InfoTooltip sections={{
            summary: "Average cost per active user (Year 5)",
            details: [{
              title: "Calculation",
              content: "Monthly Cost ÷ Active Users (Year 5)"
            }]
          }} />
        </div>
        <div className="result-row">
          <span className="result-label">{showCredits ? 'Total AI Credits' : 'Total Cost'}</span>
          <span className={getValueClass()}>{formatValue(data.perUserMonthly || 0)}</span>
        </div>
      </div>

      {/* Per User - Yearly */}
      <div className="result-section">
        <div className="result-section-title">
          Per User (Yearly)
          <InfoTooltip sections={{
            summary: "Annual cost per active user (Year 5)",
            details: [{
              title: "Calculation",
              content: "Yearly Cost ÷ Active Users (Year 5). This is the monthly per-user cost multiplied by 12 months."
            }]
          }} />
        </div>
        <div className="result-row">
          <span className="result-label">{showCredits ? 'Total AI Credits' : 'Total Cost'}</span>
          <span className={getValueClass()}>{formatValue(data.perUserYearly || 0)}</span>
        </div>
      </div>

      {/* Per Customer - Monthly */}
      <div className="result-section">
        <div className="result-section-title">
          Per Customer (Monthly)
          <InfoTooltip sections={{
            summary: "Average monthly cost per customer (Year 5)",
            details: [{
              title: "What is this?",
              content: "The average cost per customer organization based on Year 5 metrics. This includes all customers regardless of their adoption level."
            }, {
              title: "Calculation",
              content: "Monthly Cost ÷ Total Customers (Year 5)"
            }]
          }} />
        </div>
        <div className="result-row">
          <span className="result-label">{showCredits ? 'Total AI Credits' : 'Total Cost'}</span>
          <span className={getValueClass()}>
            {formatValue(data.yearlyBreakdown?.[data.yearlyBreakdown.length - 1]?.perCustomerMonthly || 0)}
          </span>
        </div>
      </div>

      {/* Per Customer - Yearly */}
      <div className="result-section">
        <div className="result-section-title">
          Per Customer (Yearly)
          <InfoTooltip sections={{
            summary: "Average yearly cost per customer (Year 5)",
            details: [{
              title: "Calculation",
              content: "Yearly Cost ÷ Total Customers (Year 5). This is the monthly per-customer cost multiplied by 12 months."
            }]
          }} />
        </div>
        <div className="result-row">
          <span className="result-label">{showCredits ? 'Total AI Credits' : 'Total Cost'}</span>
          <span className={getValueClass()}>
            {formatValue(data.yearlyBreakdown?.[data.yearlyBreakdown.length - 1]?.perCustomerYearly || 0)}
          </span>
        </div>
      </div>

      {/* Segment - Monthly */}
      <div className="result-section">
        <div className="result-section-title">
          Segment (Monthly)
          <InfoTooltip sections={{
            summary: "Total monthly cost across all customers (Year 5)",
            details: [{
              title: "What is this?",
              content: "The total monthly cost for all customers in your segment based on Year 5 metrics. This is the sum of costs across every customer organization."
            }, {
              title: "Calculation",
              content: "Sum of monthly costs across all customers in Year 5. This equals Per Customer (Monthly) × Total Customers."
            }, {
              title: "Use case",
              content: "Use this for budgeting and financial planning to understand the total monthly AI operation costs for your entire customer base."
            }]
          }} />
        </div>
        <div className="result-row">
          <span className="result-label">{showCredits ? 'Total AI Credits' : 'Total Cost'}</span>
          <span className={getValueClass()}>
            {formatValue(data.yearlyBreakdown?.[data.yearlyBreakdown.length - 1]?.monthlyCost || 0)}
          </span>
        </div>
      </div>

      {/* Segment - Yearly */}
      <div className="result-section">
        <div className="result-section-title">
          Segment (Yearly)
          <InfoTooltip sections={{
            summary: "Total yearly cost across all customers (Year 5)",
            details: [{
              title: "What is this?",
              content: "The total annual cost for all customers in your segment based on Year 5 metrics. This is the sum of yearly costs across every customer organization."
            }, {
              title: "Calculation",
              content: "Sum of yearly costs across all customers in Year 5. This equals Segment (Monthly) × 12 months."
            }, {
              title: "Use case",
              content: "Use this for annual budget planning and understanding the full yearly AI operation costs for your entire customer segment."
            }]
          }} />
        </div>
        <div className="result-row">
          <span className="result-label">{showCredits ? 'Total AI Credits' : 'Total Cost'}</span>
          <span className={getValueClass()}>
            {formatValue(data.yearlyBreakdown?.[data.yearlyBreakdown.length - 1]?.yearlyCost || 0)}
          </span>
        </div>
      </div>

    </div>
  );
}

export default CostTable;
