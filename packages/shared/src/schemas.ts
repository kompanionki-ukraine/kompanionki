import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const PhoneAuthSchema = z.object({
  phone: z
    .string()
    .regex(/^\+380\d{9}$/, "Вкажіть номер у форматі +380XXXXXXXXX"),
});

export const OtpVerifySchema = z.object({
  phone: z.string(),
  otp: z.string().length(6, "Код має бути 6 цифр"),
});

// ─── Profile ──────────────────────────────────────────────────────────────────

const IntentEnum = z.enum([
  "friendship",
  "co_living",
  "co_parenting",
  "co_business",
  "mentorship",
  "support",
]);

const LifeStageEnum = z.enum([
  "single",
  "single_mother",
  "partnered",
  "widowed",
  "divorced",
  "other",
]);

const ChildrenStatusEnum = z.enum([
  "none",
  "have",
  "planning",
  "prefer_not_say",
]);

export const CreateProfileSchema = z.object({
  displayName: z.string().min(2).max(60),
  birthYear: z
    .number()
    .int()
    .min(1940)
    .max(new Date().getFullYear() - 18),
  bio: z.string().max(500).optional(),
  city: z.string().min(1).max(100),
  region: z.string().max(100).optional(),
  lifeStage: LifeStageEnum,
  childrenStatus: ChildrenStatusEnum,
  childrenCount: z.number().int().min(0).max(20).default(0),
  languages: z.array(z.string()).min(1),
  occupation: z.string().max(100).optional(),
  valuesTags: z.array(z.string()).max(15).default([]),
  dealBreakers: z.array(z.string()).max(10).default([]),
  intents: z.array(IntentEnum).min(1),
});

export const UpdateProfileSchema = CreateProfileSchema.partial();

export const DiscoveryFiltersSchema = z.object({
  intent: IntentEnum.optional(),
  city: z.string().optional(),
  minAge: z.coerce.number().int().min(18).max(99).optional(),
  maxAge: z.coerce.number().int().min(18).max(99).optional(),
  lifeStage: LifeStageEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

// ─── Connections ──────────────────────────────────────────────────────────────

export const SendConnectionSchema = z.object({
  recipientId: z.string().uuid(),
  intentContext: z.array(IntentEnum).min(1),
  message: z.string().max(300).optional(),
});

export const RespondConnectionSchema = z.object({
  status: z.enum(["accepted", "declined"]),
});

// ─── Messages ─────────────────────────────────────────────────────────────────

export const SendMessageSchema = z.object({
  content: z.string().min(1).max(4000),
  type: z.enum(["text", "image"]).default("text"),
  mediaUrl: z.string().url().optional(),
});

export const CreateConversationSchema = z.object({
  recipientId: z.string().uuid(),
});

// ─── Groups ───────────────────────────────────────────────────────────────────

export const CreateGroupSchema = z.object({
  name: z.string().min(3).max(80),
  description: z.string().min(10).max(1000),
  type: z.enum(["city", "intent", "interest", "support"]),
  intentTag: z.string().optional(),
  city: z.string().optional(),
  isPrivate: z.boolean().default(false),
});

export const CreatePostSchema = z.object({
  groupId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  mediaUrls: z.array(z.string().url()).max(5).default([]),
});

export const CreateReplySchema = z.object({
  content: z.string().min(1).max(2000),
});

// ─── Events ───────────────────────────────────────────────────────────────────

export const CreateEventSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(10).max(2000),
  groupId: z.string().uuid().optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
  locationName: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  isOnline: z.boolean().default(false),
  onlineLink: z.string().url().optional(),
  maxAttendees: z.number().int().min(2).max(10000).optional(),
  visibility: z.enum(["public", "group_only", "invite_only"]).default("public"),
});

// ─── Moderation ───────────────────────────────────────────────────────────────

export const ReportSchema = z.object({
  targetType: z.enum(["user", "post", "message", "group"]),
  targetId: z.string().uuid(),
  reason: z.enum([
    "spam",
    "harassment",
    "inappropriate_content",
    "fake_profile",
    "other",
  ]),
  details: z.string().max(500).optional(),
});

// ─── Uploads ─────────────────────────────────────────────────────────────────

export const UploadRequestSchema = z.object({
  purpose: z.enum(["avatar", "post_image", "group_cover", "event_cover"]),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  size: z.number().int().max(5 * 1024 * 1024),
});

export type PhoneAuthInput = z.infer<typeof PhoneAuthSchema>;
export type OtpVerifyInput = z.infer<typeof OtpVerifySchema>;
export type CreateProfileInput = z.infer<typeof CreateProfileSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type DiscoveryFiltersInput = z.infer<typeof DiscoveryFiltersSchema>;
export type SendConnectionInput = z.infer<typeof SendConnectionSchema>;
export type RespondConnectionInput = z.infer<typeof RespondConnectionSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type CreateGroupInput = z.infer<typeof CreateGroupSchema>;
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type ReportInput = z.infer<typeof ReportSchema>;
export type UploadRequestInput = z.infer<typeof UploadRequestSchema>;
