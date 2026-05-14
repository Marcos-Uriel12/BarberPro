const variants = {
  text: 'h-4 w-full rounded',
  card: 'h-24 w-full rounded-lg',
  circle: 'h-12 w-12 rounded-full',
};

export function Skeleton({ variant = 'text', className = '' }) {
  return (
    <div
      className={`
        animate-pulse bg-gray-200
        ${variants[variant] || variants.text}
        ${className}
      `}
      aria-hidden="true"
    />
  );
}
