import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { apiClient } from '../api/client';

interface RegisterScreenProps {
  navigation: any;
}

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!email || !password || !name || !restaurantName) {
      setError('All fields are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    const response = await apiClient.register(email, password, name, restaurantName);

    if (response.error) {
      setError(response.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    navigation.replace('Login');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
        >
          <ChevronLeft size={24} color="#333" />
          <Text style={{ fontSize: 16, marginLeft: 8, color: '#333' }}>Back</Text>
        </TouchableOpacity>

        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>Create Account</Text>
          <Text style={{ fontSize: 14, color: '#666' }}>Join Fridge Smart Menu Engine</Text>
        </View>

        {error && (
          <View style={{ backgroundColor: '#fee', padding: 12, borderRadius: 8, marginBottom: 20 }}>
            <Text style={{ color: '#c00', fontSize: 14 }}>{error}</Text>
          </View>
        )}

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>Restaurant Name</Text>
          <TextInput
            value={restaurantName}
            onChangeText={setRestaurantName}
            placeholder="e.g., Bistro Na Rogu"
            placeholderTextColor="#ccc"
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

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>Your Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g., Jan Kowalski"
            placeholderTextColor="#ccc"
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

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
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
          <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Minimum 6 characters</Text>
        </View>

        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#ccc' : '#2ecc71',
            padding: 14,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Create Account</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
