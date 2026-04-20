import { cn } from "@/lib/utils";
import { Severity, severityLabel } from "@/data/mock";

interface SeverityBadgeProps {
  severity: Severity;
  label?: string;
  className?: string;
}

const styles: Record<Severity, string> = {
  none: "bg-severity-none/15 text-severity-none border-severity-none/30",
  low: "bg-severity-low/20 text-[hsl(38,80%,30%)] border-severity-low/40",
  mid: "bg-severity-mid/20 text-severity-mid border-severity-mid/40",
  high: "bg-severity-high/15 text-severity-high border-severity-high/40",
};

export function SeverityBadge({ severity, label, className }: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[severity],
        className,
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          backgroundColor:
            severity === "none" ? "hsl(var(--severity-none))" :
            severity === "low" ? "hsl(var(--severity-low))" :
            severity === "mid" ? "hsl(var(--severity-mid))" :
            "hsl(var(--severity-high))",
        }}
      />
      {label ?? severityLabel[severity]}
    </span>
  );
}
