import RequestRow from './RequestRow.jsx';
import InfoTooltip from './InfoTooltip.jsx';

function ActionBuilder({ action, onChange, customerMetrics, onCustomerMetricsChange }) {
  const handleNameChange = (name) => {
    onChange({ ...action, name });
  };

  const handleRerankerToggle = () => {
    onChange({ ...action, useReranker: !action.useReranker });
  };

  const handleActionsPerUserChange = (value) => {
    const numValue = value === '' ? '' : parseFloat(value) || 0;
    onCustomerMetricsChange({
      ...customerMetrics,
      avgActionsPerUser: numValue
    });
  };

  const handleActionsPerUserBlur = (value) => {
    if (value === '') {
      onCustomerMetricsChange({
        ...customerMetrics,
        avgActionsPerUser: 0
      });
    }
  };

  const handleAddRequest = () => {
    const newRequest = {
      id: crypto.randomUUID(),
      model: 'GPT-4.1 2025-02-01 Global mini',
      numRequests: 1,
      avgInputTokens: 1000,
      avgOutputTokens: 500
    };
    onChange({
      ...action,
      requests: [...action.requests, newRequest]
    });
  };

  const handleRequestChange = (index, updatedRequest) => {
    const newRequests = [...action.requests];
    newRequests[index] = updatedRequest;
    onChange({ ...action, requests: newRequests });
  };

  const handleDeleteRequest = (index) => {
    if (action.requests.length === 1) {
      alert('Cannot delete the last request');
      return;
    }
    const newRequests = action.requests.filter((_, i) => i !== index);
    onChange({ ...action, requests: newRequests });
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">AI Action Configuration</h3>
      </div>

      <div className="action-header">
        <div className="action-name-input" style={{ flex: 1 }}>
          <label>
            Action Name
            <InfoTooltip text="Descriptive name for this AI action (e.g., 'Chat Completion', 'Document Summary'). Helps identify different features in your saved estimations." />
          </label>
          <input
            type="text"
            value={action.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g., Chat Completion, Document Summary"
          />
        </div>

        <div className="metric-field" style={{ minWidth: '200px' }}>
          <label>
            Avg Actions per User/Day
            <InfoTooltip text="Expected number of AI actions each active user performs daily. Converted to monthly (×30 days) for cost calculations." />
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={customerMetrics?.avgActionsPerUser ?? ''}
            onChange={(e) => handleActionsPerUserChange(e.target.value)}
            onBlur={(e) => handleActionsPerUserBlur(e.target.value)}
          />
        </div>

        <div className="reranker-toggle">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={action.useReranker}
              onChange={handleRerankerToggle}
            />
            <span className="toggle-slider"></span>
          </label>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
            Use Reranker ($0.001)
            <InfoTooltip text="Enables semantic reranking to improve search result relevance. Adds $0.001 cost per action. Used for RAG and search features." />
          </span>
        </div>
      </div>

      <div>
        <label style={{ marginBottom: 'var(--spacing-sm)', display: 'block' }}>
          API Requests ({action.requests.length})
          <InfoTooltip text="Define the API calls that make up this action. Each request specifies a model, number of calls, and token counts. Costs are calculated per request and summed." />
        </label>

        <div className="requests-table">
          <div className="requests-table-header">
            <div className="requests-header-model">Model</div>
            <div className="requests-header-num"># of Requests</div>
            <div className="requests-header-input">Input Tokens per Request</div>
            <div className="requests-header-output">Output Tokens per Request</div>
            <div className="requests-header-actions"></div>
          </div>

          <div className="requests-list-inline">
            {action.requests.map((request, index) => (
              <RequestRow
                key={request.id}
                request={request}
                onChange={(updatedRequest) => handleRequestChange(index, updatedRequest)}
                onDelete={() => handleDeleteRequest(index)}
                onAdd={handleAddRequest}
                showAdd={index === action.requests.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActionBuilder;
