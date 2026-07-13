import { Loader2 } from "lucide-react";

export default function LoadingState({ label = "Memuat..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
      <Loader2 className="h-6 w-6 animate-spin text-[#298DFF]" strokeWidth={2.5} />
      <p className="text-sm font-medium text-[#717182]">{label}</p>
    </div>
  );
}
