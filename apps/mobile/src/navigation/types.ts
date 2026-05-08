import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

// ── Auth stack ────────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Welcome: undefined;
  PhoneInput: undefined;
  OtpVerify: { phone: string };
  OnboardingStep1: undefined;
  OnboardingStep2: undefined;
  OnboardingStep3: undefined;
  OnboardingStep4: undefined;
  OnboardingStep5: undefined;
};

// ── Tab navigator ─────────────────────────────────────────────────────────────
export type TabParamList = {
  DiscoverTab: undefined;
  GroupsTab: undefined;
  MessagesTab: undefined;
  EventsTab: undefined;
  ProfileTab: undefined;
};

// ── Discover stack ────────────────────────────────────────────────────────────
export type DiscoverStackParamList = {
  Discovery: undefined;
};

// ── Groups stack ──────────────────────────────────────────────────────────────
export type GroupsStackParamList = {
  GroupsList: undefined;
};

// ── Messages stack ────────────────────────────────────────────────────────────
export type MessagesStackParamList = {
  ConversationList: undefined;
};

// ── Events stack ──────────────────────────────────────────────────────────────
export type EventsStackParamList = {
  EventsList: undefined;
};

// ── Profile stack ─────────────────────────────────────────────────────────────
export type ProfileStackParamList = {
  MyProfile: undefined;
};

// ── Screen prop helpers ───────────────────────────────────────────────────────
export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> =
  BottomTabScreenProps<TabParamList, T>;

export type DiscoverScreenProps<T extends keyof DiscoverStackParamList> =
  NativeStackScreenProps<DiscoverStackParamList, T>;

export type GroupsScreenProps<T extends keyof GroupsStackParamList> =
  NativeStackScreenProps<GroupsStackParamList, T>;

export type MessagesScreenProps<T extends keyof MessagesStackParamList> =
  NativeStackScreenProps<MessagesStackParamList, T>;

export type EventsScreenProps<T extends keyof EventsStackParamList> =
  NativeStackScreenProps<EventsStackParamList, T>;

export type ProfileScreenProps<T extends keyof ProfileStackParamList> =
  NativeStackScreenProps<ProfileStackParamList, T>;
