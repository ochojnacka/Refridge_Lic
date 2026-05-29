import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Reanimated, { ZoomIn } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { ScreenContainer } from "../components/Layout";
import { RootStackParamList } from "../navigation/types";
import { useHeaderConfig } from "../navigation/HeaderContext";
import { COLORS, RADIUS, SHADOW } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "MainMenu">;

function MenuButton({
  label,
  text,
  onPress,
}: {
  label: string;
  text: string;
  onPress: () => void;
}) {
  return (
    <Reanimated.View entering={ZoomIn}>
      <Pressable 
        onPress={onPress} 
        style={({ pressed }) => [styles.menuButton, pressed ? styles.pressed : undefined]}
      >
        <View style={styles.menuButtonLeft}>
          <Text style={styles.menuButtonLabel}>{label}</Text>
          <Text style={styles.menuButtonText}>{text}</Text>
        </View>

        <View style={styles.menuButtonMediaSlot}>
          <Text style={styles.menuButtonMediaPlaceholder}>image</Text>
        </View>
      </Pressable>
    </Reanimated.View>
  );
}

export function MainMenuScreen({ navigation }: Props) {
  const { setConfig } = useHeaderConfig();

  useFocusEffect(
    React.useCallback(() => {
      setConfig({});
    }, [setConfig])
  );

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.buttons}>
        <MenuButton
          label="your fridge"
          text="check and manage ingredients"
          onPress={() => navigation.navigate("YourFridge", { transition: "forward" })}
        />
        <MenuButton
          label="find a recipe"
          text="see what you can cook today"
          onPress={() => navigation.navigate("YourFridge", { transition: "forward" })}
        />
        <MenuButton
          label="saved recipes"
          text="open your favorite picks"
          onPress={() => navigation.navigate("YourFridge", { transition: "forward" })}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  buttons: {
    marginTop: 56,
    gap: 44,
    flexDirection: "column",
    alignItems: "center",
  },
  menuButton: {
    width: 311,
    height: 160,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    ...SHADOW.soft,
  },
  menuButtonLeft: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "stretch",
    overflow: "hidden",
  },
  menuButtonLabel: {
    fontSize: 24,
    lineHeight: 25,
    letterSpacing: 2.4,
    color: COLORS.primary,
    textTransform: "lowercase",
    textAlign: "center",
    fontWeight: "600",
  },
  menuButtonText: {
    marginTop: 10,
    fontSize: 18,
    lineHeight: 22,
    color: COLORS.primary,
    textTransform: "lowercase",
    textAlign: "left",
  },
  menuButtonMediaSlot: {
    width: 120,
    height: 160,
    overflow: "hidden",
    backgroundColor: COLORS.accentStrong,
    alignItems: "center",
    justifyContent: "center",
    borderTopRightRadius: RADIUS.card,
    borderBottomRightRadius: RADIUS.card,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.accent,
  },
  menuButtonMediaPlaceholder: {
    fontSize: 14,
    color: COLORS.white,
    textTransform: "lowercase",
  },
  pressed: {
    opacity: 0.82,
  },
});
