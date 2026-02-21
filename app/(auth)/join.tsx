import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function JoinMandal() {
  const router = useRouter();
  const mandals = [{ id: '1', name: 'Jineshwar Yuva Mandal', city: 'Mumbai' }];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#21307A" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Find your Mandal</Text>
        
        <BlurView intensity={80} style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#21307A" />
          <TextInput placeholder="Search city or name..." style={styles.searchInput} />
        </BlurView>

        <FlatList data={mandals} renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => router.push({ pathname: "/(auth)/register-member", params: { mandalId: item.id, mandalName: item.name }})}
          >
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.city}>{item.city}</Text>
            </View>
            <Ionicons name="chevron-forward-circle" size={30} color="#FFD700" />
          </TouchableOpacity>
        )} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, padding: 25, paddingTop: 60 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#21307A', marginVertical: 20 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#DDD' },
  searchInput: { flex: 1, marginLeft: 10 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  name: { fontSize: 16, fontWeight: '700' },
  city: { fontSize: 12, color: '#666' }
});