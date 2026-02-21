import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function PaymentScreen() {
  const [screenshot, setScreenshot] = useState(null);

  const uploadProof = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });
    if (!result.canceled) setScreenshot(result.assets[0].uri);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Membership Fee</Text>
      <View style={styles.qrCard}>
        <Text style={styles.amount}>₹ 500 / month</Text>
        <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code" size={150} color="#21307A" />
        </View>
        <Text style={styles.qrHint}>Scan to pay via UPI</Text>
      </View>

      <TouchableOpacity style={styles.uploadArea} onPress={uploadProof}>
        {screenshot ? <Image source={{ uri: screenshot }} style={{ width: '100%', height: '100%', borderRadius: 15 }} /> : (
          <>
            <Ionicons name="cloud-upload" size={40} color="#21307A" />
            <Text style={{ marginTop: 10 }}>Upload Payment Screenshot</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.submit, !screenshot && { opacity: 0.5 }]} disabled={!screenshot}>
        <Text style={styles.submitText}>Submit Application</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 25, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '900', color: '#21307A', textAlign: 'center' },
  qrCard: { backgroundColor: '#F8FAFC', padding: 30, borderRadius: 30, alignItems: 'center', marginVertical: 30 },
  amount: { fontSize: 28, fontWeight: '900', color: '#21307A', marginBottom: 20 },
  qrPlaceholder: { padding: 10, backgroundColor: '#FFF', borderRadius: 20 },
  qrHint: { marginTop: 15, color: '#666', fontWeight: '600' },
  uploadArea: { height: 150, borderStyle: 'dashed', borderWidth: 2, borderColor: '#21307A', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  submit: { backgroundColor: '#FFD700', padding: 20, borderRadius: 20, marginTop: 30, alignItems: 'center' },
  submitText: { fontWeight: '800', color: '#21307A' }
});