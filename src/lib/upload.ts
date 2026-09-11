import { apiClient } from "@/modules/auth/auth.api";

export async function uploadFileToS3(
  file: File,
  folder: string = "documents",
  onProgress?: (progress: number) => void
): Promise<string> {
  // Step 1: Get presigned URL
  const response = await apiClient.post<{
    success?: boolean;
    message?: string;
    data?: { uploadUrl: string; fileUrl: string; key: string };
    uploadUrl?: string;
    fileUrl?: string;
  }>(
    "/api/upload/presigned-url",
    {
      fileName: file.name,
      fileType: file.type || "application/octet-stream",
      folder,
    }
  );

  const payload = response.data.data || response.data;
  const uploadUrl = payload.uploadUrl;
  const fileUrl = payload.fileUrl;

  if (!uploadUrl || !fileUrl) {
    throw new Error("Failed to retrieve upload URL from server.");
  }

  // Step 2: Upload the file directly to S3 using uploadUrl
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload file to S3: ${uploadResponse.statusText}`);
  }


  // Step 2: Upload the file directly to S3 using XHR for progress tracking
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream"
    );

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          onProgress(percentComplete);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100);
        resolve();
      } else {
        reject(new Error(`S3 upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during S3 upload."));
    };

    xhr.send(file);
  });

  // Step 3: Return the fileUrl so it can be saved to the database payload
  return fileUrl;
}

