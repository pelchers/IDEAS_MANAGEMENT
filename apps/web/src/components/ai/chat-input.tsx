"use client";

import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.inputContainer}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "AI Chat requires a Pro or Team subscription" : "Type a message... (Enter to send, Shift+Enter for new line)"}
          disabled={isLoading || disabled}
          rows={1}
          style={{
            ...styles.textarea,
            opacity: disabled ? 0.5 : 1,
          }}
        />
        <button
          type="submit"
          disabled={!value.trim() || isLoading || disabled}
          style={{
            ...styles.button,
            opacity: !value.trim() || isLoading || disabled ? 0.5 : 1,
          }}
        >
          {isLoading ? "..." : "Send"}
        </button>
      </div>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    padding: "12px 16px",
    borderTop: "1px solid #e0e0e0",
    backgroundColor: "#fff",
  },
  inputContainer: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid #d0d0d0",
    borderRadius: "8px",
    fontSize: "14px",
    lineHeight: "1.5",
    resize: "none" as const,
    outline: "none",
    fontFamily: "inherit",
    minHeight: "42px",
    maxHeight: "120px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#5b4dc7",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },
};
