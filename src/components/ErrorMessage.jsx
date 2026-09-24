export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="message error-box">
      <strong>{message}</strong>
      {onRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  );
}
