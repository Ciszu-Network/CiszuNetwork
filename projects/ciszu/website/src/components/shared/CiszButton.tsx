import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-header font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-brand-light to-brand-accent text-black shadow-[0_0_20px_rgba(58,107,240,0.35)] hover:brightness-110 hover:scale-[1.01]',
        secondary: 'bg-white/5 border-2 border-white/20 text-white hover:bg-white/10 hover:scale-105',
        outline: 'bg-transparent border-2 border-brand/50 text-brand-light hover:bg-brand/20',
        ghost: 'bg-transparent text-white hover:bg-white/5',
        danger: 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20',
      },
      size: {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

export function CiszButton({ variant, size, className, children, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {children}
    </button>
  );
}
