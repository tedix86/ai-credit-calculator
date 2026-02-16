import InfoTooltip from './InfoTooltip.jsx';

function CustomerMetrics({ metrics, onChange }) {
  const handleChange = (field, value) => {
    // Allow empty string while typing, otherwise parse the number
    const numValue = value === '' ? '' : parseFloat(value) || 0;
    onChange({
      ...metrics,
      [field]: numValue
    });
  };

  const handleBlur = (field, value) => {
    // Convert empty string to 0 when leaving the field
    if (value === '') {
      onChange({
        ...metrics,
        [field]: 0
      });
    }
  };

  // Handle new customers per year
  const handleNewCustomersChange = (yearIndex, value) => {
    const newCustomers = [...metrics.newCustomersPerYear];
    newCustomers[yearIndex] = value === '' ? '' : parseFloat(value) || 0;
    onChange({
      ...metrics,
      newCustomersPerYear: newCustomers
    });
  };

  const handleNewCustomersBlur = (yearIndex, value) => {
    if (value === '') {
      const newCustomers = [...metrics.newCustomersPerYear];
      newCustomers[yearIndex] = 0;
      onChange({
        ...metrics,
        newCustomersPerYear: newCustomers
      });
    }
  };

  // Handle adoption rates
  const handleAdoptionRateChange = (yearIndex, value) => {
    const newRates = [...metrics.adoptionRateByYear];
    newRates[yearIndex] = value === '' ? '' : parseFloat(value) || 0;
    onChange({
      ...metrics,
      adoptionRateByYear: newRates
    });
  };

  const handleAdoptionRateBlur = (yearIndex, value) => {
    if (value === '') {
      const newRates = [...metrics.adoptionRateByYear];
      newRates[yearIndex] = 0;
      onChange({
        ...metrics,
        adoptionRateByYear: newRates
      });
    }
  };

  const handleAddYear = () => {
    const maxLength = Math.max(metrics.newCustomersPerYear.length, metrics.adoptionRateByYear.length);
    if (maxLength < 5) {
      const lastCustomerCount = metrics.newCustomersPerYear[metrics.newCustomersPerYear.length - 1] || 1;
      const lastAdoptionRate = metrics.adoptionRateByYear[metrics.adoptionRateByYear.length - 1] || 10;

      onChange({
        ...metrics,
        newCustomersPerYear: [...metrics.newCustomersPerYear, lastCustomerCount],
        adoptionRateByYear: [...metrics.adoptionRateByYear, Math.min(lastAdoptionRate + 20, 100)]
      });
    }
  };

  const handleRemoveYear = (yearIndex) => {
    const maxLength = Math.max(metrics.newCustomersPerYear.length, metrics.adoptionRateByYear.length);
    if (maxLength > 1) {
      const newCustomers = metrics.newCustomersPerYear.filter((_, i) => i !== yearIndex);
      const newRates = metrics.adoptionRateByYear.filter((_, i) => i !== yearIndex);
      onChange({
        ...metrics,
        newCustomersPerYear: newCustomers,
        adoptionRateByYear: newRates
      });
    }
  };

  // Calculate projected active users for each year using cohort-based model
  const calculateActiveUsersByYear = () => {
    const numYears = Math.max(metrics.newCustomersPerYear.length, metrics.adoptionRateByYear.length);
    const yearlyData = [];

    for (let year = 0; year < numYears; year++) {
      let activeUsers = 0;
      let totalCustomers = 0;

      // Calculate cumulative customers up to this year
      for (let i = 0; i <= year; i++) {
        totalCustomers += metrics.newCustomersPerYear[i] || 0;
      }

      // Calculate active users from all cohorts up to this year
      for (let cohortYear = 0; cohortYear <= year; cohortYear++) {
        const numCustomersInCohort = metrics.newCustomersPerYear[cohortYear] || 0;
        const tenureYearIndex = year - cohortYear; // How long this cohort has been a customer

        // Get adoption rate for this tenure
        const adoptionRate = metrics.adoptionRateByYear[tenureYearIndex] ||
                            metrics.adoptionRateByYear[metrics.adoptionRateByYear.length - 1] || 0;

        const activeUsersFromCohort = numCustomersInCohort * metrics.avgUsersPerCustomer * (adoptionRate / 100);
        activeUsers += activeUsersFromCohort;
      }

      const totalAvailableUsers = totalCustomers * metrics.avgUsersPerCustomer;

      yearlyData.push({
        year: year + 1,
        newCustomers: metrics.newCustomersPerYear[year] || 0,
        totalCustomers,
        adoptionRate: metrics.adoptionRateByYear[year] || 0,
        activeUsers: Math.round(activeUsers),
        totalAvailableUsers
      });
    }

    return yearlyData;
  };

  const yearlyData = calculateActiveUsersByYear();

  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">Customer Metrics</h3>
      </div>

      <div className="metrics-grid">
        <div className="metric-field">
          <label>
            Avg Users per Customer
            <InfoTooltip text="Average number of users per customer organization. Applied to each customer cohort to calculate available users." />
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={metrics.avgUsersPerCustomer}
            onChange={(e) => handleChange('avgUsersPerCustomer', e.target.value)}
            onBlur={(e) => handleBlur('avgUsersPerCustomer', e.target.value)}
          />
        </div>
      </div>

      <div className="adoption-rates">
        <label style={{ marginBottom: 'var(--spacing-sm)', display: 'block' }}>
          Customer Acquisition & Adoption Projections - {yearlyData.length} year{yearlyData.length !== 1 ? 's' : ''}
          <InfoTooltip text="Track customer growth and user adoption over time. Each cohort of new customers matures through the adoption curve based on tenure. Active users are calculated by applying each cohort's tenure-based adoption rate." />
        </label>

        <div className="customer-cohort-table">
          <div className="cohort-table-header">
            <div className="cohort-header-year">Year</div>
            <div className="cohort-header-new">New Customers</div>
            <div className="cohort-header-total">Total Customers</div>
            <div className="cohort-header-rate">Adoption %</div>
            <div className="cohort-header-users">Projected Active Users</div>
            <div className="cohort-header-actions"></div>
          </div>

          <div className="cohort-table-list">
            {yearlyData.map((data, index) => (
              <div key={index} className="cohort-table-row">
                <div className="cohort-year-label">Year {data.year}</div>

                <input
                  type="number"
                  className="cohort-input"
                  min="0"
                  step="1"
                  value={metrics.newCustomersPerYear[index] ?? 0}
                  onChange={(e) => handleNewCustomersChange(index, e.target.value)}
                  onBlur={(e) => handleNewCustomersBlur(index, e.target.value)}
                />

                <div className="cohort-total-customers">{data.totalCustomers}</div>

                <input
                  type="number"
                  className="cohort-input cohort-input-rate"
                  min="0"
                  max="100"
                  step="1"
                  value={metrics.adoptionRateByYear[index] ?? 0}
                  onChange={(e) => handleAdoptionRateChange(index, e.target.value)}
                  onBlur={(e) => handleAdoptionRateBlur(index, e.target.value)}
                />

                <div className="cohort-active-users">
                  <span className="cohort-users-count">{data.activeUsers.toLocaleString()}</span>
                  <span className="cohort-users-total"> of {data.totalAvailableUsers.toLocaleString()}</span>
                </div>

                <div className="cohort-actions">
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => handleRemoveYear(index)}
                    disabled={yearlyData.length === 1}
                    title="Remove year"
                  >
                    −
                  </button>
                  {index === yearlyData.length - 1 && (
                    <button
                      className="btn-icon btn-primary"
                      onClick={handleAddYear}
                      disabled={yearlyData.length >= 5}
                      title="Add year (max 5)"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerMetrics;
