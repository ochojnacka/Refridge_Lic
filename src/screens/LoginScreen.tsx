import React from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLogin } from '../hooks/useLogin';

interface LoginScreenProps {
  navigation: any;
  onLoginSuccess?: () => void;
}

export function LoginScreen({ navigation, onLoginSuccess }: LoginScreenProps) {
  // Wyciągamy stany i funkcje z naszego custom hooka
  const { email, setEmail, password, setPassword, loading, error, login } = useLogin();

  const handleLogin = async () => {
    const success = await login();
    if (success) {
      onLoginSuccess?.();
      navigation.replace('Tabs'); // Wykonujemy nawigację tylko przy sukcesie
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        
        {/* Branding B2B */}
        <View style={{ marginBottom: 48, alignItems: 'center' }}>
          <Text style={{ fontSize: 36, fontFamily: 'Syne', fontWeight: '800', color: '#2ecc71', marginBottom: 8, letterSpacing: -1 }}>
            Refridge B2B
          </Text>
          <Text style={{ fontSize: 16, color: '#495057', fontWeight: '500', textAlign: 'center' }}>
            Rozwiązanie do zarządzania zapasami i przepisami dla restauracji, pomagające redukować marnowanie żywności i optymalizować koszty.
          </Text>
        </View>

        <View style={{ backgroundColor: '#ffffff', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
          
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#212529', marginBottom: 24 }}>
            Zaloguj się do panelu
          </Text>

          {error && (
            <View style={{ backgroundColor: '#fff5f5', borderLeftWidth: 4, borderLeftColor: '#fa5252', padding: 12, borderRadius: 4, marginBottom: 20 }}>
              <Text style={{ color: '#c92a2a', fontSize: 13, fontWeight: '500' }}>{error}</Text>
            </View>
          )}

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 8, color: '#495057', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              E-mail firmowy
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="np. menedzer@restaurant.com"
              placeholderTextColor="#adb5bd"
              style={{
                borderWidth: 1.5,
                borderColor: '#e9ecef',
                backgroundColor: '#f8f9fa',
                padding: 14,
                borderRadius: 8,
                fontSize: 15,
                color: '#212529',
              }}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 8, color: '#495057', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Hasło
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#adb5bd"
              secureTextEntry
              style={{
                borderWidth: 1.5,
                borderColor: '#e9ecef',
                backgroundColor: '#f8f9fa',
                padding: 14,
                borderRadius: 8,
                fontSize: 15,
                color: '#212529',
              }}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#b2f2bb' : '#2ecc71',
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Zaloguj się</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={{
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
              backgroundColor: '#f8f9fa',
            }}
          >
            <Text style={{ color: '#495057', fontSize: 14, fontWeight: '600' }}>Zarejestruj restaurację</Text>
          </TouchableOpacity>
        </View>

        {/* Demo Credentials dla recenzentów pracy */}
        <View style={{ marginTop: 32, padding: 16, backgroundColor: 'rgba(46, 204, 113, 0.1)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(46, 204, 113, 0.2)' }}>
          <Text style={{ fontSize: 12, color: '#2b8a3e', marginBottom: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Dostęp do Demo:
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, color: '#40c057', fontWeight: '500' }}>Rola: Menedżer</Text>
            <Text style={{ fontSize: 13, color: '#40c057', fontWeight: '500' }}>menedzer@bistro.pl / demo123</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, color: '#40c057', fontWeight: '500' }}>Rola: Szef kuchni</Text>
            <Text style={{ fontSize: 13, color: '#40c057', fontWeight: '500' }}>szef@bistro.pl / demo123</Text>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}