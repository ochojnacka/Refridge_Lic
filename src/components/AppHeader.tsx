import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import { COLORS, RADIUS, SPACING } from "../theme";

interface AppHeaderProps {
  title?: string;
  onBack?: () => void;
}

function ArrowButton({
  kind,
  onPress,
}: {
  kind: "back" | "forward";
  onPress?: () => void;
}) {
  const Icon = kind === "back" ? ArrowLeft : ArrowRight;

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.arrowButton,
        !onPress && styles.arrowButtonDisabled,
        pressed && onPress && styles.arrowButtonPressed,
      ]}
    >
      <Icon
        size={18}
        color={onPress ? COLORS.primary : COLORS.surfaceMuted}
        strokeWidth={2.4}
      />
    </Pressable>
  );
}

function LogoSection() {
  return (
    <View style={styles.logoSection}>
      <Text style={styles.logo}>Refridge</Text>
    </View>
  );
}

function NavigationSection({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <View style={styles.navigationSection}>
      <ArrowButton kind="back" onPress={onBack} />
      <Text style={styles.title}>{title}</Text>
      <View style={styles.arrowSpacer} />
    </View>
  );
}

export function AppHeader({ title, onBack }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      {/* GREEN AREA */}
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <LogoSection />
      </SafeAreaView>

      {/* WHITE AREA BELOW (if navigation exists) */}
      {title ? (
        <NavigationSection title={title} onBack={onBack} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  safeArea: {
    backgroundColor: COLORS.accent,
  },

  logoSection: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 12,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  logo: {
    textAlign: "center",
    fontSize: 64,
    fontFamily: "Syne",
    color: COLORS.white,
    letterSpacing: -5.12,
    lineHeight: 80,
    fontWeight: "700",
  },

  navigationSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },

  arrowButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceMuted,
  },

  arrowButtonDisabled: {
    opacity: 0.4,
  },

  arrowSpacer: {
    width: 38,
    height: 38,
  },

  title: {
    flex: 1,
    fontSize: 24,
    lineHeight: 25,
    letterSpacing: 2.4,
    color: COLORS.primary,
    textTransform: "lowercase",
    textAlign: "center",
    fontWeight: "600",
  },
  arrowButtonPressed: {
    opacity: 0.7,
  },
});