import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useState, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator } from "react-native";
import { BarChart3, Lightbulb, Package, User } from "lucide-react-native";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { MenuSuggestionsScreen } from "../screens/MenuSuggestionsScreen";
import { InventoryScreen } from "../screens/InventoryScreen";
import { AccountScreen } from "../screens/AccountScreen";
import { WasteLoggingScreen } from "../screens/WasteLoggingScreen";
import { RootStackParamList } from "./types";
import { COLORS } from "../theme";
import { apiClient } from "../api/client";
import { HeaderContext } from "./HeaderContextProvider";

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
            initialRouteName={isAuthenticated ? "Tabs" : "Login"}
          >
            {/* Auth Screens - Always available */}
            <Stack.Screen
              name="Login"
              options={{ headerShown: false }}
            >
              {(props) => <LoginScreen {...props} onLoginSuccess={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />

            {/* B2B App Screens - When authenticated */}
            <Stack.Screen name="Tabs" component={TabsNavigator} />
            <Stack.Screen name="WasteLogging" component={WasteLoggingScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </HeaderContext.Provider>
    </GestureHandlerRootView>
  );
}
