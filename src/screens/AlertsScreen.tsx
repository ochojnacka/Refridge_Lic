import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { API_BASE_URL } from '../api/client';
import { io } from 'socket.io-client';
import { Bell, AlertTriangle, CheckCircle, Info, Trash2 } from 'lucide-react-native';

import { AppHeader } from '../components/AppHeader';
import { RootStackParamList } from '../navigation/types';

const socket = io(API_BASE_URL);

interface AlertItem {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success';
  timestamp: string;
}

type Props = NativeStackScreenProps<RootStackParamList, 'Alerts'>;

export function AlertsScreen({ navigation }: Props) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    socket.on('waste:logged', (data) => {
      const newAlert: AlertItem = {
        id: Date.now().toString(),
        title: 'Zarejestrowano stratę',
        message: `Zgłoszono stratę: ${data.amount} ${data.unit}, ${data.type}`,
        type: 'warning',
        timestamp: new Date().toLocaleTimeString(),
      };
      setAlerts((prev) => [newAlert, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const clearAlerts = () => setAlerts([]);

  return (
    <View style={styles.container}>
      <AppHeader title="Powiadomienia" onBack={() => navigation.goBack()} />

      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} />}
      >
        <View style={styles.actionRow}>
          <Text style={styles.sectionTitle}>Powiadomienia</Text>
          {alerts.length > 0 && (
            <TouchableOpacity onPress={clearAlerts} style={styles.clearButton}>
              <Trash2 size={16} color="#fa5252" />
              <Text style={styles.clearText}>Wyczyść</Text>
            </TouchableOpacity>
          )}
        </View>

        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={48} color="#dee2e6" />
            <Text style={styles.emptyStateText}>Brak aktywnych powiadomień</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {alerts.map((alert) => (
              <View key={alert.id} style={[styles.alertCard, styles[`alert${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}` as keyof typeof styles]]}>
                <View style={styles.iconBox}>
                  {alert.type === 'warning' && <AlertTriangle size={20} color="#f08c00" />}
                  {alert.type === 'info' && <Info size={20} color="#339af0" />}
                  {alert.type === 'success' && <CheckCircle size={20} color="#51cf66" />}
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  <Text style={styles.alertTime}>{alert.timestamp}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  scrollContainer: { 
    flex: 1 
  },
  content: { 
    padding: 20 
  },
  actionRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#212529' 
  },
  clearButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  clearText: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#fa5252' 
  },
  emptyState: { 
    alignItems: 'center', 
    marginTop: 100, 
    gap: 12 
  },
  emptyStateText: { 
    fontSize: 15, 
    color: '#adb5bd', 
    fontWeight: '500' 
  },
  list: { 
    gap: 12 
  },
  alertCard: { 
    flexDirection: 'row', 
    backgroundColor: '#ffffff', 
    padding: 16, 
    borderRadius: 12, 
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 
  },
  alertWarning: { 
    borderLeftColor: '#f08c00' 
  },
  alertInfo: { 
    borderLeftColor: '#339af0' 
  },
  alertSuccess: { 
    borderLeftColor: '#51cf66' 
  },
  iconBox: { 
    marginRight: 12, 
    paddingTop: 2 
  },
  alertContent: { 
    flex: 1 
  },
  alertTitle: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#212529', 
    marginBottom: 4 
  },
  alertMessage: { 
    fontSize: 14, 
    color: '#495057', 
    marginBottom: 4, 
    lineHeight: 20 
  },
  alertTime: { 
    fontSize: 12, 
    color: '#868e96', 
    fontWeight: '500' 
  },
});