import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";
import { API_BASE_URL } from "../config/publicEnv";
import type { RootState } from "../store";
import type {
  Intent,
  UserProfile,
  Connection,
  Conversation,
  Message,
  Group,
  Post,
  PostReply,
  Event,
  Endorsement,
  PaginatedResponse,
  PresignedUploadResponse,
} from "@kompanionki/shared";

/** API returns Prisma rows with intents under `user.intents`; `UserProfile` expects top-level `intents`. */
function normalizeProfile(raw: Record<string, unknown>): UserProfile {
  const user = raw.user as
    | { intents?: Array<{ intent: string; active?: boolean }> }
    | undefined;
  const intentsFromJoin =
    user?.intents
      ?.filter((row) => row.active !== false)
      .map((row) => row.intent as Intent) ?? [];
  const topLevel = raw.intents as Intent[] | undefined;
  const intents = topLevel ?? intentsFromJoin;

  const updatedAt = raw.updatedAt;
  const updatedAtStr =
    typeof updatedAt === "string"
      ? updatedAt
      : updatedAt instanceof Date
        ? updatedAt.toISOString()
        : String(updatedAt ?? "");

  return {
    id: String(raw.userId ?? raw.id ?? ""),
    displayName: String(raw.displayName ?? ""),
    birthYear: Number(raw.birthYear ?? 0),
    bio: raw.bio != null ? String(raw.bio) : "",
    city: raw.city != null ? String(raw.city) : "",
    region: raw.region != null ? String(raw.region) : "",
    lifeStage: raw.lifeStage as UserProfile["lifeStage"],
    childrenStatus: raw.childrenStatus as UserProfile["childrenStatus"],
    childrenCount: Number(raw.childrenCount ?? 0),
    languages: (raw.languages as string[]) ?? [],
    occupation: raw.occupation != null ? String(raw.occupation) : "",
    avatarUrl: (raw.avatarUrl as string | null | undefined) ?? null,
    photos: (raw.photos as string[]) ?? [],
    valuesTags: (raw.valuesTags as string[]) ?? [],
    dealBreakers: (raw.dealBreakers as string[]) ?? [],
    intents,
    verifiedLevel: raw.verifiedLevel as UserProfile["verifiedLevel"],
    onboardingCompleted: Boolean(raw.onboardingCompleted),
    profileVisibility: raw.profileVisibility as UserProfile["profileVisibility"],
    locationRadiusKm: Number(raw.locationRadiusKm ?? 0),
    updatedAt: updatedAtStr,
  };
}

/** Default reaches the host machine from the Android emulator (localhost inside the emulator is the emulator itself). */
function defaultApiBaseUrl(): string {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }
  return "http://localhost:3000";
}

