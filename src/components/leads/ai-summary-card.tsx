import { useState } from "react";
import { Sparkles, Copy, Check, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { TranscriptSummary } from "@/modules/leads/leads.api";

type Props = {
  summary?: TranscriptSummary | null;
  projectName?: string;
};

export default function AiSummaryCard({ summary, projectName }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!summary?.text) return;
    try {
      await navigator.clipboard.writeText(summary.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy AI summary", err);
    }
  };

  const formattedDate = summary?.updatedAt
    ? new Date(summary.updatedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  if (!summary?.text) {
    return (
      <Card className="py-8 gap-0 flex flex-col items-center justify-center px-6 text-center bg-white shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
          <FileText className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No AI Summary Yet</h3>
        <p className="mt-1 text-sm text-slate-500 max-w-sm">
          The AI will automatically generate and update a comprehensive quote summary as conversations and calls occur with the customer.
        </p>
      </Card>
    );
  }

  return (
    <Card className="py-0 gap-0 bg-white shadow-xs border border-slate-200/80 overflow-hidden">
      <CardHeader className="bg-slate-50/70 border-b border-slate-200/60 py-3.5 px-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">
              AI Project & Requirements Summary
            </CardTitle>
            {projectName ? (
              <p className="text-xs text-slate-500">{projectName}</p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {formattedDate ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Updated {formattedDate}</span>
            </div>
          ) : null}

          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs border-slate-300"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-500" />
                <span>Copy Summary</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {summary.text}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}

