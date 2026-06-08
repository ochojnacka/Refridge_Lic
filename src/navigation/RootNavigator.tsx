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
import { apiClient } from "../api/client";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

function TabsNavigator({ route }: any) {
  // Odbieramy rolę ze stosu nawigacji
  const role = route.params?.role || 'Menedzer'; 

  return (
    <Tab.Navigator
      // Szef kuchni nie ma dostępu do Dashboardu, więc zaczyna od razu od Magazynu
      initialRouteName={role === 'Szef kuchni' ? 'Inventory' : 'Dashboard'}
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
      {/* Karta widoczna TYLKO dla ról innych niż Szef kuchni */}
      {role !== 'Szef kuchni' && (
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarLabel: "Dashboard",
            tabBarIcon: ({ color }) => <BarChart3 size={24} color={color} strokeWidth={2} />,
          }}
        />
      )}
      
      <Tab.Screen
        name="Suggestions"
        component={MenuSuggestionsScreen}
        options={{
          tabBarLabel: "Sugestie",
          tabBarIcon: ({ color }) => <Lightbulb size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarLabel: "Magazyn",
          tabBarIcon: ({ color }) => <Package size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarLabel: "Konto",
          tabBarIcon: ({ color }) => <User size={24} color={color} strokeWidth={2} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        await apiClient.loadToken();
        const token = (apiClient as any).token;
        
        if (token) {
          // Dekodowanie JWT w celu wyciągnięcia roli (bez pytania serwera)
          const parts = token.split('.');
          if (parts.length === 3) {
            const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const decoded = JSON.parse(atob(base64));
            setUserRole(decoded.role);
          }
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Błąd autoryzacji:', error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, []);

  // Odbieranie roli podczas pomyślnego logowania
  const handleLogin = (role?: string) => {
    if (role) setUserRole(role);
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
          <Stack.Screen 
            name="Tabs" 
            component={TabsNavigator} 
            initialParams={{ role: userRole }} // Przekazanie roli w głąb nawigacji
          />
          
          {/* Feature Screens */}
          <Stack.Screen name="WasteLogging" component={WasteLoggingScreen} />
          
          {/* Twarde odcięcie ekranu KPI dla Szefa kuchni */}
          {userRole !== 'Szef kuchni' && (
            <Stack.Screen name="DetailedKPI" component={DetailedKPIScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}