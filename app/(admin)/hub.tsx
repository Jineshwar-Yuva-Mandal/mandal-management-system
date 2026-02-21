import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MainNavbar } from "../../components/MainNavbar";
import { AdminFooter } from "../../components/AdminFooter";

export default function AdminHub() {
  const router = useRouter();
  const isPremium = false; // Mock logic

  const MenuSection = ({ title, children }: any) => (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.cardContainer}>{children}</View>
    </View>
  );

  const MenuItem = ({ icon, title, subtitle, route, isLast = false, locked = false }: any) => (
    <TouchableOpacity 
      style={[styles.menuItem, isLast && { borderBottomWidth: 0 }]} 
      onPress={() => !locked && router.push(route)}
    >
      <View style={[styles.iconBox, { backgroundColor: locked ? '#F1F5F9' : '#21307A10' }]}>
        <Ionicons name={icon} size={20} color={locked ? '#CBD5E1' : '#21307A'} />
      </View>
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={[styles.menuTitle, locked && { color: '#94A3B8' }]}>{title}</Text>
        <Text style={styles.menuSub}>{subtitle}</Text>
      </View>
      {locked ? (
        <Ionicons name="lock-closed" size={16} color="#FFD700" />
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <MainNavbar title="Admin Hub" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainWrapper}>
          
          {/* ORGANIZATION SETTINGS */}
          <MenuSection title="Organization">
            <MenuItem 
              icon="business-outline" 
              title="Mandal Profile" 
              subtitle="Edit name, logo, and address" 
              route="/(admin)/profile-edit" 
            />
            <MenuItem 
              icon="construct-outline" 
              title="Form Builder" 
              subtitle="Customize registration fields" 
              route="/(admin)/form-builder" 
              isLast 
            />
          </MenuSection>

          {/* CONTENT MANAGEMENT */}
          <MenuSection title="Modules">
            <MenuItem 
              icon="calendar-outline" 
              title="Event Manager" 
              subtitle="RSVPs and announcements" 
              route="/(admin)/events" 
            />
            <MenuItem 
              icon="book-outline" 
              title="Syllabus Mgt." 
              subtitle="Pathshala lessons & tracking" 
              route="/(admin)/syllabus" 
              locked={!isPremium}
              isLast 
            />
          </MenuSection>

          {/* SYSTEM */}
          <MenuSection title="Account">
            <MenuItem 
              icon="people-outline" 
              title="Admin Access" 
              subtitle="Add or remove other admins" 
              route="/(admin)/roles" 
            />
            <MenuItem 
              icon="log-out-outline" 
              title="Logout" 
              subtitle="Sign out of Samanvay" 
              route="/(auth)/login" 
              isLast 
            />
          </MenuSection>

          <Text style={styles.versionText}>Samanvay Admin v1.0.4 (Stable)</Text>
        </View>
      </ScrollView>

      <AdminFooter isPremium={isPremium} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFDFD" },
  scrollContent: { paddingTop: 110, paddingBottom: 120 },
  mainWrapper: { paddingHorizontal: 24 },
  section: { marginBottom: 32 },
  sectionLabel: { fontSize: 12, fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12, marginLeft: 4 },
  cardContainer: { backgroundColor: '#FFF', borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9', overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  menuSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  versionText: { textAlign: 'center', color: '#CBD5E1', fontSize: 11, fontWeight: '600', marginBottom: 20 }
});