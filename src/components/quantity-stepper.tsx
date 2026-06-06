import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuantityStepper({
  value, onChange, min = 1, max = 99, size = "default",
}: { value: number; onChange: (n: number) => void; min?: number; max?: number; size?: "default" | "sm" }) {
  const h = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  return (
    <div className="inline-flex items-center rounded-full border bg-card overflow-hidden">
      <Button type="button" size="icon" variant="ghost" className={h} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums">{value}</span>
      <Button type="button" size="icon" variant="ghost" className={h} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
