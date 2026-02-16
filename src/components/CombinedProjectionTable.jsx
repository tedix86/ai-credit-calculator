import InfoTooltip from './InfoTooltip.jsx';

function CombinedProjectionTable({ payGoData, ptuData, showPayGo = true, showPTU = true, showCredits, settings }) {
  // Number formatting helpers (reused from CostTable pattern)
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

  const formatValue = (dollarAmount) => {
    return showCredits ? formatCredits(dollarAmount) : formatCurrency(dollarAmount);
  };

  const formatNumber = (num) => {
    return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  // Get color class based on toggle state
  const getColorClass = () => {
    return showCredits ? 'credits' : 'cost';
  };

  // Ensure both datasets have the same years
  const numYears = Math.max(
    payGoData.yearlyBreakdown?.length || 0,
    ptuData.yearlyBreakdown?.length || 0
  );

  // Dynamic title based on number of years
  const yearLabel = numYears === 1 ? '1-Year' : `${numYears}-Year`;

  return (
    <div className="combined-projection-table-wrapper">
      <div className="result-section-title" style={{ marginBottom: 'var(--spacing-lg)' }}>
        {yearLabel} Projection Comparison
        <InfoTooltip sections={{
          summary: "Side-by-side comparison of pricing models",
          details: [{
            title: "What is this?",
            content: "This table compares Pay-as-You-Go and PTU pricing models across all years, showing per-action, per-user, and per-customer costs side by side."
          }, {
            title: "How to use",
            content: "Review how costs evolve over time as adoption increases. Compare PayGo vs PTU for each metric to identify the optimal pricing model for your needs."
          }]
        }} />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="combined-projection-table">
          <thead>
            <tr>
              <th rowSpan="2">YEAR</th>
              <th rowSpan="2">ACTIVE USERS</th>
              {(showPayGo || showPTU) && (
                <th colSpan={showPayGo && showPTU ? 2 : 1}>AI ACTION COST</th>
              )}
              {(showPayGo || showPTU) && (
                <th colSpan={showPayGo && showPTU ? 2 : 1}>PER USER COST</th>
              )}
              {(showPayGo || showPTU) && (
                <th colSpan={showPayGo && showPTU ? 2 : 1}>AVG CUSTOMER COST/MONTH</th>
              )}
              {(showPayGo || showPTU) && (
                <th colSpan={showPayGo && showPTU ? 2 : 1}>AVG CUSTOMER COST/YEAR</th>
              )}
              {(showPayGo || showPTU) && (
                <th colSpan={showPayGo && showPTU ? 2 : 1}>SEGMENT COST/MONTH</th>
              )}
              {(showPayGo || showPTU) && (
                <th colSpan={showPayGo && showPTU ? 2 : 1}>SEGMENT COST/YEAR</th>
              )}
            </tr>
            <tr>
              {showPayGo && <th>PayGo</th>}
              {showPTU && <th>PTU</th>}
              {showPayGo && <th>PayGo</th>}
              {showPTU && <th>PTU</th>}
              {showPayGo && <th>PayGo</th>}
              {showPTU && <th>PTU</th>}
              {showPayGo && <th>PayGo</th>}
              {showPTU && <th>PTU</th>}
              {showPayGo && <th>PayGo</th>}
              {showPTU && <th>PTU</th>}
              {showPayGo && <th>PayGo</th>}
              {showPTU && <th>PTU</th>}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: numYears }, (_, i) => {
              const payGoYear = payGoData.yearlyBreakdown?.[i] || {};
              const ptuYear = ptuData.yearlyBreakdown?.[i] || {};

              // Calculate per-action costs
              const payGoActionCost = payGoYear.totalActionsPerMonth > 0
                ? payGoYear.monthlyCost / payGoYear.totalActionsPerMonth
                : 0;
              const ptuActionCost = ptuYear.totalActionsPerMonth > 0
                ? ptuYear.monthlyCost / ptuYear.totalActionsPerMonth
                : 0;

              // Calculate per-user costs
              const payGoPerUser = payGoYear.activeUsers > 0
                ? payGoYear.monthlyCost / payGoYear.activeUsers
                : 0;
              const ptuPerUser = ptuYear.activeUsers > 0
                ? ptuYear.monthlyCost / ptuYear.activeUsers
                : 0;

              return (
                <tr key={i}>
                  <td>{payGoYear.year || ptuYear.year || i + 1}</td>
                  <td>{formatNumber(payGoYear.activeUsers || ptuYear.activeUsers || 0)}</td>

                  {showPayGo && <td className={getColorClass()}>{formatValue(payGoActionCost)}</td>}
                  {showPTU && <td className={getColorClass()}>{formatValue(ptuActionCost)}</td>}

                  {showPayGo && <td className={getColorClass()}>{formatValue(payGoPerUser)}</td>}
                  {showPTU && <td className={getColorClass()}>{formatValue(ptuPerUser)}</td>}

                  {showPayGo && <td className={getColorClass()}>{formatValue(payGoYear.perCustomerMonthly || 0)}</td>}
                  {showPTU && <td className={getColorClass()}>{formatValue(ptuYear.perCustomerMonthly || 0)}</td>}

                  {showPayGo && <td className={getColorClass()}>{formatValue(payGoYear.perCustomerYearly || 0)}</td>}
                  {showPTU && <td className={getColorClass()}>{formatValue(ptuYear.perCustomerYearly || 0)}</td>}

                  {showPayGo && <td className={getColorClass()}>{formatValue(payGoYear.monthlyCost || 0)}</td>}
                  {showPTU && <td className={getColorClass()}>{formatValue(ptuYear.monthlyCost || 0)}</td>}

                  {showPayGo && <td className={getColorClass()}>{formatValue(payGoYear.yearlyCost || 0)}</td>}
                  {showPTU && <td className={getColorClass()}>{formatValue(ptuYear.yearlyCost || 0)}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CombinedProjectionTable;