const trimmedApi = API_BASE_URL?.trim().replace(/\/$/, "");
const BASE_URL = trimmedApi
  ? Platform.OS === "android"
    ? trimmedApi.replace(/\/\/localhost([:\/])/, "//10.0.2.2$1")
    : trimmedApi
  : defaultApiBaseUrl();

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/v1`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).session.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "Profile",
    "Discovery",
    "Connections",
    "Conversations",
    "Messages",
    "Groups",
    "Posts",
    "Events",
  ],
  endpoints: (builder) => ({
    // ── Auth ────────────────────────────────────────────────────────────────
    // Exchange a refresh token for a new access/refresh pair
    refreshToken: builder.mutation<
      { accessToken: string; refreshToken: string },
      { refreshToken: string }
    >({
      query: (body) => ({ url: "/auth/refresh", method: "POST", body }),
    }),

    // ── Dev ─────────────────────────────────────────────────────────────────
    // Dev-only: issue a JWT for the seeded test user (gated by NODE_ENV on BE)
    loadTestSession: builder.mutation<
      { accessToken: string; userId: string },
      void
    >({
      query: () => ({ url: "/dev/test-session", method: "POST" }),
    }),

    // ── Profile ─────────────────────────────────────────────────────────────
    // Fetch the authenticated user's own profile
    getMyProfile: builder.query<UserProfile, void>({
      query: () => "/profiles/me",
      transformResponse: (raw: Record<string, unknown>) =>
        normalizeProfile(raw),
      providesTags: ["Profile"],
    }),

    // Create a new user profile during onboarding
    createProfile: builder.mutation<UserProfile, Partial<UserProfile>>({
      query: (body) => ({ url: "/profiles", method: "POST", body }),
      transformResponse: (raw: Record<string, unknown>) =>
        normalizeProfile(raw),
      invalidatesTags: ["Profile"],
    }),

    // Update the authenticated user's profile fields
    updateProfile: builder.mutation<UserProfile, Partial<UserProfile>>({
      query: (body) => ({ url: "/profiles/me", method: "PATCH", body }),
      transformResponse: (raw: Record<string, unknown>) =>
        normalizeProfile(raw),
      invalidatesTags: ["Profile"],
    }),

    // Fetch another user's public profile by ID
    getProfile: builder.query<UserProfile, string>({
      query: (id) => `/profiles/${id}`,
      transformResponse: (raw: Record<string, unknown>) =>
        normalizeProfile(raw),
      providesTags: (_r, _e, id) => [{ type: "Profile", id }],
    }),

    // Paginated discovery feed — browse profiles filtered by intent/city
    getDiscovery: builder.query<
      PaginatedResponse<UserProfile>,
      {
        intent?: string;
        city?: string;
        page?: number;
        pageSize?: number;
      }
    >({
      query: (params) => ({ url: "/profiles/discovery", params }),
      transformResponse: (
        response: PaginatedResponse<Record<string, unknown>>
      ) => ({
        ...response,
        data: response.data.map((row) => normalizeProfile(row)),
      }),
      providesTags: ["Discovery"],
    }),

    // ── Connections ──────────────────────────────────────────────────────────
    // List the authenticated user's accepted connections (paginated)
    getConnections: builder.query<
      PaginatedResponse<Connection>,
      { page?: number }
    >({
      query: (params) => ({ url: "/connections", params }),
      providesTags: ["Connections"],
    }),

    // List pending incoming connection requests
    getConnectionRequests: builder.query<Connection[], void>({
      query: () => "/connections/requests",
      providesTags: ["Connections"],
    }),

    // Send a connection request to another user
    sendConnection: builder.mutation<
      Connection,
      { recipientId: string; intentContext: string[] }
    >({
      query: (body) => ({ url: "/connections", method: "POST", body }),
      invalidatesTags: ["Connections", "Discovery"],
    }),

    // Accept or decline a pending connection request
    respondConnection: builder.mutation<
      Connection,
      { id: string; status: "accepted" | "declined" }
    >({
      query: ({ id, ...body }) => ({
        url: `/connections/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Connections"],
    }),

    // Block a user — hides them from discovery and connections
    blockUser: builder.mutation<void, { userId: string }>({
      query: (body) => ({ url: "/connections/block", method: "POST", body }),
      invalidatesTags: ["Connections", "Discovery"],
    }),

    // ── Conversations ─────────────────────────────────────────────────────
    // List all conversations for the authenticated user
    getConversations: builder.query<Conversation[], void>({
      query: () => "/conversations",
      providesTags: ["Conversations"],
    }),

    // Start a new 1-on-1 conversation with a connected user
    createConversation: builder.mutation<Conversation, { recipientId: string }>({
      query: (body) => ({ url: "/conversations", method: "POST", body }),
      invalidatesTags: ["Conversations"],
    }),

    // Fetch paginated messages within a conversation
    getMessages: builder.query<
      PaginatedResponse<Message>,
      { conversationId: string; page?: number }
    >({
      query: ({ conversationId, ...params }) => ({
        url: `/conversations/${conversationId}/messages`,
        params,
      }),
      providesTags: (_r, _e, { conversationId }) => [
        { type: "Messages", id: conversationId },
      ],
    }),

    // Send a text or image message in a conversation
    sendMessage: builder.mutation<
      Message,
      { conversationId: string; content: string; type?: "text" | "image"; mediaUrl?: string }
    >({
      query: ({ conversationId, ...body }) => ({
        url: `/conversations/${conversationId}/messages`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { conversationId }) => [
        { type: "Messages", id: conversationId },
        "Conversations",
      ],
    }),

    // ── Groups ────────────────────────────────────────────────────────────
    // Browse/search groups (filter by type, city, or user's own)
    getGroups: builder.query<
      PaginatedResponse<Group>,
      { type?: string; city?: string; mine?: boolean; page?: number }
    >({
      query: (params) => ({ url: "/groups", params }),
      providesTags: ["Groups"],
    }),

    // Fetch a single group's details
    getGroup: builder.query<Group, string>({
      query: (id) => `/groups/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Groups", id }],
    }),

    // Join a group as a member
    joinGroup: builder.mutation<void, string>({
      query: (id) => ({ url: `/groups/${id}/join`, method: "POST" }),
      invalidatesTags: ["Groups"],
    }),

    // Leave a group
    leaveGroup: builder.mutation<void, string>({
      query: (id) => ({ url: `/groups/${id}/leave`, method: "DELETE" }),
      invalidatesTags: ["Groups"],
    }),

    // Fetch paginated posts within a group
    getPosts: builder.query<
      PaginatedResponse<Post>,
      { groupId: string; page?: number }
    >({
      query: ({ groupId, ...params }) => ({
        url: `/groups/${groupId}/posts`,
        params,
      }),
      providesTags: (_r, _e, { groupId }) => [{ type: "Posts", id: groupId }],
    }),

    // Create a new post in a group (text + optional media)
    createPost: builder.mutation<
      Post,
      { groupId: string; content: string; mediaUrls?: string[] }
    >({
      query: ({ groupId, ...body }) => ({
        url: `/groups/${groupId}/posts`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { groupId }) => [{ type: "Posts", id: groupId }],
    }),

    // Add an emoji reaction to a post
    reactToPost: builder.mutation<
      void,
      { groupId: string; postId: string; reaction: string }
    >({
      query: ({ groupId, postId, reaction }) => ({
        url: `/groups/${groupId}/posts/${postId}/reactions`,
        method: "POST",
        body: { reaction },
      }),
      invalidatesTags: (_r, _e, { groupId }) => [{ type: "Posts", id: groupId }],
    }),

    // Fetch all replies (comments) on a post
    getReplies: builder.query<
      PostReply[],
      { groupId: string; postId: string }
    >({
      query: ({ groupId, postId }) =>
        `/groups/${groupId}/posts/${postId}/replies`,
      providesTags: (_r, _e, { postId }) => [{ type: "Posts", id: postId }],
    }),

    // Reply to a post in a group
    createReply: builder.mutation<
      PostReply,
      { groupId: string; postId: string; content: string }
    >({
      query: ({ groupId, postId, content }) => ({
        url: `/groups/${groupId}/posts/${postId}/replies`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: (_r, _e, { postId }) => [{ type: "Posts", id: postId }],
    }),

    // ── Events ────────────────────────────────────────────────────────────
    // Browse events (filter by city, upcoming flag)
    getEvents: builder.query<
      PaginatedResponse<Event>,
      { city?: string; upcoming?: boolean; page?: number }
    >({
      query: (params) => ({ url: "/events", params }),
      providesTags: ["Events"],
    }),

    // Fetch a single event's details
    getEvent: builder.query<Event, string>({
      query: (id) => `/events/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Events", id }],
    }),

    // RSVP to an event (going / interested / declined)
    attendEvent: builder.mutation<
      void,
      { eventId: string; status?: "going" | "interested" | "declined" }
    >({
      query: ({ eventId, ...body }) => ({
        url: `/events/${eventId}/attend`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Events"],
    }),

    // Cancel RSVP — remove attendance from an event
    unattendEvent: builder.mutation<void, string>({
      query: (eventId) => ({
        url: `/events/${eventId}/attend`,
        method: "DELETE",
      }),
      invalidatesTags: ["Events"],
    }),

    // ── Uploads ──────────────────────────────────────────────────────────
    // Get a pre-signed URL for direct-to-S3 file upload
    getPresignedUpload: builder.mutation<
      PresignedUploadResponse,
      { purpose: string; contentType: string; size: number }
    >({
      query: (body) => ({ url: "/uploads/presign", method: "POST", body }),
    }),

    // ── Reports ──────────────────────────────────────────────────────────
    // Report a user, post, or group for moderation review
    createReport: builder.mutation<
      void,
      {
        targetType: string;
        targetId: string;
        reason: string;
        details?: string;
      }
    >({
      query: (body) => ({ url: "/reports", method: "POST", body }),
    }),

    // ── Endorsements ─────────────────────────────────────────────────────
    // Fetch endorsements received by a user
    getEndorsements: builder.query<Endorsement[], string>({
      query: (userId) => `/profiles/${userId}`,
    }),
  }),
});

export const {
  useRefreshTokenMutation,
  useLoadTestSessionMutation,
  useGetMyProfileQuery,
  useCreateProfileMutation,
  useUpdateProfileMutation,
  useGetProfileQuery,
  useGetDiscoveryQuery,
  useGetConnectionsQuery,
  useGetConnectionRequestsQuery,
  useSendConnectionMutation,
  useRespondConnectionMutation,
  useBlockUserMutation,
  useGetConversationsQuery,
  useCreateConversationMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useGetGroupsQuery,
  useGetGroupQuery,
  useJoinGroupMutation,
  useLeaveGroupMutation,
  useGetPostsQuery,
  useCreatePostMutation,
  useReactToPostMutation,
  useGetRepliesQuery,
  useCreateReplyMutation,
  useGetEventsQuery,
  useGetEventQuery,
  useAttendEventMutation,
  useUnattendEventMutation,
  useGetPresignedUploadMutation,
  useCreateReportMutation,
} = api;
