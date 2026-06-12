import { Check } from "lucide-react";

interface Props {
  steps: string[];
  current: number; // 1-based
}

export function Stepper({ steps, current }: Props) {
  const pct = ((current - 1) / Math.max(steps.length - 1, 1)) * 100;
  return (
    <div className="mb-8">
      {/* Mobile: progress + current label + prev/next */}
      <div className="sm:hidden">
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Etapa {current} de {steps.length}
            </div>
            <div className="text-base font-semibold leading-tight">{steps[current - 1]}</div>
          </div>
          <div className="text-xs text-muted-foreground tabular-nums">
            {Math.round((current / steps.length) * 100)}%
          </div>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-foreground transition-all"
            style={{ width: `${(current / steps.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[11px] text-muted-foreground">
          <span className="truncate max-w-[45%]">
            {current > 1 ? `← ${steps[current - 2]}` : "—"}
          </span>
          <span className="truncate max-w-[45%] text-right">
            {current < steps.length ? `${steps[current]} →` : "—"}
          </span>
        </div>
      </div>

      {/* Desktop: full stepper */}
      <div className="hidden sm:block">
        <div className="relative">
          <div className="absolute left-0 right-0 top-3.5 h-px bg-border" />
          <div
            className="absolute left-0 top-3.5 h-px bg-foreground transition-all"
            style={{ width: `${pct}%` }}
          />
          <div className="relative flex justify-between">
            {steps.map((label, i) => {
              const n = i + 1;
              const active = n === current;
              const done = n < current;
              return (
                <div key={n} className="flex flex-col items-center gap-1.5 min-w-0">
                  <div
                    className={`h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center border-2 ${
                      done
                        ? "bg-foreground text-background border-foreground"
                        : active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border"
                    }`}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : n}
                  </div>
                  <span
                    className={`text-[11px] text-center max-w-[90px] leading-tight ${
                      active ? "font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
