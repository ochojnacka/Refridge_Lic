import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Platform, Modal, TextInput, Alert } from 'react-native';
import { LogOut, User, Building2, ShieldCheck, AlertCircle, Users, UserPlus, ChevronDown, Edit2, Trash2 } from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';
import { useAccount } from '../hooks/useAccount';

interface AccountScreenProps {
  navigation: any;
  onLogout?: () => void;
}

export function AccountScreen({ navigation, onLogout }: AccountScreenProps) {
  // Pobieramy również restaurantInfo z hooka
  const { userInfo, restaurantInfo, employees, loading, error, logout, addEmployee, updateProfile, updateRestaurant, deleteEmployee, retry } = useAccount();
  
  const [employeeModalVisible, setEmployeeModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [restaurantModalVisible, setRestaurantModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', password: '', role: 'Szef kuchni' });
  const [showRolePicker, setShowRolePicker] = useState(false);
  
  const [editProfileData, setEditProfileData] = useState({ name: '', email: '' });
  const [editRestaurantData, setEditRestaurantData] = useState({ name: '', city: '', seats: '', avgCoversPerDay: '', description: '' });

  // FUNKCJA: Otwiera modal profilu i bezpiecznie wstrzykuje aktualne dane
  const openProfileModal = () => {
    setEditProfileData({
      name: userInfo?.name || '',
      email: userInfo?.email || '',
    });
    setProfileModalVisible(true);
  };

  // FUNKCJA: Otwiera modal restauracji i bezpiecznie wstrzykuje aktualne dane z bazy
  const openRestaurantModal = () => {
    setEditRestaurantData({
      name: restaurantInfo?.name || '',
      city: restaurantInfo?.city || '',
      seats: restaurantInfo?.seats ? String(restaurantInfo.seats) : '',
      avgCoversPerDay: restaurantInfo?.avgCoversPerDay ? String(restaurantInfo.avgCoversPerDay) : '',
      description: restaurantInfo?.description || '',
    });
    setRestaurantModalVisible(true);
  };

  // Inicjalizacja danych edycji po załadowaniu profilu
  useEffect(() => {
    if (userInfo) {
      setEditProfileData({ name: userInfo.name || '', email: userInfo.email || '' });
    }
  }, [userInfo]);

  const handleLogout = async () => {
    await logout();
    onLogout?.();
    navigation.replace('Login');
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.password) return;
    setIsSubmitting(true);
    const success = await addEmployee(newEmployee.email, newEmployee.password, newEmployee.name, newEmployee.role);
    setIsSubmitting(false);
    if (success) {
      setEmployeeModalVisible(false);
      setNewEmployee({ name: '', email: '', password: '', role: 'Szef kuchni' });
    }
  };

  const handleUpdateProfile = async () => {
    if (!editProfileData.name || !editProfileData.email) return;
    setIsSubmitting(true);
    const success = await updateProfile(editProfileData.name, editProfileData.email);
    setIsSubmitting(false);
    if (success) setProfileModalVisible(false);
  };

  const handleUpdateRestaurant = async () => {
    if (!editRestaurantData.name) return;
    setIsSubmitting(true);
    const success = await updateRestaurant(
      editRestaurantData.name,
      editRestaurantData.city,
      parseInt(editRestaurantData.seats || '0'),
      parseInt(editRestaurantData.avgCoversPerDay || '0'),
      editRestaurantData.description
    );
    setIsSubmitting(false);
    if (success) setRestaurantModalVisible(false);
  };

  const confirmDeleteEmployee = (emp: any) => {
    Alert.alert(
      'Usuwanie pracownika',
      `Czy na pewno chcesz cofnąć uprawnienia i usunąć konto użytkownika:\n${emp.name} (${emp.role})?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        { 
          text: 'Usuń konto', 
          style: 'destructive', 
          onPress: () => deleteEmployee(emp.id) 
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  const isManager = userInfo?.role === 'Menedzer' || userInfo?.role === 'Administrator';

  return (
    <View style={styles.container}>
      <AppHeader title="Twoje konto" showNotifications={true} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {error && (
          <View style={styles.errorAlert}>
            <AlertCircle size={20} color="#c92a2a" />
            <Text style={styles.errorAlertText}>{error}</Text>
            <TouchableOpacity onPress={() => retry()} style={{ backgroundColor: '#c92a2a', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>Ponów</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Karta Informacji o Użytkowniku */}
        <View style={styles.card}>
          <View style={[styles.cardHeader, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.iconContainerPrimary}>
                <User size={22} color="#2ecc71" />
              </View>
              <Text style={styles.cardTitle}>Twój Profil</Text>
            </View>
            <TouchableOpacity onPress={() => openProfileModal()} style={styles.editIconBtn}>
              <Edit2 size={16} color="#6c757d" />
            </TouchableOpacity>
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
                <View style={[styles.dataRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
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

        {/* SEKCJA DLA MENEDŻERA: Zarządzanie załogą */}
        {isManager && (
          <View style={styles.card}>
            <View style={[styles.cardHeader, { justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.iconContainerSecondary}>
                  <Users size={22} color="#3498db" />
                </View>
                <Text style={styles.cardTitle}>Załoga restauracji</Text>
              </View>
              <TouchableOpacity onPress={() => setEmployeeModalVisible(true)} style={styles.addButton}>
                <UserPlus size={16} color="white" />
                <Text style={styles.addButtonText}>Dodaj</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.cardBody}>
              {employees.length === 1 ? (
                <Text style={{ color: '#868e96', fontSize: 14 }}>Jesteś jedynym użytkownikiem w tej restauracji. Dodaj pracowników!</Text>
              ) : (
                employees.filter(emp => emp.id !== userInfo.id).map((emp, index) => (
                  <View key={emp.id} style={styles.employeeRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.employeeName}>{emp.name}</Text>
                      <Text style={styles.employeeEmail}>{emp.email}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={styles.employeeBadge}>
                        <Text style={styles.employeeBadgeText}>{emp.role}</Text>
                      </View>
                      <TouchableOpacity onPress={() => confirmDeleteEmployee(emp)} style={{ padding: 4 }}>
                        <Trash2 size={16} color="#fa5252" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* Karta Restauracji */}
        <View style={styles.card}>
          <View style={[styles.cardHeader, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.iconContainerSecondary, { backgroundColor: 'rgba(243, 156, 18, 0.1)' }]}>
                <Building2 size={22} color="#f39c12" />
              </View>
              <Text style={styles.cardTitle}>{restaurantInfo?.name || 'Twoja Restauracja'}</Text>
            </View>
            {isManager && (
              <TouchableOpacity onPress={openRestaurantModal} style={styles.editIconBtn}>
                <Edit2 size={16} color="#6c757d" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.cardBody}>
            {restaurantInfo?.city && (
              <View style={styles.dataRow}>
                <Text style={styles.label}>Lokalizacja</Text>
                <Text style={styles.value}>{restaurantInfo.city}</Text>
              </View>
            )}
            <View style={styles.dataRow}>
              <Text style={styles.label}>ID Restauracji (Workspace ID)</Text>
              <Text style={styles.valueMono}>{userInfo?.restaurantId || 'Brak danych'}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut size={20} color="white" />
          <Text style={styles.logoutText}>Wyloguj się</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* MODAL 1: Dodawanie pracownika */}
      <Modal visible={employeeModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Stwórz konto pracownika</Text>
              <Text style={styles.modalSubtitle}>Konto zostanie automatycznie przypisane do Twojej restauracji.</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Imię i Nazwisko *</Text>
                <TextInput value={newEmployee.name} onChangeText={(text) => setNewEmployee({ ...newEmployee, name: text })} placeholder="Jan Kowalski" style={styles.textInput} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Adres E-mail *</Text>
                <TextInput value={newEmployee.email} onChangeText={(text) => setNewEmployee({ ...newEmployee, email: text })} placeholder="jan@bistro.pl" keyboardType="email-address" autoCapitalize="none" style={styles.textInput} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Hasło tymczasowe *</Text>
                <TextInput value={newEmployee.password} onChangeText={(text) => setNewEmployee({ ...newEmployee, password: text })} placeholder="Minimum 6 znaków" secureTextEntry style={styles.textInput} />
              </View>
              <View style={[styles.inputGroup, { zIndex: 100 }]}>
                <Text style={styles.label}>Rola w systemie *</Text>
                <TouchableOpacity onPress={() => setShowRolePicker(!showRolePicker)} style={styles.pickerButton}>
                  <Text style={styles.pickerButtonText}>{newEmployee.role}</Text>
                  <ChevronDown size={20} color="#adb5bd" />
                </TouchableOpacity>
                {showRolePicker && (
                  <View style={styles.dropdownMenu}>
                    {['Szef kuchni', 'Menedzer'].map((r) => (
                      <TouchableOpacity key={r} onPress={() => { setNewEmployee({ ...newEmployee, role: r }); setShowRolePicker(false); }} style={styles.dropdownItem}>
                        <Text style={{ color: newEmployee.role === r ? '#2ecc71' : '#333', fontWeight: '500' }}>{r}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => { setEmployeeModalVisible(false); setShowRolePicker(false); }} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Anuluj</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAddEmployee} disabled={isSubmitting || !newEmployee.name || !newEmployee.email || !newEmployee.password} style={[styles.submitButton, (!newEmployee.name || !newEmployee.email || !newEmployee.password) && { backgroundColor: '#a8e6cf' }]}>
                  {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Utwórz konto</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Edycja Profilu */}
      <Modal visible={profileModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edytuj swoje dane</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Imię i Nazwisko</Text>
              <TextInput value={editProfileData.name} onChangeText={(text) => setEditProfileData({ ...editProfileData, name: text })} style={styles.textInput} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email firmowy</Text>
              <TextInput value={editProfileData.email} onChangeText={(text) => setEditProfileData({ ...editProfileData, email: text })} keyboardType="email-address" autoCapitalize="none" style={styles.textInput} />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setProfileModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Anuluj</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUpdateProfile} disabled={isSubmitting} style={styles.submitButton}>
                {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Zapisz</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: Edycja Restauracji */}
      <Modal visible={restaurantModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Edytuj dane restauracji</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nazwa Lokalu</Text>
                <TextInput value={editRestaurantData.name} onChangeText={(text) => setEditRestaurantData({ ...editRestaurantData, name: text })} style={styles.textInput} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Miasto</Text>
                <TextInput value={editRestaurantData.city} onChangeText={(text) => setEditRestaurantData({ ...editRestaurantData, city: text })} style={styles.textInput} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Liczba miejsc siedzących</Text>
                <TextInput value={editRestaurantData.seats} onChangeText={(text) => setEditRestaurantData({ ...editRestaurantData, seats: text })} keyboardType="number-pad" style={styles.textInput} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Średnia liczba nakryć / dzień</Text>
                <TextInput value={editRestaurantData.avgCoversPerDay} onChangeText={(text) => setEditRestaurantData({ ...editRestaurantData, avgCoversPerDay: text })} keyboardType="number-pad" style={styles.textInput} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Opis lokalu</Text>
                <TextInput value={editRestaurantData.description} onChangeText={(text) => setEditRestaurantData({ ...editRestaurantData, description: text })} multiline numberOfLines={3} style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]} />
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setRestaurantModalVisible(false)} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Anuluj</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleUpdateRestaurant} disabled={isSubmitting} style={styles.submitButton}>
                  {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Zapisz</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconContainerPrimary: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(46, 204, 113, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  iconContainerSecondary: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(52, 152, 219, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#212529' },
  cardBody: { gap: 16 },
  dataRow: { borderBottomWidth: 1, borderBottomColor: '#f1f3f5', paddingBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: '#868e96', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  value: { fontSize: 16, fontWeight: '600', color: '#343a40' },
  valueMono: { fontSize: 14, color: '#495057', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', backgroundColor: '#f1f3f5', padding: 8, borderRadius: 6, overflow: 'hidden' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f8f5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', gap: 6 },
  badgeText: { fontSize: 14, fontWeight: '700', color: '#27ae60' },
  logoutButton: { backgroundColor: '#fa5252', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 10 },
  logoutText: { color: 'white', fontSize: 16, fontWeight: '700' },
  errorAlert: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff5f5', padding: 14, borderRadius: 8, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#fa5252' },
  errorAlertText: { marginLeft: 10, color: '#c92a2a', fontWeight: '600', fontSize: 14, flex: 1 },
  
  addButton: { backgroundColor: '#3498db', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 6 },
  addButtonText: { color: 'white', fontSize: 13, fontWeight: '600' },
  editIconBtn: { padding: 8, borderRadius: 8, backgroundColor: '#f8f9fa' },
  employeeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
  employeeName: { fontSize: 15, fontWeight: '600', color: '#343a40' },
  employeeEmail: { fontSize: 13, color: '#868e96', marginTop: 2 },
  employeeBadge: { backgroundColor: '#f8f9fa', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#e9ecef' },
  employeeBadgeText: { fontSize: 12, color: '#495057', fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#212529', marginBottom: 6 },
  modalSubtitle: { fontSize: 13, color: '#6c757d', marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  textInput: { borderWidth: 1.5, borderColor: '#e9ecef', backgroundColor: '#f8f9fa', padding: 14, borderRadius: 8, fontSize: 15, color: '#212529' },
  pickerButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderColor: '#e9ecef', backgroundColor: '#f8f9fa', padding: 14, borderRadius: 8 },
  pickerButtonText: { fontSize: 15, color: '#212529', fontWeight: '500' },
  dropdownMenu: { position: 'absolute', top: 75, left: 0, right: 0, backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#e9ecef', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5, zIndex: 999 },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  cancelButton: { flex: 1, borderWidth: 1.5, borderColor: '#e9ecef', padding: 14, borderRadius: 8, alignItems: 'center' },
  cancelButtonText: { color: '#495057', fontWeight: '600', fontSize: 15 },
  submitButton: { flex: 1, backgroundColor: '#2ecc71', padding: 14, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { color: 'white', fontWeight: '700', fontSize: 15 },
});