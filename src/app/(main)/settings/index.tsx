import { useUserStore } from "@/store/user.store";
import { COLORS, fonts, SETTINGS_COLORS } from "@/utils/styles";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useMemo } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  LINKS_SETTINGS,
  SECTION_CONFIG,
  SECTION_ORDER,
  type SettingsLink,
  type SettingsSection,
} from "@/utils/links";

// ─────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────

const ICONS = {
  user: "account-outline",
  lock: "lock-outline",
  "shopping-bag": "storefront-outline",
  "map-pin": "map-marker-outline",
  users: "account-group-outline",

  coffee: "cup-outline",
  package: "fruit-grapes-outline",
  box: "package-variant-closed",

  activity: "chart-line",
  archive: "archive-outline",
  truck: "truck-outline",
  "alert-triangle": "alert-circle-outline",

  star: "star-outline",

  bell: "bell-outline",
  sliders: "tune-variant",
} as const;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function formatName(name?: string | null) {
  if (!name) return "Utilisateur";

  return name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getRoleLabel(role?: string) {
  switch (role) {
    case "MANAGER":
      return "Manager";

    case "EMPLOYEE":
      return "Employé";

    case "ADMIN":
      return "Administrateur";

    default:
      return "Utilisateur";
  }
}

function getInitials(name?: string | null) {
  if (!name) return "U";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ─────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────

export default function SettingsScreen() {
  const user = useUserStore((state) => state.user);

  const userRole = user?.role ?? "EMPLOYEE";

  const sections = useMemo(() => {
    const visibleLinks = LINKS_SETTINGS.filter((link) =>
      link.roles.includes(userRole),
    );

    return SECTION_ORDER.map((section) => {
      const links = visibleLinks.filter((link) => link.section === section);

      return {
        section,
        links,
      };
    }).filter((item) => item.links.length > 0);
  }, [userRole]);

  const handlePress = (link: SettingsLink) => {
    router.push(link.value as never);
  };

  const displayName = formatName(user?.name);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* ─────────────────────────────── */}
          {/* HEADER */}
          {/* ─────────────────────────────── */}

          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerEyebrow}>JARDIN PRO</Text>

              <Text style={styles.headerTitle}>Paramètres</Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.pressed,
              ]}
              // onPress={() => router.push("/settings/preferences")}
            >
              <MaterialCommunityIcons
                name="cog-outline"
                size={23}
                color={COLORS.primary}
              />
            </Pressable>
          </View>

          {/* ─────────────────────────────── */}
          {/* PROFILE */}
          {/* ─────────────────────────────── */}

          <Pressable
            style={({ pressed }) => [
              styles.profileCard,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push("/settings/profile")}
          >
            <View style={styles.profileAvatarContainer}>
              {user?.image ? (
                <Image
                  source={{ uri: user.image }}
                  style={styles.profileAvatar}
                />
              ) : (
                <View style={styles.profileAvatarFallback}>
                  <Text style={styles.profileInitials}>
                    {getInitials(user?.name)}
                  </Text>
                </View>
              )}

              <View style={styles.statusDot} />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>
                {displayName}
              </Text>

              <View style={styles.profileMeta}>
                <View style={styles.roleBadge}>
                  <MaterialCommunityIcons
                    name="shield-check-outline"
                    size={13}
                    color={COLORS.primary}
                  />

                  <Text style={styles.roleText}>
                    {getRoleLabel(user?.role)}
                  </Text>
                </View>

                {user?.telephone ? (
                  <Text style={styles.profilePhone} numberOfLines={1}>
                    {user.telephone}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={styles.profileChevron}>
              <MaterialCommunityIcons
                name="arrow-top-right"
                size={19}
                color={COLORS.primary}
              />
            </View>
          </Pressable>

          {/* ─────────────────────────────── */}
          {/* SETTINGS */}
          {/* ─────────────────────────────── */}

          <View style={styles.sectionsContainer}>
            {sections.map(({ section, links }) => (
              <SettingsSectionView
                key={section}
                section={section}
                links={links}
                onPress={handlePress}
              />
            ))}
          </View>

          {/* ─────────────────────────────── */}
          {/* FOOTER */}
          {/* ─────────────────────────────── */}

          <View style={styles.footer}>
            <View style={styles.footerBrand}>
              <View style={styles.footerLogo}>
                <Text style={styles.footerLogoText}>J</Text>
              </View>

              <View>
                <Text style={styles.footerAppName}>Jardin Pro</Text>

                <Text style={styles.footerTagline}>
                  Gestion simple de votre activité
                </Text>
              </View>
            </View>

            <Text style={styles.footerVersion}>Version 1.0.0</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// SECTION
// ─────────────────────────────────────────────

type SettingsSectionViewProps = {
  section: SettingsSection;
  links: SettingsLink[];
  onPress: (link: SettingsLink) => void;
};

function SettingsSectionView({
  section,
  links,
  onPress,
}: SettingsSectionViewProps) {
  const config = SECTION_CONFIG[section];
  const colors = SETTINGS_COLORS[section];

  return (
    <View style={styles.section}>
      {/* SECTION HEADER */}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{config.title}</Text>

        <Text style={styles.sectionDescription}>{config.description}</Text>
      </View>

      {/* SETTINGS */}

      <View style={styles.linksContainer}>
        {links.map((link, index) => {
          const iconName =
            ICONS[link.icon as keyof typeof ICONS] ?? "circle-outline";

          const isLast = index === links.length - 1;

          return (
            <Pressable
              key={link.value}
              onPress={() => onPress(link)}
              style={({ pressed }) => [
                styles.settingItem,
                !isLast && styles.settingItemBorder,
                pressed && styles.settingPressed,
              ]}
            >
              {/* ICON */}

              <View
                style={[
                  styles.settingIcon,
                  {
                    backgroundColor: colors.background,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={iconName}
                  size={21}
                  color={colors.icon}
                />
              </View>

              {/* CONTENT */}

              <View style={styles.settingContent}>
                <Text style={styles.settingLabel} numberOfLines={1}>
                  {link.label}
                </Text>

                {link.description ? (
                  <Text style={styles.settingDescription} numberOfLines={1}>
                    {link.description}
                  </Text>
                ) : null}
              </View>

              {/* CHEVRON */}

              <MaterialCommunityIcons
                name="chevron-right"
                size={21}
                color="#B5B5B5"
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  contentContainer: {
    paddingHorizontal: 18,

    // Bottom tab absolute
    paddingBottom: 125,
  },

  // ─────────────────────────────────────────
  // HEADER
  // ─────────────────────────────────────────

  header: {
    paddingTop: 8,
    paddingBottom: 22,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTextContainer: {
    flex: 1,
  },

  headerEyebrow: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: COLORS.primary,

    marginBottom: 4,
  },

  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 34,
    color: COLORS.text,
  },

  headerButton: {
    width: 46,
    height: 46,
    borderRadius: 16,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: "#EAEAE6",

    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  // ─────────────────────────────────────────
  // PROFILE
  // ─────────────────────────────────────────

  profileCard: {
    minHeight: 96,

    padding: 13,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: COLORS.primary,

    borderRadius: 22,

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 3,
  },

  profileAvatarContainer: {
    position: "relative",
  },

  profileAvatar: {
    width: 67,
    height: 67,

    borderRadius: 21,

    backgroundColor: COLORS.white,

    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)",
  },

  profileAvatarFallback: {
    width: 67,
    height: 67,

    borderRadius: 21,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(255,255,255,0.18)",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },

  profileInitials: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: COLORS.white,
  },

  statusDot: {
    position: "absolute",

    right: -1,
    bottom: -1,

    width: 16,
    height: 16,

    borderRadius: 8,

    backgroundColor: COLORS.success,

    borderWidth: 3,
    borderColor: COLORS.primary,
  },

  profileInfo: {
    flex: 1,
    minWidth: 0,

    marginLeft: 13,
  },

  profileName: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: COLORS.white,

    marginBottom: 6,
  },

  profileMeta: {
    flexDirection: "row",
    alignItems: "center",

    gap: 8,
  },

  roleBadge: {
    flexDirection: "row",
    alignItems: "center",

    gap: 4,

    paddingHorizontal: 8,
    paddingVertical: 4,

    borderRadius: 8,

    backgroundColor: "rgba(255,255,255,0.16)",
  },

  roleText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.white,
  },

  profilePhone: {
    flex: 1,

    fontFamily: fonts.regular,
    fontSize: 11,

    color: "rgba(255,255,255,0.72)",
  },

  profileChevron: {
    width: 36,
    height: 36,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: COLORS.white,
  },

  // ─────────────────────────────────────────
  // SECTIONS
  // ─────────────────────────────────────────

  sectionsContainer: {
    marginTop: 30,
  },

  section: {
    marginBottom: 26,
  },

  sectionHeader: {
    paddingHorizontal: 2,

    marginBottom: 11,
  },

  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: COLORS.text,

    marginBottom: 3,
  },

  sectionDescription: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: COLORS.Gray,
  },

  // ─────────────────────────────────────────
  // LINKS
  // ─────────────────────────────────────────

  linksContainer: {
    backgroundColor: COLORS.white,

    borderRadius: 20,

    overflow: "hidden",

    borderWidth: 1,
    borderColor: "#EAEAE6",
  },

  settingItem: {
    minHeight: 70,

    paddingHorizontal: 13,
    paddingVertical: 10,

    flexDirection: "row",
    alignItems: "center",
  },

  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1EE",
  },

  settingIcon: {
    width: 44,
    height: 44,

    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  settingContent: {
    flex: 1,
    minWidth: 0,

    paddingRight: 8,
  },

  settingLabel: {
    fontFamily: fonts.semibold,
    fontSize: 14,

    color: COLORS.text,

    marginBottom: 3,
  },

  settingDescription: {
    fontFamily: fonts.regular,
    fontSize: 11,

    color: COLORS.Gray,
  },

  settingPressed: {
    backgroundColor: "#FAFAF8",
  },

  pressed: {
    opacity: 0.8,
  },

  // ─────────────────────────────────────────
  // FOOTER
  // ─────────────────────────────────────────

  footer: {
    marginTop: 4,

    paddingTop: 8,
    paddingBottom: 10,

    alignItems: "center",
  },

  footerBrand: {
    flexDirection: "row",
    alignItems: "center",
  },

  footerLogo: {
    width: 39,
    height: 39,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: COLORS.primary,

    marginRight: 9,
  },

  footerLogoText: {
    fontFamily: fonts.bold,
    fontSize: 19,
    color: COLORS.white,
  },

  footerAppName: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    color: COLORS.text,
  },

  footerTagline: {
    fontFamily: fonts.regular,
    fontSize: 10,

    color: COLORS.Gray,

    marginTop: 2,
  },

  footerVersion: {
    fontFamily: fonts.medium,
    fontSize: 10,

    color: COLORS.Gray,

    marginTop: 9,
  },
});
