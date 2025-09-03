// components/SampleTextButton.jsx
const SAMPLE_TEXT = `Sample MCQ source text:
1) The capital of France is Paris.
2) Water boils at 100 degrees Celsius at sea level.`;

const SampleTextButton = ({ onSubmit, useAI, disabled, setError }) => {
  const handleClick = () => {
    if (!useAI) {
      setError?.('Enable "Use AI Generation" to generate from text samples.');
      return;
    }
    onSubmit(SAMPLE_TEXT);
  };

  return (
    <button
      className="btn"
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title="Try a quick sample (no file required)"
    >
      Try sample text
    </button>
  );
};

export default SampleTextButton;
