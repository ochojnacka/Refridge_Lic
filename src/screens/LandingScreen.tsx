import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet } from "react-native";
import { Text, View, Pressable } from "react-native";
import { ArrowRight } from "lucide-react-native";
import Animated, { FadeInDown, BounceInDown, ZoomIn } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { ScreenContainer } from "../components/Layout";
import { RootStackParamList } from "../navigation/types";
import { useHeaderConfig } from "../navigation/HeaderContext";
import { COLORS, RADIUS } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Landing">;

export function LandingScreen({ navigation }: Props) {
  const { setConfig } = useHeaderConfig();

  useFocusEffect(
    React.useCallback(() => {
      setConfig({});
    }, [setConfig])
  );

  return (
    <ScreenContainer scroll={false}>
      <Animated.View entering={FadeInDown.delay(100)}>
        <Text style={styles.title}>Hi!</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200)}>
        <Text style={styles.subtitle}>feeling hungry?</Text>
      </Animated.View>

      <Animated.View entering={BounceInDown.delay(400)}>
        <Pressable
          onPress={() => navigation.navigate("MainMenu", { transition: "forward" })}
          style={({ pressed }) => [
            styles.ctaContainer,
            pressed && styles.ctaPressed,
          ]}
        >
          <View style={styles.ctaRow}>
            <View style={styles.cta}>
              <Text style={styles.ctaText}>
                what can i cook today?
              </Text>
            </View>

            <View style={styles.ctaIcon}>
              <ArrowRight color="#262626" size={22} />
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 244,
    fontSize: 34,
    lineHeight: 40,
    color: COLORS.primary,
    fontWeight: "700",
    width: 272,
  },
  subtitle: {
    marginTop: 20,
    marginBottom: 140,
    fontSize: 34,
    lineHeight: 40,
    color: COLORS.primary,
    width: 272,
  },
  ctaContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cta: {
    width: 272,
    height: 62,
    backgroundColor: COLORS.accentStrong,
    borderRadius: RADIUS.pill,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaText: {
    color: COLORS.white,
    fontSize: 20,
    textTransform: "lowercase",
    textAlign: "center",
  },
  ctaIcon: {
    flex: 0,
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaPressed: {
    opacity: 0.84,
  },
});