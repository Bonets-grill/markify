import { type HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive' | 'success';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-border text-foreground bg-transparent',
  destructive: 'bg-destructive text-destructive-foreground',
  success: 'bg-success text-white',
};

function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

export { Badge, type BadgeProps, type BadgeVariant };
