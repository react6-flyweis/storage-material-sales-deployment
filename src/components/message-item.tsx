import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Copy, Check, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export default function MessageItem({ message }: { message: Message }) {
  const isAi = message.sender === "ai";
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | null = null;
    if (copied) {
      t = setTimeout(() => setCopied(false), 2500);
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, [copied]);

  async function doCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      const fallbackInput = document.createElement("textarea");
      fallbackInput.value = text;
      fallbackInput.style.position = "fixed";
      fallbackInput.style.opacity = "0";
      document.body.appendChild(fallbackInput);
      fallbackInput.focus();
      fallbackInput.select();
      try {
        document.execCommand("copy");
        setCopied(true);
      } finally {
        document.body.removeChild(fallbackInput);
      }
    }
  }

  async function doShare(text: string) {
    if (navigator.share) {
      try {
        await navigator.share({ title: "AI Follow-Up Script", text });
        return;
      } catch {
        // fall through to copy
      }
    }
    await doCopy(text);
  }

  return (
    <div
      key={message.id}
      className={cn("flex", isAi ? "justify-start" : "justify-end")}
    >
      <div className="max-w-[80%]">
        <div
          className={cn(
            " rounded-lg px-4 py-3",
            isAi ? "bg-gray-100 text-gray-900" : "bg-blue-600 text-white",
          )}
        >
          {isAi ? (
            <div className="prose max-w-none text-sm leading-relaxed markdown-body">
              <ReactMarkdown
                children={message.text}
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ node, ...props }) => (
                    <p
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      {...props}
                    />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="pl-5 my-2 list-disc" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="pl-5 my-2 list-decimal" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="pl-3 border-l-2 border-gray-200 italic my-2"
                      {...props}
                    />
                  ),
                  // eslint-disable-next-line
                  code({ node, inline, className, children, ...props }) {
                    if (inline) {
                      return (
                        <code className="inline-code" {...props}>
                          {children}
                        </code>
                      );
                    }
                    return (
                      <pre className="code-block">
                        <code {...props}>{children}</code>
                      </pre>
                    );
                  },
                }}
              />
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {message.text}
            </p>
          )}
        </div>

        {isAi && message.text && (
          <div className="mt-1 flex items-center justify-end gap-1 opacity-70">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => doCopy(message.text)}
              aria-label="Copy message"
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => doShare(message.text)}
            >
              <Share2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
