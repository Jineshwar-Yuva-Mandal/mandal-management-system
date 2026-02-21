import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { MainNavbar } from "../../components/MainNavbar";
import { AdminFooter } from "../../components/AdminFooter";

export default function AdminDashboard() {
  const isPremium = false; // Mock

  return (
    <View style={styles.container}>
      <MainNavbar title="Samanvay Admin" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainWrapper}>
          
          {/* 1. STATUS SUMMARY */}
          <View style={styles.headerGap}>
            <Text style={styles.greeting}>Command Center</Text>
            <Text style={styles.mandalSubtitle}>Jineshwar Yuva Mandal • active now</Text>
          </View>

          {/* 2. COLLECTION TREND (Modern Insight Card) */}
          <View style={styles.insightCard}>
            <View>
                <Text style={styles.insightLabel}>Total Collection</Text>
                <Text style={styles.insightValue}>₹1,24,000</Text>
            </View>
            <View style={styles.trendBadge}>
                <Ionicons name="trending-up" size={14} color="#059669" />
                <Text style={styles.trendText}>+12%</Text>
            </View>
          </View>

          {/* 3. PENDING TASKS (High Margin) */}
          <View style={styles.sectionGap}>
            <Text style={styles.sectionLabel}>Action Required</Text>
            
            <Animated.View entering={FadeInDown.delay(200)} style={styles.taskCard}>
              <View style={styles.taskIcon}><Ionicons name="people" size={20} color="#21307A" /></View>
              <View style={{flex: 1}}>
                <Text style={styles.taskTitle}>8 New Members</Text>
                <Text style={styles.taskSub}>Verification pending</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300)} style={[styles.taskCard, {marginTop: 12}]}>
              <View style={[styles.taskIcon, {backgroundColor: '#FEF3C7'}]}><Ionicons name="calendar" size={20} color="#B45309" /></View>
              <View style={{flex: 1}}>
                <Text style={styles.taskTitle}>Upcoming Event</Text>
                <Text style={styles.taskSub}>Mahavir Jayanti Planning</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </Animated.View>
          </View>

        </View>
      </ScrollView>

      {/* 4. THE NEW FOOTER NAV */}
      <AdminFooter isPremium={isPremium} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFDFD" },
  scrollContent: { paddingTop: 110, paddingBottom: 100 },
  mainWrapper: { paddingHorizontal: 24 },
  headerGap: { marginBottom: 24 },
  greeting: { fontSize: 26, fontWeight: "900", color: "#1E293B", letterSpacing: -0.8 },
  mandalSubtitle: { fontSize: 14, color: "#94A3B8", fontWeight: "500" },

  // Insight Card
  insightCard: {
    backgroundColor: '#21307A',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    elevation: 4,
  },
  insightLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  insightValue: { color: '#FFF', fontSize: 28, fontWeight: '800', marginTop: 4 },
  trendBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  trendText: { color: '#059669', fontSize: 12, fontWeight: '800' },

  // Sections
  sectionGap: { marginBottom: 28 },
  sectionLabel: { fontSize: 12, fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 16 },
  
  // Task Cards
  taskCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    gap: 15
  },
  taskIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#E8EBF5', justifyContent: 'center', alignItems: 'center' },
  taskTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  taskSub: { fontSize: 13, color: '#94A3B8', marginTop: 1 },
});