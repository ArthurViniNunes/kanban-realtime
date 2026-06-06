import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'danger' | 'secondary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = 'primary', style, ...props }: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    padding: '0.6rem 1rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 500,
  };

  const variants: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: '#2563eb',
      color: 'white',
    },
    secondary: {
      backgroundColor: '#e5e7eb',
      color: '#111',
    },
    danger: {
      backgroundColor: '#dc2626',
      color: 'white',
    },
  };

  return (
    <button
      {...props}
      style={{
        ...baseStyle,
        ...variants[variant],
        ...style,
      }}
    />
  );
}
