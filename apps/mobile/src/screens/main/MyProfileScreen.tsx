import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import type { ProfileScreenProps } from "../../navigation/types";
import { colors, typography, spacing, radius, shadows, intentColors } from "../../theme";
import { api, useGetMyProfileQuery, useGetConnectionsQuery } from "../../api/client";
import { useAppDispatch } from "../../store";
import { logout } from "../../store/sessionSlice";
import { supabase } from "../../lib/supabase";
import { signOutSocial } from "../../auth/socialSignIn";
import type { Intent, VerifiedLevel } from "@kompanionki/shared";

const intentIcons: Record<Intent, string> = {
  friendship: "💝",
  co_living: "🏠",
  co_parenting: "👨‍👩‍👧",
  co_business: "💼",
  mentorship: "🎓",
  support: "🤝",
};

const verificationBadgeLabel: Record<VerifiedLevel, string> = {
  none: "",
  phone: "Телефон верифіковано",
  selfie: "Селфі верифіковано",
  id: "ID верифіковано",
};

// ─── SettingsItem ─────────────────────────────────────────────────────────────

interface SettingsItemProps {
  icon: string;
  label: string;
  description?: string;
  onPress?: () => void;
  destructive?: boolean;
}

function SettingsItem({ icon, label, description, onPress, destructive }: SettingsItemProps) {
  return (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.settingsIconBox, destructive && styles.settingsIconBoxDestructive]}>
        <Ionicons
          name={icon}
          size={20}
          color={destructive ? colors.error : colors.textSecondary}
        />
      </View>
      <View style={styles.settingsContent}>
        <Text style={[styles.settingsLabel, destructive && styles.settingsLabelDestructive]}>
          {label}
        </Text>
        {description ? (
          <Text style={styles.settingsDescription}>{description}</Text>
        ) : null}
      </View>
      {onPress && !destructive ? (
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      ) : null}
    </TouchableOpacity>
  );
}

// ─── MyProfileScreen ──────────────────────────────────────────────────────────

