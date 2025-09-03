const TextModeInput = ({ pastedText, setPastedText, onSubmit, onCancel, effectiveLoading }) => {
  return (
    <div className="text-input-container">
      <h3>Paste source text</h3>
      <textarea
        value={pastedText}
        onChange={(e) => setPastedText(e.target.value)}
        placeholder="Paste text here..."
        disabled={effectiveLoading}
      />
      <div className="button-group">
        <button className="btn" onClick={() => onSubmit(pastedText)} disabled={effectiveLoading}>
          Generate Questions
        </button>
        <button className="btn btn-secondary" onClick={onCancel} disabled={effectiveLoading}>
          Cancel
        </button>
      </div>
    </div>
  );
};
export default TextModeInput;
