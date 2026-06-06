import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, Plus } from 'lucide-react-native';

import { formatPrice, formatPercent, formatInteger } from '../utils/formatting';
import { useMenuSuggestions } from '../hooks/useMenuSuggestions';

interface MenuSuggestionsScreenProps {
  navigation: any;
}

export function MenuSuggestionsScreen({ navigation }: MenuSuggestionsScreenProps) {
  // Cała logika pobierania wyciągnięta do hooka!
  const { suggestions, loading, refreshing, error, date, fetchSuggestions } = useMenuSuggestions(5);

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <ScrollView
        style={{ flex: 1, backgroundColor: '#fff' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchSuggestions(true)} />}
      >
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>🎯 Sugestie Menu</Text>
              <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Date: {date}</Text>
              <Text style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
                Propozycje dań oparte na Twoim aktualnym stanie magazynowym, trendach rynkowych i marżach. Odśwież, aby zobaczyć najnowsze sugestie!
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => alert('Moduł tworzenia przepisów będzie dostępny wkrótce!')}
              style={{
                backgroundColor: '#2ecc71',
                padding: 10,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Plus size={18} color="white" />
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>Przepis</Text>
            </TouchableOpacity>
          </View>

          {/* Graceful Degradation - Error Alert with Retry mechanism */}
          {error && (
            <View style={{ backgroundColor: '#fff5f5', padding: 16, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#fa5252', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ color: '#c92a2a', fontSize: 14, fontWeight: '500' }}>{error}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => fetchSuggestions()}
                style={{ backgroundColor: '#fa5252', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 }}
              >
                <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>Ponów</Text>
              </TouchableOpacity>
            </View>
          )}

          {suggestions.length === 0 && !error ? (
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ fontSize: 16, color: '#999' }}>Brak dostępnych sugestii</Text>
            </View>
          ) : (
            <>
              {suggestions.map((suggestion, idx) => (
                <View key={idx} style={{ marginBottom: 16 }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#f0f9ff',
                      padding: 16,
                      borderRadius: 12,
                      borderLeftWidth: 4,
                      borderLeftColor: '#2ecc71',
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#333' }}>#{idx + 1} {suggestion.recipeName}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                            <Star size={16} color="#ffc107" fill="#ffc107" />
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginLeft: 4 }}>
                              {formatPercent(suggestion.score)}/100
                            </Text>
                          </View>
                          <Text style={{ fontSize: 12, color: '#666' }}>Wynik</Text>
                        </View>
                      </View>
                    </View>

                    {/* Scoring Breakdown */}
                    <View style={{ backgroundColor: 'rgba(46, 204, 113, 0.05)', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                      <View style={{ marginBottom: 8 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={{ fontSize: 12, color: '#666' }}>Magazyn</Text>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: '#27ae60' }}>
                            {suggestion.inventoryScore?.toFixed(0) || 0} pts
                          </Text>
                        </View>
                        <View style={{ height: 6, backgroundColor: '#ddd', borderRadius: 3, overflow: 'hidden' }}>
                          <View
                            style={{
                              height: '100%',
                              backgroundColor: '#27ae60',
                              width: `${(suggestion.inventoryScore || 0) / 30 * 100}%`,
                            }}
                          />
                        </View>
                      </View>

                      <View style={{ marginBottom: 8 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={{ fontSize: 12, color: '#666' }}>Popyt</Text>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: '#2ecc71' }}>
                            {suggestion.demandScore?.toFixed(0) || 0} pts
                          </Text>
                        </View>
                        <View style={{ height: 6, backgroundColor: '#ddd', borderRadius: 3, overflow: 'hidden' }}>
                          <View
                            style={{
                              height: '100%',
                              backgroundColor: '#2ecc71',
                              width: `${(suggestion.demandScore || 0) / 30 * 100}%`,
                            }}
                          />
                        </View>
                      </View>

                      <View style={{ marginBottom: 8 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={{ fontSize: 12, color: '#666' }}>Marża</Text>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: '#3498db' }}>
                            {suggestion.marginScore?.toFixed(0) || 0} pts
                          </Text>
                        </View>
                        <View style={{ height: 6, backgroundColor: '#ddd', borderRadius: 3, overflow: 'hidden' }}>
                          <View
                            style={{
                              height: '100%',
                              backgroundColor: '#3498db',
                              width: `${(suggestion.marginScore || 0) / 20 * 100}%`,
                            }}
                          />
                        </View>
                      </View>
                    </View>

                    {/* Details */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                      <View>
                        <Text style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>Szacowany zysk</Text>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#2ecc71' }}>
                          {formatPrice(suggestion.estimatedProfit || 0)} PLN
                        </Text>
                      </View>
                      <View>
                        <Text style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>Polecane</Text>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#3498db' }}>
                          {formatInteger(suggestion.recommendedQuantity || 10)} porcji
                        </Text>
                      </View>
                    </View>

                    {/* Reasons */}
                    {suggestion.reasons && suggestion.reasons.length > 0 && (
                      <View>
                        <Text style={{ fontSize: 12, color: '#666', marginBottom: 6, fontWeight: '600' }}>Dlaczego to danie?</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                          {suggestion.reasons.map((reason: string, i: number) => (
                            <View key={i} style={{ backgroundColor: '#e8f8f5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16 }}>
                              <Text style={{ fontSize: 11, color: '#27ae60', fontWeight: '600' }}>✓ {reason}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}