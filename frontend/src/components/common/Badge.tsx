import { cn } from '@/lib/utils';

interface BadgeProps {
  variant: 'NEW' | 'SALE' | 'SOLD OUT' | 'RESTOCKED' | 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | string;
  className?: string;
}

const variantStyles: Record<string, string> = {
  NEW: 'bg-primary text-primary-foreground',
  SALE: 'bg-highlight text-highlight-foreground',
  'SOLD OUT': 'bg-muted text-muted-foreground',
  RESTOCKED: 'bg-primary text-primary-foreground',
  PENDING: 'border border-border text-foreground bg-transparent',
  Pending: 'border border-border text-foreground bg-transparent',
  CONFIRMED: 'bg-primary text-primary-foreground',
  Processing: 'bg-primary text-primary-foreground',
  SHIPPED: 'bg-highlight text-highlight-foreground',
  Shipped: 'bg-highlight text-highlight-foreground',
  DELIVERED: 'bg-muted text-foreground',
  Delivered: 'bg-muted text-foreground',
  CANCELLED: 'border border-destructive text-destructive',
  Cancelled: 'border border-destructive text-destructive',
};

export default function Badge({ variant, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'text-[9px] uppercase tracking-widest px-2 py-0.5 inline-block',
        variantStyles[variant] || 'bg-muted text-muted-foreground',
        className
      )}
    >
      {variant}
    </span>
  );
}
