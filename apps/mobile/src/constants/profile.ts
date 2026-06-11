import type { VerifiedLevel } from "@kompanionki/shared";

export const verificationBadgeKey: Record<VerifiedLevel, string> = {
  none: "",
  phone: "profile.verifiedPhone",
  selfie: "profile.verifiedSelfie",
  id: "profile.verifiedId",
};
