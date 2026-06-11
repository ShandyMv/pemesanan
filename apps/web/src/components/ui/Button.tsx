import React from 'react';
import { cn } from '../../lib/utils';

const variants = {
  primary: 'bg-primary-600 text-white shadow-soft hover:bg-primary-700 hover:shadow-md',
  secondary: 'bg-primary-50 text-primary-800 hover:bg-primary-100',
  muted: 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900',
  outline: 'border border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50',
  danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700',
  dangerGhost: 'text-rose-600 hover:bg-rose-50 hover:text-rose-700',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  surface: 'border border-slate-200 bg-white text-slate-950 shadow-sm hover:border-primary-200 hover:bg-primary-50',
};

const sizes = {
  none: '',
  sm: 'h-8 rounded-lg px-3 text-xs',
  md: 'h-10 px-5 py-2',
  lg: 'h-12 rounded-xl px-8 text-base',
  icon: 'h-10 w-10 p-0',
  iconSm: 'h-8 w-8 rounded-lg p-0',
};

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: React.ElementType;
  fullWidth?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
  to?: string;
}

export const Button = React.forwardRef<HTMLElement, ButtonProps>(({
  as: Component = 'button',
  className,
  fullWidth = false,
  size = 'md',
  type,
  variant = 'primary',
  ...props
}, ref) => {
  const isNativeButton = Component === 'button';
  const Element = Component as React.ElementType;

  return (
    <Element
      ref={ref}
      type={isNativeButton ? type ?? 'button' : type}
      className={cn(
        'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    />
  );
});
Button.displayName = 'Button';
