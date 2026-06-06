import React from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRegister } from '../hooks/useRegister';

interface RegisterScreenProps {
  navigation: any;
}

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const {
    email, setEmail,
    password, setPassword,
    name, setName,
    restaurantName, setRestaurantName,
    loading, error, register
  } = useRegister();

  const handleRegister = async () => {
    const success = await register();
    if (success) {
      navigation.replace('Login');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40 }}>
        
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32, alignSelf: 'flex-start' }}
        >
          <View style={{ backgroundColor: '#ffffff', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 }}>
            <ChevronLeft size={20} color="#495057" />
          </View>
          <Text style={{ fontSize: 15, marginLeft: 12, color: '#495057', fontWeight: '600' }}>Wróć do logowania</Text>
        </TouchableOpacity>

        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#212529', marginBottom: 8 }}>Zarejestruj się</Text>
          <Text style={{ fontSize: 15, color: '#6c757d', lineHeight: 22 }}>
            Dołącz do Refridge B2B i zacznij kontrolować marnowanie żywności w swojej restauracji już dziś!
          </Text>
        </View>

        <View style={{ backgroundColor: '#ffffff', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
          
          {error && (
            <View style={{ backgroundColor: '#fff5f5', borderLeftWidth: 4, borderLeftColor: '#fa5252', padding: 12, borderRadius: 4, marginBottom: 20 }}>
              <Text style={{ color: '#c92a2a', fontSize: 13, fontWeight: '500' }}>{error}</Text>
            </View>
          )}

          {[
            { label: 'Nazwa restauracji', value: restaurantName, setter: setRestaurantName, placeholder: 'np. Bistro Na Rogu' },
            { label: 'Imię i nazwisko', value: name, setter: setName, placeholder: 'np. Jan Kowalski' },
            { label: 'Email firmowy', value: email, setter: setEmail, placeholder: 'np. menedżer@restauracja.com', keyboard: 'email-address' as const },
          ].map((field, index) => (
            <View key={index} style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 8, color: '#495057', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {field.label}
              </Text>
              <TextInput
                value={field.value}
                onChangeText={field.setter}
                placeholder={field.placeholder}
                placeholderTextColor="#adb5bd"
                keyboardType={field.keyboard || 'default'}
                autoCapitalize={field.keyboard === 'email-address' ? 'none' : 'sentences'}
                style={{ borderWidth: 1.5, borderColor: '#e9ecef', backgroundColor: '#f8f9fa', padding: 14, borderRadius: 8, fontSize: 15, color: '#212529' }}
                editable={!loading}
              />
            </View>
          ))}

          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 8, color: '#495057', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Hasło
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#adb5bd"
              secureTextEntry
              style={{ borderWidth: 1.5, borderColor: '#e9ecef', backgroundColor: '#f8f9fa', padding: 14, borderRadius: 8, fontSize: 15, color: '#212529' }}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={{ backgroundColor: loading ? '#b2f2bb' : '#2ecc71', padding: 16, borderRadius: 8, alignItems: 'center' }}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Zarejestruj się</Text>}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}