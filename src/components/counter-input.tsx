import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CounterProps = {
  id?: string;
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  className?: string;
};

export default function Counter({
  id,
  label,
  value,
  onChange,
  min = 0,
  className,
}: CounterProps) {
  const handleInput = (v: number) =>
    onChange(Math.max(min, Math.floor(v) || 0));

  return (
    <div className={className}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <div className="relative">
        <Input
          id={id}
          type="number"
          value={value}
          onChange={(e) => handleInput(Number(e.target.value))}
          className="text-center"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute left-2 top-1/2 -translate-y-1/2"
          onClick={() => handleInput(value - 1)}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={() => handleInput(value + 1)}
        >
          <Plus className="h-3.5 w-3.5 text-blue-600" />
        </Button>
      </div>
    </div>
  );
}