export default function MyProfileScreen(_props: ProfileScreenProps<"MyProfile">) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [loggingOut, setLoggingOut] = useState(false);

  const {
    data: profile,
    isLoading,
    error: profileError,
    refetch,
  } = useGetMyProfileQuery();
  const { data: connectionsData } = useGetConnectionsQuery({ page: 1 });
  const connectionsCount = connectionsData?.total ?? 0;

  const handleLogout = useCallback(() => {
    if (loggingOut) return;
    Alert.alert(
      t("profile.logout"),
      "Ви впевнені, що хочете вийти?",
      [
        { text: t("actions.cancel"), style: "cancel" },
        {
          text: t("profile.logout"),
          style: "destructive",
          onPress: async () => {
            setLoggingOut(true);
            try {
              await supabase.auth.signOut();
              await signOutSocial();
            } catch (err) {
              console.error("[handleLogout]", err);
            } finally {
              dispatch(api.util.resetApiState());
              dispatch(logout());
            }
          },
        },
      ]
    );
  }, [dispatch, loggingOut, t]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={["top"]}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!profile) {
    const status =
      profileError && typeof profileError === "object" && "status" in profileError
        ? (profileError as { status?: number | string }).status
        : undefined;
    const isNotFound = status === 404;
    return (
      <SafeAreaView style={styles.errorContainer} edges={["top"]}>
        <Ionicons
          name={isNotFound ? "person-add-outline" : "cloud-offline-outline"}
          size={48}
          color={colors.textMuted}
        />
        <Text style={styles.errorTitle}>
          {isNotFound ? "Профіль ще не створено" : "Не вдалося завантажити профіль"}
        </Text>
        <Text style={styles.errorBody}>
          {isNotFound
            ? "Завершіть реєстрацію, щоб створити свій профіль."
            : "Перевірте підключення до інтернету та спробуйте ще раз."}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>{t("errors.tryAgain")}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const age = new Date().getFullYear() - profile.birthYear;
  const isVerified = profile.verifiedLevel !== "none";
  const verificationLabel = verificationBadgeLabel[profile.verifiedLevel];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Navigation bar */}
      <View style={styles.navBar}>
        <View style={styles.navBarSpacer} />
        <Text style={styles.navBarTitle}>{t("profile.title")}</Text>
        <TouchableOpacity style={styles.navBarButton}>
          <Ionicons name="settings-outline" size={22} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {profile.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarFallbackText}>
                    {profile.displayName?.[0] ?? "?"}
                  </Text>
                </View>
              )}
              <TouchableOpacity style={styles.avatarEditButton}>
                <Ionicons name="pencil" size={14} color={colors.textInverse} />
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.displayName} numberOfLines={1}>
                  {profile.displayName}
                </Text>
                {isVerified ? (
                  <Ionicons name="shield-outline" size={20} color={colors.secondary} />
                ) : null}
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  {age} {t("profile.yearsOld")}
                </Text>
                {profile.city ? (
                  <>
                    <Text style={styles.metaDot}> • </Text>
                    <Ionicons name="location-outline" size={13} color={colors.textMuted} />
                    <Text style={styles.metaText}> {profile.city}</Text>
                  </>
                ) : null}
              </View>

              {isVerified ? (
                <View style={styles.verificationBadge}>
                  <Text style={styles.verificationBadgeText}>{verificationLabel}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{connectionsCount}</Text>
              <Text style={styles.statLabel}>{t("profile.connections")}</Text>
            </View>
            <View style={styles.statSeparator} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>{t("profile.endorsements")}</Text>
            </View>
          </View>
        </View>

        {/* About */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("profile.about")}</Text>
          <Text style={styles.bioText}>
            {profile.bio || "Розкажіть про себе..."}
          </Text>
          {profile.occupation ? (
            <View style={styles.infoRow}>
              <Ionicons name="briefcase-outline" size={16} color={colors.textMuted} />
              <Text style={styles.infoText}>{profile.occupation}</Text>
            </View>
          ) : null}
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
            <Text style={styles.infoText}>{t(`lifeStages.${profile.lifeStage}`)}</Text>
          </View>
        </View>

        {/* Looking for */}
        {profile.intents.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("profile.lookingFor")}</Text>
            <View style={styles.pillsRow}>
              {profile.intents.map((intent) => (
                <View
                  key={intent}
                  style={[styles.intentPill, { backgroundColor: intentColors[intent] }]}
                >
                  <Text style={styles.intentPillText}>
                    {intentIcons[intent]} {t(`intents.${intent}`)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Values */}
        {profile.valuesTags.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("profile.values")}</Text>
            <View style={styles.pillsRow}>
              {profile.valuesTags.map((tag) => (
                <View key={tag} style={styles.valuePill}>
                  <Text style={styles.valuePillText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Settings */}
        <View style={styles.card}>
          <SettingsItem
            icon="notifications-outline"
            label="Сповіщення"
            description="Налаштувати сповіщення"
            onPress={() => {}}
          />
          <View style={styles.settingsDivider} />
          <SettingsItem
            icon="lock-closed-outline"
            label="Приватність"
            description="Керувати видимістю профілю"
            onPress={() => {}}
          />
          <View style={styles.settingsDivider} />
          <SettingsItem
            icon="globe-outline"
            label="Мова"
            description="Українська"
            onPress={() => {}}
          />
          <View style={styles.settingsDivider} />
          <SettingsItem
            icon="help-circle-outline"
            label="Допомога"
            description="FAQ та підтримка"
            onPress={() => {}}
          />
          <View style={styles.settingsDivider} />
          <SettingsItem
            icon="star-outline"
            label="Оцінити додаток"
            onPress={() => {}}
          />
        </View>

        {/* Logout */}
        <View style={styles.card}>
          <SettingsItem
            icon="log-out-outline"
            label={loggingOut ? "Виходимо…" : t("profile.logout")}
            onPress={loggingOut ? undefined : handleLogout}
            destructive
          />
        </View>

        {/* Version */}
        <Text style={styles.versionText}>Компаньйонки v1.0.0 MVP</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  errorTitle: {
    ...typography.heading3,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  errorBody: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: "center",
  },
  retryButton: {
    marginTop: spacing.md,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  retryButtonText: {
    ...typography.label,
    color: colors.textInverse,
  },

  // Nav bar
  navBar: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  navBarSpacer: { width: 44 },
  navBarTitle: {
    ...typography.heading3,
    color: colors.text,
  },
  navBarButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  // Scroll
  scroll: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  scrollContent: {
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    ...shadows.md,
  },

  // Profile header
  profileHeader: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  avatarContainer: {
    width: 80,
    height: 80,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.surface,
    ...shadows.lg,
  },
  avatarFallback: {
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.primary,
  },
  avatarEditButton: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  displayName: {
    ...typography.heading2,
    color: colors.text,
    flexShrink: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: spacing.sm,
  },
  metaText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  metaDot: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  verificationBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.secondaryLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  verificationBadgeText: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: "600",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  statSeparator: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  statNumber: {
    ...typography.heading2,
    color: colors.text,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },

  // About
  sectionTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  bioText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  // Pills
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  intentPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  intentPillText: {
    ...typography.label,
    color: colors.textInverse,
  },
  valuePill: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  valuePillText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  // Settings
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  settingsIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsIconBoxDestructive: {
    backgroundColor: "#FEE2E2",
  },
  settingsContent: { flex: 1 },
  settingsLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
  },
  settingsLabelDestructive: {
    color: colors.error,
  },
  settingsDescription: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  settingsDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 40 + spacing.md,
  },

  // Footer
  versionText: {
    textAlign: "center",
    ...typography.caption,
    color: colors.textMuted,
    paddingBottom: spacing.lg,
  },
});
