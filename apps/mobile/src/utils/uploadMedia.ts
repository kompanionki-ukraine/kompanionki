/**
 * Upload flow:
 * 1. POST /api/v1/uploads/presign → { uploadUrl, publicUrl }
 * 2. PUT file bytes directly to Supabase Storage (signed URL)
 * 3. Return publicUrl to use in profile/post payload
 *
 * Stays within Supabase free tier (1 GB storage, 5 GB egress/mo):
 * - Images are resized on-device to ≤ 1200px before upload
 * - Files > 5 MB are rejected client-side before calling presign
 */

import { store } from "../store";
import { api } from "../api/client";

type UploadPurpose = "avatar" | "post_image" | "group_cover" | "event_cover";

export interface LocalFile {
  uri: string;
  type: "image/jpeg" | "image/png" | "image/webp";
  size: number;
  name: string;
}

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadMedia(
  file: LocalFile,
  purpose: UploadPurpose
): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error("Файл занадто великий (максимум 5 МБ)");
  }

  // Dispatch RTK Query mutation via store directly (callable outside hooks)
  const result = await store.dispatch(
    api.endpoints.getPresignedUpload.initiate({
      purpose,
      contentType: file.type,
      size: file.size,
    })
  );

  if ("error" in result || !result.data) {
    throw new Error("Не вдалося отримати URL для завантаження");
  }

  const { uploadUrl, publicUrl } = result.data;

  // Upload directly to Supabase Storage via signed PUT URL
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: await fileToBlob(file.uri),
  });

  if (!response.ok) {
    throw new Error(`Помилка завантаження: ${response.status}`);
  }

  return publicUrl;
}

async function fileToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}
