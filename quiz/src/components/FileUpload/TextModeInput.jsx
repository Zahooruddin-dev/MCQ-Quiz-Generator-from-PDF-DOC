import React from 'react';

const TextModeInput = ({ pastedText, setPastedText, onSubmit, onCancel, effectiveLoading }) => {
  return (
    <div className="text-input-container" style={{ marginTop: 12, width: '100%' }}>
      <h3 style={{ marginBottom: 8 }}>Paste source text</h3>
      <textarea
        value={pastedText}
        onChange={(e) => setPastedText(e.target.value)}
        placeholder="Paste text here..."
        disabled={effectiveLoading}
        style={{
          width: '100%',
          minHeight: 150,
          padding: 8,
          fontSize: 14,
          borderRadius: 6,
          border: '1px solid #ccc',
          resize: 'vertical',
        }}
      />
      <div
        className="button-group"
        style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-start' }}
      >
        <button
          className="btn"
          onClick={() => onSubmit(pastedText)}
          disabled={effectiveLoading}
        >
          Generate Questions
        </button>
        <button
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={effectiveLoading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TextModeInput;
