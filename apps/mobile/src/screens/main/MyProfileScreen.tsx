import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import type { ProfileScreenProps } from "@/navigation/types";
import { colors, intentColors } from "@/theme";
import { styles } from "./MyProfileScreen.styles";
import { api, useGetMyProfileQuery, useGetConnectionsQuery } from "@/api/client";
import { useAppDispatch } from "@/store";
import { logout, setLanguage } from "@/store/sessionSlice";
import { persistLanguage } from "@/utils/language";
import i18n from "@/i18n";
import { supabase } from "@/lib/supabase";
import { signOutSocial } from "@/auth/socialSignIn";
import type { Intent, VerifiedLevel } from "@kompanionki/shared";
import { handleError } from "@/utils/errorHandler";

const intentIcons: Record<Intent, string> = {
  friendship: "💝",
  co_living: "🏠",
  co_parenting: "👨‍👩‍👧",
  co_business: "💼",
  mentorship: "🎓",
  support: "🤝",
};

const verificationBadgeKey: Record<VerifiedLevel, string> = {
  none: "",
  phone: "profile.verifiedPhone",
  selfie: "profile.verifiedSelfie",
  id: "profile.verifiedId",
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
    <Pressable style={({ pressed }) => [styles.settingsItem, pressed && styles.pressed]} onPress={onPress}>
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
    </Pressable>
  );
}

// ─── MyProfileScreen ──────────────────────────────────────────────────────────

const MyProfileScreen = (_props: ProfileScreenProps<"MyProfile">) => {
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

  const handleLanguagePick = useCallback(() => {
    const options = [
      { label: "Українська", lang: "uk" as const },
      { label: "English", lang: "en" as const },
    ];
    Alert.alert(
      t("profile.language"),
      undefined,
      [
        ...options.map(({ label, lang }) => ({
          text: label,
          onPress: async () => {
            await i18n.changeLanguage(lang);
            await persistLanguage(lang);
            dispatch(setLanguage(lang));
          },
        })),
        { text: t("actions.cancel"), style: "cancel" },
      ]
    );
  }, [dispatch, t]);

  const handleLogout = useCallback(() => {
    if (loggingOut) return;
    Alert.alert(
      t("profile.logout"),
      t("profile.logoutConfirmBody"),
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
              handleError(err, { message: t("profile.logoutFailed"), silent: true });
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
          {isNotFound ? t("profile.profileNotCreated") : t("profile.profileLoadFailed")}
        </Text>
        <Text style={styles.errorBody}>
          {isNotFound ? t("profile.profileNotCreatedBody") : t("profile.profileLoadFailedBody")}
        </Text>
        <Pressable
          style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
          onPress={() => refetch()}
        >
          <Text style={styles.retryButtonText}>{t("errors.tryAgain")}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const age = new Date().getFullYear() - profile.birthYear;
  const isVerified = profile.verifiedLevel !== "none";
  const verificationLabelKey = verificationBadgeKey[profile.verifiedLevel];
  const verificationLabel = verificationLabelKey ? t(verificationLabelKey) : "";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Navigation bar */}
      <View style={styles.navBar}>
        <View style={styles.navBarSpacer} />
        <Text style={styles.navBarTitle}>{t("profile.title")}</Text>
        <Pressable style={({ pressed }) => [styles.navBarButton, pressed && styles.pressed]}>
          <Ionicons name="settings-outline" size={22} color={colors.secondary} />
        </Pressable>
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
              <Pressable style={({ pressed }) => [styles.avatarEditButton, pressed && styles.pressed]}>
                <Ionicons name="pencil" size={14} color={colors.textInverse} />
              </Pressable>
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
            {profile.bio || t("profile.bioEmpty")}
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
            label={t("profile.notifications")}
            description={t("profile.notificationsDesc")}
            onPress={() => {}}
          />
          <View style={styles.settingsDivider} />
          <SettingsItem
            icon="lock-closed-outline"
            label={t("profile.privacy")}
            description={t("profile.privacyDesc")}
            onPress={() => {}}
          />
          <View style={styles.settingsDivider} />
          <SettingsItem
            icon="globe-outline"
            label={t("profile.language")}
            description={t("profile.languageName")}
            onPress={handleLanguagePick}
          />
          <View style={styles.settingsDivider} />
          <SettingsItem
            icon="help-circle-outline"
            label={t("profile.help")}
            description={t("profile.helpDesc")}
            onPress={() => {}}
          />
          <View style={styles.settingsDivider} />
          <SettingsItem
            icon="star-outline"
            label={t("profile.rateApp")}
            onPress={() => {}}
          />
        </View>

        {/* Logout */}
        <View style={styles.card}>
          <SettingsItem
            icon="log-out-outline"
            label={loggingOut ? t("profile.loggingOut") : t("profile.logout")}
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


export default MyProfileScreen;
