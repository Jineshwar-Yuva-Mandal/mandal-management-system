import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch } from "react-native";
import { MainNavbar } from "../../components/MainNavbar";

export default function RolesManagement() {
  // Mocking a list of members who have been given Admin rights
  const [admins, setAdmins] = useState([
    { id: '1', name: 'Rahul Shah', role: 'Finance Head', permissions: ['finance'] },
    { id: '2', name: 'Snehal Jain', role: 'Verification Officer', permissions: ['approvals'] },
  ]);

  return (
    <View style={styles.container}>
      <MainNavbar title="Admin Access" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainWrapper}>
          
          <View style={styles.headerSection}>
            <Text style={styles.title}>Delegate Duties</Text>
            <Text style={styles.subtitle}>Assign specific modules to trusted members so they can help manage the Mandal.</Text>
          </View>

          {/* ADD NEW ADMIN BUTTON */}
          <TouchableOpacity style={styles.addBtn}>
            <Ionicons name="person-add-outline" size={20} color="#21307A" />
            <Text style={styles.addBtnText}>Assign New Admin</Text>
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>Active Administrators</Text>

          {admins.map((admin) => (
            <View key={admin.id} style={styles.adminCard}>
              <View style={styles.adminHeader}>
                <View style={styles.avatar}><Text style={styles.avatarTxt}>{admin.name.charAt(0)}</Text></View>
                <View style={{flex: 1, marginLeft: 12}}>
                  <Text style={styles.adminName}>{admin.name}</Text>
                  <Text style={styles.adminRole}>{admin.role}</Text>
                </View>
                <TouchableOpacity><Ionicons name="trash-outline" size={20} color="#EF4444" /></TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* PERMISSION TOGGLES */}
              <View style={styles.permissionRow}>
                <Text style={styles.permText}>Access Finance</Text>
                <Switch 
                  value={admin.permissions.includes('finance')} 
                  trackColor={{ true: '#21307A' }}
                />
              </View>
              <View style={styles.permissionRow}>
                <Text style={styles.permText}>Access Approvals</Text>
                <Switch 
                  value={admin.permissions.includes('approvals')} 
                  trackColor={{ true: '#21307A' }}
                />
              </View>
            </View>
          ))}

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFDFD" },
  scrollContent: { paddingTop: 110, paddingBottom: 40 },
  mainWrapper: { paddingHorizontal: 24 },
  headerSection: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "800", color: "#1E293B" },
  subtitle: { fontSize: 14, color: "#64748B", marginTop: 6, lineHeight: 20 },
  
  addBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    backgroundColor: '#FFD700', padding: 16, borderRadius: 16, gap: 10, marginBottom: 32 
  },
  addBtnText: { color: '#21307A', fontWeight: '800', fontSize: 15 },
  
  sectionLabel: { fontSize: 12, fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", marginBottom: 16 },
  
  adminCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9', elevation: 2 },
  adminHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#E8EBF5', justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { color: '#21307A', fontWeight: '800' },
  adminName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  adminRole: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 15 },
  permissionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  permText: { fontSize: 14, fontWeight: '600', color: '#64748B' }
});