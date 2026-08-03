import type { FC, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'neon';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  isLoading = false,
  ...props 
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center font-header font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants: Record<string, string> = {
    primary: 'bg-white text-black hover:bg-gray-200',
    secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/10',
    outline: 'bg-transparent border-2 border-white/20 text-white hover:border-white/40',
    neon: 'bg-neon-blue text-black shadow-neon-blue hover:brightness-110'
  };

  const sizes: Record<string, string> = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
