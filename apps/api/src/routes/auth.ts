import { Router } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";

const router = Router();

/** POST /api/v1/auth/refresh  */
router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) {
      res.status(400).json({ error: "refreshToken required" });
      return;
    }

    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token: refreshToken,
    });
    if (error || !data.session) {
      res.status(401).json({ error: error?.message ?? "Refresh failed" });
      return;
    }
    res.json({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
