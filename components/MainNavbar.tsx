import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const MainNavbar = ({ title = "Samanvay", showBack = false, onBack }: NavbarProps) => {
  return (
    <View style={styles.outerContainer}>
      <BlurView intensity={90} tint="light" style={styles.blurContainer}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.navContent}>
            
            {/* LEFT: Logo or Back Button */}
            <View style={styles.leftSection}>
              {showBack ? (
                <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
                  <Ionicons name="arrow-back" size={24} color="#21307A" />
                </TouchableOpacity>
              ) : (
                <BrandLogo size={35} style={styles.smallLogo} />
              )}
            </View>

            {/* CENTER: Title & Branding */}
            <View style={styles.centerSection}>
              <Text style={styles.brandText}>{title}</Text>
              {!showBack && <View style={styles.liveDot} />}
            </View>

            {/* RIGHT: Profile / Notifications */}
            <View style={styles.rightSection}>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="notifications-outline" size={22} color="#21307A" />
                <View style={styles.notifBadge} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, styles.profileAvatar]}>
                <Ionicons name="person" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>

          </View>
        </SafeAreaView>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  blurContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  navContent: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  leftSection: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallLogo: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 8,
    elevation: 2,
  },
  centerSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#21307A',
    letterSpacing: -0.5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD700',
    marginLeft: 6,
  },
  rightSection: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  iconBtn: {
    position: 'relative',
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#21307A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: 'white',
  },
});