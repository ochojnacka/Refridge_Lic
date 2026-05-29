import React, { createContext, useContext, useCallback } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";

export type ScreenInFlow = "MainMenu" | "YourFridge" | "FindRecipe" | "SavedRecipes";

const SCREEN_FLOW: ScreenInFlow[] = ["MainMenu", "YourFridge", "FindRecipe", "SavedRecipes"];

interface NavFlowContextValue {
  currentScreen: ScreenInFlow;
  goToNextInFlow: () => void;
  goToPrevInFlow: () => void;
  goToScreenInFlow: (screen: ScreenInFlow) => void;
  setCurrentScreen: (screen: ScreenInFlow) => void;
}

const NavFlowContext = createContext<NavFlowContextValue | undefined>(undefined);

export function NavFlowProvider({ children }: { children: React.ReactNode }) {
  const [currentScreen, setCurrentScreen] = React.useState<ScreenInFlow>("MainMenu");
  const navigation = React.useRef<NativeStackNavigationProp<RootStackParamList, keyof RootStackParamList> | null>(null);

  const goToNextInFlow = useCallback(() => {
    const currentIndex = SCREEN_FLOW.indexOf(currentScreen);
    if (currentIndex < SCREEN_FLOW.length - 1) {
      const nextScreen = SCREEN_FLOW[currentIndex + 1];
      setCurrentScreen(nextScreen);
      if (navigation.current) {
        navigation.current.navigate(nextScreen as never);
      }
    }
  }, [currentScreen]);

  const goToPrevInFlow = useCallback(() => {
    const currentIndex = SCREEN_FLOW.indexOf(currentScreen);
    if (currentIndex > 0) {
      const prevScreen = SCREEN_FLOW[currentIndex - 1];
      setCurrentScreen(prevScreen);
      if (navigation.current) {
        navigation.current.navigate(prevScreen as never);
      }
    }
  }, [currentScreen]);

  const goToScreenInFlow = useCallback((screen: ScreenInFlow) => {
    setCurrentScreen(screen);
    if (navigation.current) {
      navigation.current.navigate(screen as never);
    }
  }, []);

  const value: NavFlowContextValue = {
    currentScreen,
    goToNextInFlow,
    goToPrevInFlow,
    goToScreenInFlow,
    setCurrentScreen,
  };

  return <NavFlowContext.Provider value={value}>{children}</NavFlowContext.Provider>;
}

export function useNavFlow() {
  const context = useContext(NavFlowContext);
  if (!context) {
    throw new Error("useNavFlow must be used inside NavFlowProvider");
  }
  return context;
}

export function setNavFlowRef(ref: NativeStackNavigationProp<RootStackParamList, keyof RootStackParamList>) {
  // This will be set from RootNavigator
  const context = useContext(NavFlowContext);
  if (context) {
    (context as any).navigationRef = ref;
  }
}
