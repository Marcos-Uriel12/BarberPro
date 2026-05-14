export function Card({
  children,
  title,
  className = '',
  onClick,
  selected = false,
}) {
  const clickable = typeof onClick === 'function';

  return (
    <div
      className={`
        border border-border rounded-lg p-4 bg-background
        ${clickable ? 'cursor-pointer hover:border-foreground transition-colors' : ''}
        ${selected ? 'border-foreground ring-1 ring-foreground' : ''}
        ${className}
      `}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e); } : undefined}
    >
      {title && (
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      )}
      {children}
    </div>
  );
}
