import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, User, Building2 } from 'lucide-react-native';
import { apiClient } from '../api/client';

interface AccountScreenProps {
  navigation: any;
  onLogout?: () => void;
}

export function AccountScreen({ navigation, onLogout }: AccountScreenProps) {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      // Get user info from API client
      const token = (apiClient as any).token;
      if (!token) {
        setLoading(false);
        return;
      }

      // Decode JWT to get user info (without verification since we trust our own backend)
      const parts = token.split('.');
      if (parts.length === 3) {
        const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        setUserInfo(decoded);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.clearToken();
      onLogout?.();
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#333' }}>👤 Account</Text>

        {/* User Info Card */}
        <View style={{ backgroundColor: '#f0f9ff', padding: 16, borderRadius: 12, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#2ecc71' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <User size={24} color="#2ecc71" />
            <Text style={{ fontSize: 16, fontWeight: '600', marginLeft: 8, color: '#333' }}>User Information</Text>
          </View>

          {userInfo && (
            <>
              {/* Email */}
              <View style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e0f2fe' }}>
                <Text style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Email</Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>{userInfo.email}</Text>
              </View>

              {/* Name */}
              {userInfo.name && (
                <View style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e0f2fe' }}>
                  <Text style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Name</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>{userInfo.name}</Text>
                </View>
              )}

              {/* Role */}
              {userInfo.role && (
                <View style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e0f2fe' }}>
                  <Text style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Role</Text>
                  <View style={{ backgroundColor: '#e8f8f5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, alignSelf: 'flex-start' }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#27ae60', textTransform: 'capitalize' }}>{userInfo.role}</Text>
                  </View>
                </View>
              )}

              {/* Restaurant ID */}
              {userInfo.restaurantId && (
                <View>
                  <Text style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Restaurant ID</Text>
                  <Text style={{ fontSize: 13, color: '#999', fontFamily: 'monospace' }}>{userInfo.restaurantId}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Restaurant Info Card */}
        <View style={{ backgroundColor: '#f3f9f0', padding: 16, borderRadius: 12, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#27ae60' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Building2 size={24} color="#27ae60" />
            <Text style={{ fontSize: 16, fontWeight: '600', marginLeft: 8, color: '#333' }}>Restaurant Details</Text>
          </View>
          <Text style={{ fontSize: 14, color: '#666' }}>Connected to restaurant {userInfo?.restaurantId?.slice(0, 8)}...</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: '#e74c3c',
            padding: 14,
            borderRadius: 8,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <LogOut size={20} color="white" />
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Logout</Text>
        </TouchableOpacity>

        {/* Info Section */}
        <View style={{ marginTop: 30, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 8 }}>Account Info</Text>
          <Text style={{ fontSize: 12, color: '#999', lineHeight: 18 }}>
            This is your restaurant management account. You can manage inventory, view analytics, and access AI-powered menu suggestions.
          </Text>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
