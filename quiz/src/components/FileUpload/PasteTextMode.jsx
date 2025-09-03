// components/PasteTextMode.jsx
import { useState } from 'react';

const PasteTextMode = ({ onSubmit, disabled, onCancel }) => {
  const [pastedText, setPastedText] = useState('');

  const handleGenerate = () => {
    onSubmit(pastedText);
    setPastedText('');
  };

  return (
    <div className="dropzone text-mode">
      <h3>Paste your text</h3>
      <textarea
        value={pastedText}
        onChange={(e) => setPastedText(e.target.value)}
        placeholder="Paste or type text here..."
        disabled={disabled}
      />
      <div className="button-group" style={{ marginTop: 12 }}>
        <button
          className="btn"
          onClick={handleGenerate}
          disabled={disabled || !pastedText.trim()}
        >
          Generate
        </button>
        <button className="btn btn-secondary" onClick={onCancel} disabled={disabled}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PasteTextMode;
