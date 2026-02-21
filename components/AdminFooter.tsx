import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter, usePathname } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const AdminFooter = ({ isPremium }: { isPremium: boolean }) => {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { id: 'dashboard', name: 'Home', icon: 'grid', route: '/(admin)', premium: false },
    { id: 'approvals', name: 'Verify', icon: 'shield-checkmark', route: '/(admin)/approvals', premium: false },
    { id: 'finance', name: 'Finance', icon: 'wallet', route: '/(admin)/finance', premium: true },
    { id: 'more', name: 'More', icon: 'apps-outline', route: '/(admin)/form-builder', premium: false },
  ];

  return (
    <BlurView intensity={80} tint="light" style={styles.container}>
      <View style={styles.tabWrapper}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.route;
          const isLocked = tab.premium && !isPremium;

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => !isLocked && router.push(tab.route as any)}
            >
              <View style={isActive ? styles.activeIndicator : null}>
                <Ionicons 
                  name={(isActive ? tab.icon : `${tab.icon}-outline`) as any} 
                  size={24} 
                  color={isLocked ? "#CBD5E1" : isActive ? "#21307A" : "#94A3B8"} 
                />
              </View>
              <Text style={[
                styles.tabLabel, 
                { color: isLocked ? "#CBD5E1" : isActive ? "#21307A" : "#94A3B8" }
              ]}>
                {tab.name}
              </Text>
              {isLocked && <View style={styles.miniLock}><Ionicons name="lock-closed" size={8} color="#FFF" /></View>}
            </TouchableOpacity>
          );
        })}
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: 90,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  tabWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width / 4,
  },
  activeIndicator: {
    backgroundColor: 'rgba(33, 48, 122, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  miniLock: {
    position: 'absolute',
    top: 5,
    right: 25,
    backgroundColor: '#FFD700',
    borderRadius: 5,
    padding: 2,
  }
});