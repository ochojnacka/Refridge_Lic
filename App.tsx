import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Text, TextInput } from "react-native";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { AppStateProvider } from "./src/state/AppStateContext";

const DEFAULT_TEXT_STYLE = {
  fontFamily: "SFProDisplayLight",
};

const TextWithDefaults = Text as typeof Text & { defaultProps?: { style?: unknown } };
TextWithDefaults.defaultProps = TextWithDefaults.defaultProps ?? {};
TextWithDefaults.defaultProps.style = [DEFAULT_TEXT_STYLE, TextWithDefaults.defaultProps.style];

const TextInputWithDefaults = TextInput as typeof TextInput & { defaultProps?: { style?: unknown } };
TextInputWithDefaults.defaultProps = TextInputWithDefaults.defaultProps ?? {};
TextInputWithDefaults.defaultProps.style = [DEFAULT_TEXT_STYLE, TextInputWithDefaults.defaultProps.style];

export default function App() {
  const [fontsLoaded] = useFonts({
    SFProDisplayLight: require("./assets/fonts/SFPRODISPLAYLIGHTITALIC.otf"),
    Syne: require("./assets/fonts/Syne-VariableFont_wght.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppStateProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AppStateProvider>
  );
}
