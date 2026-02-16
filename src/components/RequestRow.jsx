import { AVAILABLE_MODELS } from '../constants/defaults.js';

function RequestRow({ request, onChange, onDelete, onAdd, showAdd = false }) {
  const handleChange = (field, value) => {
    if (field === 'model') {
      onChange({
        ...request,
        [field]: value
      });
    } else {
      const numValue = value === '' ? '' : parseInt(value) || 0;
      onChange({
        ...request,
        [field]: numValue
      });
    }
  };

  const handleBlur = (field, value) => {
    if (value === '') {
      // numRequests defaults to 1, others default to 0
      const defaultValue = field === 'numRequests' ? 1 : 0;
      onChange({
        ...request,
        [field]: defaultValue
      });
    }
  };

  return (
    <div className="request-row-inline">
      <select
        className="request-model-select"
        value={request.model}
        onChange={(e) => handleChange('model', e.target.value)}
      >
        {AVAILABLE_MODELS.map(model => (
          <option key={model} value={model}>{model}</option>
        ))}
      </select>

      <input
        type="number"
        className="request-input request-input-small"
        min="1"
        step="1"
        value={request.numRequests ?? 1}
        onChange={(e) => handleChange('numRequests', e.target.value)}
        onBlur={(e) => handleBlur('numRequests', e.target.value)}
        placeholder="# requests"
      />

      <input
        type="number"
        className="request-input"
        min="0"
        step="100"
        value={request.avgInputTokens ?? 0}
        onChange={(e) => handleChange('avgInputTokens', e.target.value)}
        onBlur={(e) => handleBlur('avgInputTokens', e.target.value)}
        placeholder="Input tokens"
      />

      <input
        type="number"
        className="request-input"
        min="0"
        step="100"
        value={request.avgOutputTokens ?? 0}
        onChange={(e) => handleChange('avgOutputTokens', e.target.value)}
        onBlur={(e) => handleBlur('avgOutputTokens', e.target.value)}
        placeholder="Output tokens"
      />

      <div className="request-actions-inline">
        <button
          className="btn-icon btn-danger"
          onClick={onDelete}
          title="Remove request"
        >
          −
        </button>
        {showAdd && (
          <button
            className="btn-icon btn-primary"
            onClick={onAdd}
            title="Add request"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}

export default RequestRow;
