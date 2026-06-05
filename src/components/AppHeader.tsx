import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArrowLeft, Bell } from "lucide-react-native";
import { COLORS } from "../theme";
import { RootStackParamList } from "../navigation/types";

interface AppHeaderProps {
  title?: string;
  onBack?: () => void;
  showNotifications?: boolean;
  onNotificationsPress?: () => void;
}

export function AppHeader({ 
  title, 
  onBack, 
  showNotifications = true, 
  onNotificationsPress 
}: AppHeaderProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleNotificationsPress = () => {
    if (onNotificationsPress) {
      onNotificationsPress();
    } else {
      navigation.navigate("Alerts");
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Lewa strona */}
        <View style={styles.leftSection}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              style={({ pressed }) => [styles.iconButton, pressed && styles.buttonPressed]}
            >
              <ArrowLeft size={22} color={COLORS.primary} strokeWidth={2.5} />
            </Pressable>
          ) : (
            <Text style={styles.logo}>Refridge B2B</Text>
          )}
        </View>

        {/* Środek */}
        <View style={styles.centerSection}>
          {title && <Text style={styles.title} numberOfLines={1}>{title}</Text>}
        </View>

        {/* Prawa strona */}
        <View style={styles.rightSection}>
          {showNotifications ? (
            <Pressable 
              onPress={handleNotificationsPress}
              style={({ pressed }) => [styles.iconButton, pressed && styles.buttonPressed]}
            >
              <Bell size={20} color={COLORS.primary} strokeWidth={2} />
              <View style={styles.badge} />
            </Pressable>
          ) : (
            <View style={styles.iconButtonSpacer} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background, 
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftSection: { flex: 1, alignItems: 'flex-start', justifyContent: 'center' },
  centerSection: { flex: 2, alignItems: 'center', justifyContent: 'center' },
  rightSection: { flex: 1, alignItems: 'flex-end', justifyContent: 'center' },
  logo: { fontSize: 20, fontFamily: "Syne", color: COLORS.primary, fontWeight: "700" },
  title: { fontSize: 16, color: '#333', fontWeight: "600" },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  iconButtonSpacer: { width: 40 },
  buttonPressed: { opacity: 0.6, transform: [{ scale: 0.96 }] },
  badge: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e74c3c',
    borderWidth: 1.5,
    borderColor: COLORS.background,
  }
});