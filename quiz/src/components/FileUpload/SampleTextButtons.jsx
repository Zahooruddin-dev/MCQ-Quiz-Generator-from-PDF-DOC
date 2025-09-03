import React from 'react';

const SampleTextButtons = ({
  onSampleClick,
  onToggleTextMode,
  showTextMode,
  effectiveLoading,
}) => {
  return (
    <div style={{ marginTop: 12, textAlign: 'center' }}>
      <button className="btn" onClick={onSampleClick} disabled={effectiveLoading}>
        Try Sample Text
      </button>

      <button
        className="btn btn-secondary"
        onClick={onToggleTextMode}
        disabled={effectiveLoading}
        style={{ marginLeft: 8 }}
      >
        {showTextMode ? 'Close Text Input' : 'Paste Your Own Text'}
      </button>
    </div>
  );
};

export default SampleTextButtons;
