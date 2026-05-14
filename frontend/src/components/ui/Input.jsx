export function Input({
  label,
  error,
  disabled = false,
  required = false,
  className = '',
  id,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full border border-border rounded px-3 py-2 text-foreground bg-background
          focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
