import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInRight, FadeInUp } from "react-native-reanimated";
import { AdminFooter } from "../../components/AdminFooter";
import { MainNavbar } from "../../components/MainNavbar";

const { width } = Dimensions.get("window");

export default function ModernDashboard() {
  return (
    <View style={styles.container}>
      <MainNavbar title="Samanvay" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.bentoGrid}>
          {/* 1. HERO CARD (Featured Insight) */}
          <Animated.View entering={FadeInUp.delay(100)} style={styles.heroCard}>
            <LinearGradient
              colors={["#21307A", "#1a2663"]}
              style={styles.heroGradient}
            >
              <View>
                <Text style={styles.heroLabel}>Total Treasury</Text>
                <Text style={styles.heroValue}>₹4,82,900</Text>
                <View style={styles.growthBadge}>
                  <Ionicons name="trending-up" size={12} color="#4ADE80" />
                  <Text style={styles.growthText}>+14% this month</Text>
                </View>
              </View>
              <View style={styles.heroIconCircle}>
                <Ionicons
                  name="analytics"
                  size={32}
                  color="rgba(255,255,255,0.8)"
                />
              </View>
            </LinearGradient>
          </Animated.View>

          {/* 2. TWO-COLUMN BENTO ROW */}
          <View style={styles.row}>
            {/* PENDING APPROVALS (Vertical Bento) */}
            <Animated.View
              entering={FadeInUp.delay(200)}
              style={[styles.bentoTile, { flex: 1.2, backgroundColor: "#FFF" }]}
            >
              <View style={[styles.tileIcon, { backgroundColor: "#EEF2FF" }]}>
                <Ionicons name="shield-checkmark" size={20} color="#21307A" />
              </View>
              <Text style={styles.tileValue}>08</Text>
              <Text style={styles.tileLabel}>Pending{"\n"}Approvals</Text>
              <TouchableOpacity style={styles.miniActionBtn}>
                <Text style={styles.miniActionText}>Review</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* QUICK STATS (Stacked Bento) */}
            <View style={{ flex: 1, gap: 12 }}>
              <Animated.View
                entering={FadeInRight.delay(300)}
                style={[styles.bentoTile, { backgroundColor: "#FFF" }]}
              >
                <Text style={styles.smallTileValue}>142</Text>
                <Text style={styles.smallTileLabel}>Members</Text>
              </Animated.View>
              <Animated.View
                entering={FadeInRight.delay(400)}
                style={[styles.bentoTile, { backgroundColor: "#21307A" }]}
              >
                <Text style={[styles.smallTileValue, { color: "#FFF" }]}>
                  04
                </Text>
                <Text
                  style={[
                    styles.smallTileLabel,
                    { color: "rgba(255,255,255,0.6)" },
                  ]}
                >
                  Events
                </Text>
              </Animated.View>
            </View>
          </View>

          {/* 3. RECENT ACTIVITY (Wide Bento) */}
          <Animated.View
            entering={FadeInUp.delay(500)}
            style={styles.activityTile}
          >
            <View style={styles.tileHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </View>

            <View style={styles.activityItem}>
              <View style={styles.dot} />
              <Text style={styles.activityText}>
                <Text style={{ fontWeight: "700" }}>Ankit J.</Text> paid
                membership fees
              </Text>
              <Text style={styles.activityTime}>2m ago</Text>
            </View>

            <View style={styles.activityItem}>
              <View style={[styles.dot, { backgroundColor: "#FFD700" }]} />
              <Text style={styles.activityText}>
                New event <Text style={{ fontWeight: "700" }}>Pratikraman</Text>{" "}
                created
              </Text>
              <Text style={styles.activityTime}>1h ago</Text>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      <AdminFooter isPremium={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" }, // Modern subtle blue-grey tint
  scrollContent: { paddingTop: 110, paddingBottom: 110 },
  bentoGrid: { paddingHorizontal: 20, gap: 12 },

  // Hero Card
  heroCard: {
    borderRadius: 32,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#21307A",
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  heroGradient: {
    padding: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroValue: { color: "#FFF", fontSize: 34, fontWeight: "900", marginTop: 4 },
  growthBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  growthText: {
    color: "#4ADE80",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
  },
  heroIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Bento Tiles
  row: { flexDirection: "row", gap: 12 },
  bentoTile: {
    borderRadius: 28,
    padding: 20,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  tileValue: { fontSize: 32, fontWeight: "800", color: "#1E293B" },
  tileLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    lineHeight: 20,
  },

  smallTileValue: { fontSize: 22, fontWeight: "800", color: "#1E293B" },
  smallTileLabel: { fontSize: 12, fontWeight: "600", color: "#94A3B8" },

  miniActionBtn: {
    backgroundColor: "#21307A",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 15,
    alignSelf: "flex-start",
  },
  miniActionText: { color: "#FFF", fontSize: 12, fontWeight: "700" },

  // Activity Tile
  activityTile: {
    backgroundColor: "#FFF",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  tileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1E293B" },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
    marginRight: 12,
  },
  activityText: { flex: 1, fontSize: 13, color: "#64748B" },
  activityTime: { fontSize: 11, color: "#CBD5E1", fontWeight: "600" },
});
