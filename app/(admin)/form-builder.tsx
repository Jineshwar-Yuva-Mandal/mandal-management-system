import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInRight } from 'react-native-reanimated';

export default function AdminFormBuilder() {
  // This state represents the "Registration Config" JSON we discussed
  const [config, setConfig] = useState({
    profile_photo: true,
    blood_group: true,
    business_details: false,
    emergency_contact: true,
    aadhar_number: false,
    dob: true,
  });

  const toggleField = (key: string) => {
    setConfig({ ...config, [key]: !config[key] });
  };

  const FieldToggle = ({ label, icon, value, id, delay }: any) => (
    <Animated.View entering={FadeInRight.delay(delay)}>
      <View style={styles.toggleCard}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={22} color="#21307A" />
        </View>
        <View style={styles.labelArea}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Text style={styles.fieldSub}>{value ? 'Required for members' : 'Hidden from form'}</Text>
        </View>
        <Switch
          trackColor={{ false: "#CBD5E1", true: "#21307A" }}
          thumbColor={value ? "#FFD700" : "#f4f3f4"}
          onValueChange={() => toggleField(id)}
          value={value}
        />
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.adminTag}>ADMIN CONSOLE</Text>
        <Text style={styles.title}>Registration Setup</Text>
        <Text style={styles.desc}>Choose which details you want to collect from your members during onboarding.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Identity Fields</Text>
        </View>

        <FieldToggle label="Profile Photo" icon="camera-outline" value={config.profile_photo} id="profile_photo" delay={100} />
        <FieldToggle label="Date of Birth" icon="calendar-outline" value={config.dob} id="dob" delay={200} />
        <FieldToggle label="Aadhar Card Number" icon="card-outline" value={config.aadhar_number} id="aadhar_number" delay={300} />

        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Social & Medical</Text>
        </View>

        <FieldToggle label="Blood Group" icon="water-outline" value={config.blood_group} id="blood_group" delay={400} />
        <FieldToggle label="Business/Work Details" icon="briefcase-outline" value={config.business_details} id="business_details" delay={500} />
        <FieldToggle label="Emergency Contact" icon="alert-circle-outline" value={config.emergency_contact} id="emergency_contact" delay={600} />

        {/* SAVE ACTION */}
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>Update Registration Form</Text>
            <Ionicons name="cloud-upload" size={20} color="#21307A" />
        </TouchableOpacity>
      </ScrollView>

      {/* MINI PREVIEW FAB */}
      <BlurView intensity={80} style={styles.previewFab}>
        <Ionicons name="eye-outline" size={24} color="#21307A" />
        <Text style={styles.previewText}>Preview Form</Text>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 25, paddingTop: 60, backgroundColor: '#FFF' },
  adminTag: { color: '#FFD700', fontWeight: '900', fontSize: 12, letterSpacing: 1 },
  title: { fontSize: 28, fontWeight: '900', color: '#21307A', marginTop: 5 },
  desc: { fontSize: 14, color: '#64748B', marginTop: 8, lineHeight: 20 },
  scrollBody: { padding: 20, paddingBottom: 100 },
  sectionHeader: { marginBottom: 15, marginLeft: 5 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 },
  toggleCard: { 
    backgroundColor: '#FFF', padding: 16, borderRadius: 20, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10
  },
  iconBox: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  labelArea: { flex: 1, marginLeft: 15 },
  fieldLabel: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  fieldSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  saveBtn: { 
    backgroundColor: '#FFD700', padding: 20, borderRadius: 20, marginTop: 30,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12
  },
  saveBtnText: { color: '#21307A', fontWeight: '800', fontSize: 16 },
  previewFab: { 
    position: 'absolute', bottom: 30, alignSelf: 'center', paddingHorizontal: 25, paddingVertical: 15,
    borderRadius: 30, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#DDD', elevation: 10
  },
  previewText: { fontWeight: '700', color: '#21307A' }
});