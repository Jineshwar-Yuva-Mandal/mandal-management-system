import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

export default function CreateMandal() {
  const [step, setStep] = useState(1);

  return (
    <View style={styles.container}>
      <View style={[styles.blob, { bottom: -100, left: -100, backgroundColor: '#21307A', opacity: 0.1 }]} />
      
      <View style={styles.content}>
        <View style={styles.topNav}>
          <Text style={styles.brandTag}>Samanvay Suite</Text>
          <View style={styles.progressDots}>
            {[1, 2, 3].map(i => (
              <View key={i} style={[styles.dot, step >= i && styles.activeDot]} />
            ))}
          </View>
        </View>

        <Text style={styles.mainTitle}>Create New{"\n"}Organization</Text>

        <BlurView intensity={90} tint="light" style={styles.setupCard}>
          {step === 1 && (
            <View>
              <Text style={styles.label}>What's the Mandal called?</Text>
              <TextInput style={styles.input} placeholder="e.g. JYM Bangalore" />
              <Text style={styles.subLabel}>This will be your primary brand name.</Text>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={styles.label}>Set Membership Fee</Text>
              <TextInput style={styles.input} placeholder="₹ 500" keyboardType="numeric" />
              <Text style={styles.subLabel}>Collected monthly from all members.</Text>
            </View>
          )}

          <TouchableOpacity style={styles.actionBtn} onPress={() => setStep(s => s + 1)}>
            <Text style={styles.actionBtnText}>
              {step === 3 ? "Complete Setup" : "Continue"}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFDFF' },
  blob: { position: 'absolute', width: 400, height: 400, borderRadius: 200 },
  content: { flex: 1, padding: 30, paddingTop: 60 },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  brandTag: { fontWeight: '800', color: '#FFD700', fontSize: 12, letterSpacing: 1 },
  progressDots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E2E8F0' },
  activeDot: { backgroundColor: '#21307A', width: 20 },
  mainTitle: { fontSize: 32, fontWeight: '900', color: '#21307A', marginBottom: 30, lineHeight: 38 },
  setupCard: { padding: 30, borderRadius: 32, overflow: 'hidden', borderWidth: 1, borderColor: '#FFF' },
  label: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  subLabel: { fontSize: 13, color: '#94A3B8', marginTop: 10 },
  input: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, fontSize: 18, elevation: 2 },
  actionBtn: { 
    backgroundColor: '#21307A', padding: 20, borderRadius: 20, 
    marginTop: 40, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 
  },
  actionBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 }
});