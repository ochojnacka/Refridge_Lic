import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { apiClient } from '../api/client';

interface LoginScreenProps {
  navigation: any;
  onLoginSuccess?: () => void;
}

export function LoginScreen({ navigation, onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('manager@bistro.pl');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    console.log('[LoginScreen] Login button pressed');
    
    if (!email || !password) {
      console.log('[LoginScreen] Missing email or password');
      setError('Email and password are required');
      return;
    }

    console.log('[LoginScreen] Attempting login with:', email);
    setLoading(true);
    setError(null);

    const response = await apiClient.login(email, password);
    console.log('[LoginScreen] Login response:', response);

    if (response.error) {
      console.log('[LoginScreen] Login error:', response.error);
      setError(response.error);
      setLoading(false);
      return;
    }

    console.log('[LoginScreen] Login successful, navigating to Dashboard');
    setLoading(false);
    onLoginSuccess?.();
    navigation.replace('Tabs');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center', padding: 20 }}>
        <View style={{ marginBottom: 40 }}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 10 }}>🧊 Fridge</Text>
          <Text style={{ fontSize: 18, color: '#666', marginBottom: 20 }}>Smart Menu Engine</Text>
          <Text style={{ fontSize: 14, color: '#999' }}>For restaurants fighting waste</Text>
        </View>

        {error && (
          <View style={{ backgroundColor: '#fee', padding: 12, borderRadius: 8, marginBottom: 20 }}>
            <Text style={{ color: '#c00', fontSize: 14 }}>{error}</Text>
          </View>
        )}

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="manager@bistro.pl"
            placeholderTextColor="#ccc"
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 12,
              borderRadius: 8,
              fontSize: 16,
            }}
            editable={!loading}
            keyboardType="email-address"
          />
        </View>

        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#ccc"
            secureTextEntry
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 12,
              borderRadius: 8,
              fontSize: 16,
            }}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#ccc' : '#2ecc71',
            padding: 14,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          style={{
            padding: 14,
            borderRadius: 8,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#2ecc71',
          }}
        >
          <Text style={{ color: '#2ecc71', fontSize: 16, fontWeight: '600' }}>Create Account</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 30, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 8, fontWeight: '600' }}>Demo Credentials:</Text>
          <Text style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Email: manager@bistro.pl</Text>
          <Text style={{ fontSize: 12, color: '#999' }}>Password: demo123</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
