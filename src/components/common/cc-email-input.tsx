import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CcEmailInputProps {
  value: string[];
  onChange: (emails: string[]) => void;
  toEmail?: string;
  disabled?: boolean;
  max?: number;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CcEmailInput({
  value = [],
  onChange,
  toEmail = "",
  disabled = false,
  max = 10,
}: CcEmailInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const addEmails = (rawInput: string) => {
    setInputError(null);
    const tokens = rawInput
      .split(/[,;\s]+/)
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (tokens.length === 0) return;

    const normalizedTo = toEmail.trim().toLowerCase();
    const currentEmails = new Set(value.map((e) => e.toLowerCase()));
    const validNewEmails: string[] = [];

    for (const token of tokens) {
      if (!EMAIL_REGEX.test(token)) {
        setInputError(`"${token}" is not a valid email address.`);
        return;
      }
      if (token === normalizedTo) {
        // Drop silently or ignore CC equal to To
        continue;
      }
      if (currentEmails.has(token)) {
        continue;
      }
      if (value.length + validNewEmails.length >= max) {
        setInputError(`Maximum of ${max} CC recipients allowed.`);
        break;
      }
      currentEmails.add(token);
      validNewEmails.push(token);
    }

    if (validNewEmails.length > 0) {
      onChange([...value, ...validNewEmails]);
    }
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === ";") {
      e.preventDefault();
      if (inputValue.trim()) {
        addEmails(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove));
    setInputError(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Add CC recipient (press Enter or comma)"
          value={inputValue}
          disabled={disabled || value.length >= max}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (inputError) setInputError(null);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim()) {
              addEmails(inputValue);
            }
          }}
          className="text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || !inputValue.trim() || value.length >= max}
          onClick={() => addEmails(inputValue)}
          className="shrink-0 text-xs px-3"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add
        </Button>
      </div>

      {inputError && (
        <p className="text-xs text-destructive">{inputError}</p>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {value.map((email, index) => (
            <Badge
              key={`${email}-${index}`}
              variant="secondary"
              className="pl-2.5 pr-1 py-1 text-xs flex items-center gap-1 font-normal bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200"
            >
              <span>{email}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="rounded-full p-0.5 hover:bg-slate-300 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  aria-label={`Remove ${email}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          ))}
          <span className="text-[11px] text-slate-400 self-center ml-1">
            ({value.length}/{max})
          </span>
        </div>
      )}
    </div>
  );
}
