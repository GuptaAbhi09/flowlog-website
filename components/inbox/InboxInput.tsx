import { useState, useRef } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface InboxInputProps {
  onSubmit: (content: string) => Promise<void>;
  disabled?: boolean;
}

export function InboxInput({ onSubmit, disabled }: InboxInputProps) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    const content = value.trim();
    if (!content || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(content);
      setValue("");
      inputRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Quick capture anything that crosses your mind…"
        disabled={disabled || submitting}
      />
      <Button
        size="icon"
        onClick={handleSubmit}
        disabled={!value.trim() || disabled || submitting}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}

