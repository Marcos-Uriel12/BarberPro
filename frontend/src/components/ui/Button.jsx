import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-foreground text-background hover:opacity-90 disabled:opacity-50',
  secondary: 'bg-gray-200 text-foreground hover:bg-gray-300 disabled:opacity-50',
  outline: 'border border-foreground text-foreground hover:bg-foreground hover:text-background disabled:opacity-50',
  ghost: 'text-foreground hover:bg-gray-100 disabled:opacity-50',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg
        transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${disabled || loading ? 'cursor-not-allowed opacity-50' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
