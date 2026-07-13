import {
  Utensils,
  Car,
  Home as HomeIcon,
  BookOpen,
  HeartPulse,
  Tv2,
  ShoppingBag,
  Coffee,
  Banknote,
  Briefcase,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, { Icon: LucideIcon; color: string; bg: string }> = {
  "Makan & Minum": { Icon: Utensils, color: "#FF8929", bg: "#FFF3E8" },
  "Transportasi": { Icon: Car, color: "#298DFF", bg: "#EEF6FF" },
  "Kos & Sewa Tempat Tinggal": { Icon: HomeIcon, color: "#072548", bg: "#F0F4FA" },
  "Kebutuhan Kuliah": { Icon: BookOpen, color: "#22C55E", bg: "#F0FDF4" },
  "Kesehatan": { Icon: HeartPulse, color: "#EF4444", bg: "#FEF2F2" },
  "Hiburan": { Icon: Tv2, color: "#A855F7", bg: "#F5F3FF" },
  "Belanja & Fashion": { Icon: ShoppingBag, color: "#EC4899", bg: "#FDF2F8" },
  "Nongkrong & Kafe": { Icon: Coffee, color: "#F59E0B", bg: "#FFFBEB" },
  "Uang Saku Bulanan": { Icon: Banknote, color: "#16A34A", bg: "#F0FDF4" },
  "Freelance & Part-Time": { Icon: Briefcase, color: "#0891B2", bg: "#ECFEFF" },
};

const DEFAULT = { Icon: CreditCard, color: "#717182", bg: "#F4F4F6" };

export default function CategoryIcon({
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon size={size} color={color} strokeWidth={1.8} />
    </div>
  );
}
