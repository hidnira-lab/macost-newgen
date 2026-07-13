import { Banknote, Smartphone, Building2, Landmark, CreditCard, GraduationCap, type LucideIcon } from "lucide-react";
import type { WalletIcon } from "@/types";

const ICON_MAP: Record<WalletIcon, LucideIcon> = {
  Banknote,
  Smartphone,
  Building2,
  Landmark,
  CreditCard,
  GraduationCap,
};

export default function WalletIconDisplay({
  icon,
  color,
  size = 20,
}: {
  icon: WalletIcon;
  color: string;
  size?: number;
}) {
  const Icon = ICON_MAP[icon];
  return <Icon size={size} color={color} strokeWidth={1.8} />;
}
