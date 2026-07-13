import {
  Utensils, Car, Tv2, ShoppingBag, Receipt, BookOpen, Home,
  Banknote, Briefcase, Store, HeartPulse, Package, CreditCard,
} from 'lucide-react';

const MAP: Record<string, { Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>; color: string; bg: string }> = {
  'Food & Drink':    { Icon: Utensils,    color: '#FF8929', bg: '#FFF3E8' },
  'Transportation':  { Icon: Car,         color: '#298DFF', bg: '#EEF6FF' },
  'Entertainment':   { Icon: Tv2,         color: '#A855F7', bg: '#F5F3FF' },
  'Shopping':        { Icon: ShoppingBag, color: '#EC4899', bg: '#FDF2F8' },
  'Bills':           { Icon: Receipt,     color: '#F59E0B', bg: '#FFFBEB' },
  'Education':       { Icon: BookOpen,    color: '#22C55E', bg: '#F0FDF4' },
  'Housing':         { Icon: Home,        color: '#072548', bg: '#F0F4FA' },
  'Allowance':       { Icon: Banknote,    color: '#16A34A', bg: '#F0FDF4' },
  'Freelance Income':{ Icon: Briefcase,   color: '#0891B2', bg: '#ECFEFF' },
  'Part-time Job':   { Icon: Store,       color: '#7C3AED', bg: '#F5F3FF' },
  'Health':          { Icon: HeartPulse,  color: '#EF4444', bg: '#FEF2F2' },
  'Other':           { Icon: Package,     color: '#717182', bg: '#F4F4F6' },
};

const DEFAULT = { Icon: CreditCard, color: '#717182', bg: '#F4F4F6' };

export function CategoryIcon({
  category,
  size = 18,
  containerSize = 40,
  borderRadius = 12,
}: {
  category: string;
  size?: number;
  containerSize?: number;
  borderRadius?: number;
}) {
  const { Icon, color, bg } = MAP[category] ?? DEFAULT;
  return (
    <div
      style={{
        width: containerSize,
        height: containerSize,
        borderRadius,
        backgroundColor: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={size} color={color} strokeWidth={1.8} />
    </div>
  );
}

export function categoryColor(category: string): string {
  return (MAP[category] ?? DEFAULT).color;
}
