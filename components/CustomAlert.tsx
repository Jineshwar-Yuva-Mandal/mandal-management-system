import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type?: 'success' | 'error';
}

export const CustomAlert = ({ visible, title, message, onClose, type = 'success' }: CustomAlertProps) => {
  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        {/* The Backdrop Blur */}
        <Animated.View 
          entering={FadeIn.duration(300)} 
          style={StyleSheet.absoluteFill}
        >
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>

        {/* The Alert Card */}
        <Animated.View 
          entering={ZoomIn.duration(400).springify()} 
          style={styles.alertCard}
        >
          <View style={[styles.iconCircle, { backgroundColor: type === 'success' ? '#ECFDF5' : '#FEF2F2' }]}>
            <Text style={{ fontSize: 24 }}>{type === 'success' ? '✅' : '❌'}</Text>
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertCard: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});