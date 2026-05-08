import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { UploadRequestSchema } from "@kompanionki/shared";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { randomUUID } from "crypto";

const router = Router();

const BUCKET_MAP: Record<string, string> = {
  avatar: "avatars",
  post_image: "posts",
  group_cover: "groups",
  event_cover: "events",
};

/**
 * POST /api/v1/uploads/presign
 * Returns a short-lived presigned upload URL for Supabase Storage.
 * The client POSTs directly to the bucket and then sends the publicUrl
 * back to the API as part of the profile/post creation request.
 */
router.post("/presign", requireAuth, validate(UploadRequestSchema), async (req, res, next) => {
  try {
    const { purpose, contentType } = req.body as {
      purpose: keyof typeof BUCKET_MAP;
      contentType: string;
    };

    const bucket = BUCKET_MAP[purpose];
    const ext = contentType.split("/")[1];
    const path = `${req.userId}/${randomUUID()}.${ext}`;

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error || !data) {
      res.status(500).json({ error: error?.message ?? "Could not generate upload URL" });
      return;
    }

    const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

    res.json({
      uploadUrl: data.signedUrl,
      token: data.token,
      publicUrl: urlData.publicUrl,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
