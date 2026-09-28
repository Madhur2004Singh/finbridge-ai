export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="alert error-alert">
      <span>⚠️</span>
      <span>{message}</span>
    </div>
  );
}
