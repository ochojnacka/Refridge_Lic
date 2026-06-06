import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { LogOut, User, Building2, ShieldCheck, AlertCircle } from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';
import { useAccount } from '../hooks/useAccount';

interface AccountScreenProps {
  navigation: any;
  onLogout?: () => void;
}

export function AccountScreen({ navigation, onLogout }: AccountScreenProps) {
  // Cała logika sesji przeniesiona do hooka
  const { userInfo, loading, error, logout, retry } = useAccount();

  const handleLogout = async () => {
    await logout();
    onLogout?.();
    navigation.replace('Login');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Twoje konto" showNotifications={true} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Graceful Degradation - Error Handling */}
        {error && (
          <View style={styles.errorAlert}>
            <AlertCircle size={20} color="#c92a2a" />
            <Text style={styles.errorAlertText}>{error}</Text>
            <TouchableOpacity 
              onPress={() => retry()}
              style={{ backgroundColor: '#c92a2a', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
            >
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>Spróbuj ponownie</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Karta Informacji o Użytkowniku */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainerPrimary}>
              <User size={22} color="#2ecc71" />
            </View>
            <Text style={styles.cardTitle}>Informacje o Użytkowniku</Text>
          </View>

          {userInfo && (
            <View style={styles.cardBody}>
              <View style={styles.dataRow}>
                <Text style={styles.label}>E-mail Firmowy</Text>
                <Text style={styles.value}>{userInfo.email}</Text>
              </View>

              {userInfo.name && (
                <View style={styles.dataRow}>
                  <Text style={styles.label}>Imię i Nazwisko</Text>
                  <Text style={styles.value}>{userInfo.name}</Text>
                </View>
              )}

              {userInfo.role && (
                <View style={styles.dataRow}>
                  <Text style={styles.label}>Rola w systemie</Text>
                  <View style={styles.badge}>
                    <ShieldCheck size={14} color="#27ae60" />
                    <Text style={styles.badgeText}>{userInfo.role}</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Karta Restauracji (Workspace) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainerSecondary}>
              <Building2 size={22} color="#3498db" />
            </View>
            <Text style={styles.cardTitle}>Połączony Workspace</Text>
          </View>
          
          <View style={styles.cardBody}>
            <View style={[styles.dataRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <Text style={styles.label}>ID Restauracji</Text>
              <Text style={styles.valueMono}>{userInfo?.restaurantId || 'Oczekiwanie na połączenie...'}</Text>
            </View>
          </View>
        </View>

        {/* Informacja o systemie */}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>Refridge B2B Engine</Text>
          <Text style={styles.infoBoxText}>
Refridge B2B to innowacyjna platforma do zarządzania marnowaniem żywności w restauracjach. Nasze narzędzie wykorzystuje zaawansowane algorytmy i analizę danych, aby pomóc właścicielom restauracji zidentyfikować obszary, w których można zredukować straty żywności, zoptymalizować zamówienia i zwiększyć rentowność. Dzięki Refridge B2B możesz łatwo monitorować stan zapasów, otrzymywać inteligentne sugestie dotyczące menu i podejmować świadome decyzje biznesowe, które przyniosą korzyści zarówno Twojej restauracji, jak i środowisku.
          </Text>
        </View>

        {/* Przycisk Wyloguj */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut size={20} color="white" />
          <Text style={styles.logoutText}>Wyloguj się</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainerPrimary: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerSecondary: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
  },
  cardBody: {
    gap: 16,
  },
  dataRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
    paddingBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#868e96',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343a40',
  },
  valueMono: {
    fontSize: 14,
    color: '#495057',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#f1f3f5',
    padding: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f8f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#27ae60',
    textTransform: 'capitalize',
  },
  infoBox: {
    backgroundColor: '#e9ecef',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#adb5bd',
  },
  infoBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoBoxText: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: '#fa5252',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#fa5252',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#fa5252',
  },
  errorAlertText: {
    marginLeft: 10,
    color: '#c92a2a',
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
});