import * as React from "react";
import { Send, FileSignature, CheckCircle2, ShieldCheck, Mail, User } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface DocuSignSendPayload {
  signerName: string;
  signerEmail: string;
  emailSubject: string;
  emailMessage: string;
  expirationDays: string;
  documentTitle: string;
}

interface SendDocuSignDialogProps {
  leadId?: string;
  projectName?: string;
  defaultSignerName?: string;
  defaultSignerEmail?: string;
  onSuccess?: (payload: DocuSignSendPayload) => void;
  trigger?: React.ReactNode;
}

export default function SendDocuSignDialog({
  leadId,
  projectName = "Project",
  defaultSignerName = "",
  defaultSignerEmail = "",
  onSuccess,
  trigger,
}: SendDocuSignDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [signerName, setSignerName] = React.useState(defaultSignerName);
  const [signerEmail, setSignerEmail] = React.useState(defaultSignerEmail);
  const [emailSubject, setEmailSubject] = React.useState(
    `Please sign: Fabrication & Supply Agreement - ${projectName}`
  );
  const [emailMessage, setEmailMessage] = React.useState(
    "Please review and sign the attached Fabrication & Supply Agreement for your project. Let us know if you have any questions."
  );
  const [expirationDays, setExpirationDays] = React.useState("14");

  // Keep defaults updated if props change
  React.useEffect(() => {
    if (defaultSignerName) setSignerName(defaultSignerName);
    if (defaultSignerEmail) setSignerEmail(defaultSignerEmail);
    if (projectName) {
      setEmailSubject(`Please sign: Fabrication & Supply Agreement - ${projectName}`);
    }
  }, [defaultSignerName, defaultSignerEmail, projectName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim() || !signerEmail.trim()) {
      toast.error("Please provide both signer name and email address.");
      return;
    }

    setIsSubmitting(true);

    // Simulate sending until real backend API is hooked up
    setTimeout(() => {
      setIsSubmitting(false);
      setOpen(false);

      const payload: DocuSignSendPayload = {
        signerName: signerName.trim(),
        signerEmail: signerEmail.trim(),
        emailSubject: emailSubject.trim(),
        emailMessage: emailMessage.trim(),
        expirationDays,
        documentTitle: "Fabrication & Supply Agreement",
      };

      toast.success("Contract envelope sent successfully via DocuSign", {
        description: `Sent to ${payload.signerEmail}. The customer will receive an email to sign.`,
      });

      if (onSuccess) {
        onSuccess(payload);
      }
    }, 700);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            size="sm"
            className="rounded-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md gap-2"
          >
            <Send className="h-4 w-4" />
            <span>Send with DocuSign</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[540px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileSignature className="h-4 w-4" />
              </div>
              <DialogTitle className="text-lg font-semibold text-slate-800">
                Send Contract for Signature
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              The customer will receive an official DocuSign email with a secure link to review and legally sign the agreement.
            </DialogDescription>
          </DialogHeader>

          {/* Document summary callout */}
          <div className="rounded-md border border-blue-100 bg-blue-50/50 p-3 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-0.5">
              <p className="font-semibold text-blue-900">
                Fabrication & Supply Agreement
              </p>
              <p className="text-slate-500">
                Project: <span className="font-medium text-slate-700">{projectName}</span> (Lead ID: {leadId || "—"})
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="signer-name" className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  Signer Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="signer-name"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signer-email" className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  Signer Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="signer-email"
                  type="email"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email-subject" className="text-xs font-medium text-slate-700">
                Email Subject
              </Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Contract subject line"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email-message" className="text-xs font-medium text-slate-700">
                Optional Message to Customer
              </Label>
              <Textarea
                id="email-message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Add a personalized note..."
                rows={2}
                className="text-sm resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expiry" className="text-xs font-medium text-slate-700">
                Signing Window Expiration
              </Label>
              <Select value={expirationDays} onValueChange={setExpirationDays}>
                <SelectTrigger id="expiry" className="h-9 text-sm w-full">
                  <SelectValue placeholder="Select expiry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days (Default)</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="60">60 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Send via DocuSign</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
