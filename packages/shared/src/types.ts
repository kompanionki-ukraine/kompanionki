// ─── Domain enums ────────────────────────────────────────────────────────────

export type Intent =
  | "friendship"
  | "co_living"
  | "co_parenting"
  | "co_business"
  | "mentorship"
  | "support";

export type LifeStage =
  | "single"
  | "single_mother"
  | "partnered"
  | "widowed"
  | "divorced"
  | "other";

export type ChildrenStatus =
  | "none"
  | "have"
  | "planning"
  | "prefer_not_say";

export type VerifiedLevel = "none" | "phone" | "selfie" | "id";

export type LanguagePref = "uk" | "en";

export type UserStatus =
  | "pending_verification"
  | "active"
  | "suspended"
  | "banned"
  | "deleted";

export type ProfileVisibility =
  | "public"
  | "members_only"
  | "connections_only";

export type ConnectionStatus = "pending" | "accepted" | "declined" | "blocked";

export type MessageType = "text" | "image" | "voice" | "system";

export type ConversationType = "direct" | "group";

export type GroupType = "city" | "intent" | "interest" | "support";

export type GroupRole = "member" | "moderator" | "owner";

export type EventVisibility = "public" | "group_only" | "invite_only";

export type AttendeeStatus = "going" | "interested" | "declined";

export type PostReaction = "heart" | "support" | "celebrate";

// ─── Core entities ────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  displayName: string;
  birthYear: number;
  bio: string;
  city: string;
  region: string;
  lifeStage: LifeStage;
  childrenStatus: ChildrenStatus;
  childrenCount: number;
  languages: string[];
  occupation: string;
  avatarUrl: string | null;
  photos: string[];
  valuesTags: string[];
  dealBreakers: string[];
  intents: Intent[];
  verifiedLevel: VerifiedLevel;
  onboardingCompleted: boolean;
  profileVisibility: ProfileVisibility;
  locationRadiusKm: number;
  updatedAt: string;
}

export interface Connection {
  id: string;
  requesterId: string;
  recipientId: string;
  status: ConnectionStatus;
  intentContext: Intent[];
  createdAt: string;
  respondedAt: string | null;
  // populated join
  user?: UserProfile;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content: string;
  mediaUrl: string | null;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  createdAt: string;
  lastMessageAt: string | null;
  lastMessage: Message | null;
  unreadCount: number;
  // populated join
  members?: ConversationMember[];
  otherUser?: UserProfile;
}

export interface ConversationMember {
  conversationId: string;
  userId: string;
  joinedAt: string;
  lastReadAt: string | null;
  muted: boolean;
}

export interface Group {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverUrl: string | null;
  type: GroupType;
  intentTag: string | null;
  city: string | null;
  isPrivate: boolean;
  memberCount: number;
  createdById: string;
  createdAt: string;
  // populated
  isJoined?: boolean;
  myRole?: GroupRole;
}

export interface Post {
  id: string;
  authorId: string;
  groupId: string;
  content: string;
  mediaUrls: string[];
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
  replyCount: number;
  reactionCount: number;
  author?: UserProfile;
  myReaction?: PostReaction | null;
}

export interface PostReply {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  deletedAt: string | null;
  author?: UserProfile;
}

export interface Event {
  id: string;
  organizerId: string;
  groupId: string | null;
  title: string;
  description: string;
  coverUrl: string | null;
  startAt: string;
  endAt: string | null;
  locationName: string | null;
  city: string | null;
  isOnline: boolean;
  onlineLink: string | null;
  maxAttendees: number | null;
  visibility: EventVisibility;
  createdAt: string;
  attendeeCount: number;
  // populated
  attendeeStatus?: AttendeeStatus | null;
}

export interface Endorsement {
  id: string;
  fromUserId: string;
  toUserId: string;
  text: string;
  createdAt: string;
  fromUser?: UserProfile;
}

// ─── API DTOs ─────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  error: string;
  code?: string;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  publicUrl: string;
  token: string;
}
