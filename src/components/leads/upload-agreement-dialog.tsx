import * as React from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadFileDialog } from "@/components/upload-file-dialog";
import SuccessDialog from "@/components/success-dialog";
import { apiClient } from "@/modules/auth/auth.api";

interface UploadAgreementDialogProps {
  leadId?: string;
  onSuccess?: () => void;
}

export default function UploadAgreementDialog({ leadId, onSuccess }: UploadAgreementDialogProps) {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleUploadComplete = async (files: { url: string; name: string }[]) => {
    if (!leadId || files.length === 0) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const fileToUpload = files[0];
      await apiClient.post(`/api/uploads/leads/${leadId}/agreement`, {
        url: fileToUpload.url,
        name: fileToUpload.name,
      });
      setShowSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
            (err as { message?: string }).message ||
            "Agreement upload failed"
          : err instanceof Error
          ? err.message
          : "Agreement upload failed";
      setError(errorMsg);
      console.error("Agreement upload failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <UploadFileDialog
        title="Upload Agreement"
        description="Upload agreement document for this lead."
        accept=".pdf,.doc,.docx"
        maxFiles={1}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploadComplete={handleUploadComplete}
      >
        <Button
          variant="outline"
          className="rounded-sm border-blue-500 shadow-md"
          size="sm"
          disabled={isSubmitting}
        >
          <Upload />
          <span>Upload Agreement</span>
        </Button>
      </UploadFileDialog>

      {error && (
        <div className="text-red-500 text-xs mt-2 text-center font-medium">
          {error}
        </div>
      )}

      <SuccessDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Agreement Uploaded Successfully"
      />
    </>
  );
}
