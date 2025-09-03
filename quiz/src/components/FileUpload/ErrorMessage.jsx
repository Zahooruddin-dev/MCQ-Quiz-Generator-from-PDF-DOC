const ErrorMessage = ({ error, onDismiss }) => {
  if (!error) return null;
  return (
    <div className="error-message" role="alert" aria-live="assertive">
      <span>{error}</span>
      <button onClick={onDismiss} aria-label="Dismiss error">✕</button>
    </div>
  );
};
export default ErrorMessage;
