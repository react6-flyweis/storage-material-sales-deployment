/**
 * Decodes base64 PDF data and triggers a browser download using Blob / createObjectURL.
 * Handles both raw base64 and data URLs (data:application/pdf;base64,...).
 */
export function downloadPdfFromBase64(
  base64OrDataUrl: string,
  fileName = "Quotation.pdf",
  mimeType = "application/pdf"
): void {
  if (!base64OrDataUrl) {
    throw new Error("No PDF data provided for download.");
  }

  // Strip data URL prefix if present
  const cleanBase64 = base64OrDataUrl.includes(",")
    ? base64OrDataUrl.split(",")[1]
    : base64OrDataUrl;

  // Decode base64
  const byteCharacters = atob(cleanBase64);
  const byteNumbers = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const blob = new Blob([byteNumbers], { type: mimeType || "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 1000);
}
