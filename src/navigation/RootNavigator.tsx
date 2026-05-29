import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useState, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator } from "react-native";
import { BarChart3, Lightbulb, Package, User } from "lucide-react-native";
import { AddToFridgeModal } from "../screens/AddToFridgeModal";
import { RecipeModal } from "../screens/RecipeModal";
import { FindRecipeScreen } from "../screens/FindRecipeScreen";
import { LandingScreen } from "../screens/LandingScreen";
import { MainMenuScreen } from "../screens/MainMenuScreen";
import { SavedRecipesScreen } from "../screens/SavedRecipesScreen";
import { YourFridgeScreen } from "../screens/YourFridgeScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { MenuSuggestionsScreen } from "../screens/MenuSuggestionsScreen";
import { InventoryScreen } from "../screens/InventoryScreen";
import { AccountScreen } from "../screens/AccountScreen";
import { RecipeCreationScreen } from "../screens/RecipeCreationScreen";
import { RootStackParamList } from "./types";
import { COLORS } from "../theme";
import { apiClient } from "../api/client";
import { HeaderContext } from "./HeaderContext";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.surface,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.accentStrong,
        tabBarInactiveTintColor: COLORS.surfaceMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: -4,
          textTransform: "lowercase",
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: "dashboard",
          tabBarIcon: ({ color }) => <BarChart3 size={24} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tab.Screen
        name="Suggestions"
        component={MenuSuggestionsScreen}
        options={{
          tabBarLabel: "suggestions",
          tabBarIcon: ({ color }) => <Lightbulb size={24} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarLabel: "inventory",
          tabBarIcon: ({ color }) => <Package size={24} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarLabel: "account",
          tabBarIcon: ({ color }) => <User size={24} color={color} strokeWidth={1.5} />,
        }}
      />
    </Tab.Navigator>
  );
}

interface HeaderConfig {
  title?: string;
  onBack?: () => void;
}

export function RootNavigator() {
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // DEBUG: Clear token on app start to force login every time during development
        await apiClient.clearToken();
        await apiClient.loadToken();
        const hasToken = (apiClient as any).token !== null;
        console.log('[Auth Check] Token found:', hasToken);
        setIsAuthenticated(hasToken);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, []);

  const handleLogin = () => {
    console.log('[RootNavigator] handleLogin called');
    setIsAuthenticated(true);
  };

  if (isCheckingAuth) {
    return (
      <GestureHandlerRootView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.accentStrong} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeaderContext.Provider value={{ config: headerConfig, setConfig: setHeaderConfig }}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName={isAuthenticated ? "MainMenu" : "Login"}
          >
            {/* Auth Screens - Always available */}
            <Stack.Screen
              name="Login"
              options={{ animationEnabled: false }}
            >
              {(props) => <LoginScreen {...props} onLoginSuccess={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />

            {/* App Screens - Always available */}
            <Stack.Screen name="MainMenu" component={MainMenuScreen} />
            <Stack.Screen name="YourFridge" component={TabsNavigator} />
            <Stack.Screen
              name="AddToFridge"
              component={AddToFridgeModal}
              options={{
                presentation: "transparentModal",
                contentStyle: { backgroundColor: "transparent" },
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="RecipeDetails"
              component={RecipeModal}
              options={{
                presentation: "transparentModal",
                contentStyle: { backgroundColor: "transparent" },
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="CreateRecipe"
              component={RecipeCreationScreen}
              options={{
                presentation: "modal",
                headerShown: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </HeaderContext.Provider>
    </GestureHandlerRootView>
  );
}
