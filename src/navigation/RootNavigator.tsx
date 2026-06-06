import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useState, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View } from "react-native";
import { BarChart3, Lightbulb, Package, User } from "lucide-react-native";

// Auth
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";

// Tabs
import { DashboardScreen } from "../screens/DashboardScreen";
import { MenuSuggestionsScreen } from "../screens/MenuSuggestionsScreen";
import { InventoryScreen } from "../screens/InventoryScreen";
import { AccountScreen } from "../screens/AccountScreen";

// Features
import { WasteLoggingScreen } from "../screens/WasteLoggingScreen";
import { DetailedKPIScreen } from "../screens/DetailedKPIScreen";

import { RootStackParamList } from "./types";
import { COLORS } from "../theme";
import { apiClient } from "../api/client";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e9ecef',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: '#2ecc71',
        tabBarInactiveTintColor: '#adb5bd',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -4,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color }) => <BarChart3 size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Suggestions"
        component={MenuSuggestionsScreen}
        options={{
          tabBarLabel: "Suggestions",
          tabBarIcon: ({ color }) => <Lightbulb size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarLabel: "Inventory",
          tabBarIcon: ({ color }) => <Package size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarLabel: "Account",
          tabBarIcon: ({ color }) => <User size={24} color={color} strokeWidth={2} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
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
    setIsAuthenticated(true);
  };

  if (isCheckingAuth) {
    return (
      <GestureHandlerRootView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName={isAuthenticated ? "Tabs" : "Login"}
        >
          {/* Auth Screens */}
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {(props) => <LoginScreen {...props} onLoginSuccess={handleLogin} />}
          </Stack.Screen>
          <Stack.Screen name="Register" component={RegisterScreen} />

          {/* B2B App Screens */}
          <Stack.Screen name="Tabs" component={TabsNavigator} />
          
          {/* Feature Screens */}
          <Stack.Screen name="WasteLogging" component={WasteLoggingScreen} />
          <Stack.Screen name="DetailedKPI" component={DetailedKPIScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}