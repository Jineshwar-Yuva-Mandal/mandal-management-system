import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function FinanceVerify() {
  // Mocking the pending requests coming from the "Join" screen we just built
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: '101',
      name: 'Rahul Vardhan Jain',
      phone: '+91 98765 43210',
      amount: '501',
      date: '21 Feb 2026',
      proofUri: 'https://via.placeholder.com/300x600', // This would be the member's screenshot
    }
  ]);

  const handleVerify = (id: string) => {
    Alert.alert("Verified", "Payment confirmed. Sending to Admin for final approval.");
    setPendingRequests(prev => prev.filter(req => req.id !== id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Finance Approvals</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>{pendingRequests.length} Pending</Text></View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollList}>
        {pendingRequests.map((item) => (
          <View key={item.id} style={styles.requestCard}>
            <View style={styles.userInfo}>
              <View>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userMeta}>{item.phone} • {item.date}</Text>
              </View>
              <Text style={styles.amountText}>₹{item.amount}</Text>
            </View>

            <Text style={styles.label}>Submitted Proof:</Text>
            <TouchableOpacity activeOpacity={0.9} style={styles.imageContainer}>
              <Image source={{ uri: item.proofUri }} style={styles.proofImage} resizeMode="contain" />
              <View style={styles.zoomOverlay}><Text style={styles.zoomText}>Tap to Zoom</Text></View>
            </TouchableOpacity>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.rejectButton}>
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.approveButton} onPress={() => handleVerify(item.id)}>
                <Text style={styles.approveText}>Confirm Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { 
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, 
    backgroundColor: '#21307A', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  badge: { backgroundColor: '#FFD700', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#21307A', fontSize: 12, fontWeight: 'bold' },
  scrollList: { padding: 16 },
  requestCard: { 
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 
  },
  userInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  userName: { fontSize: 18, fontWeight: '600', color: '#333' },
  userMeta: { fontSize: 13, color: '#777', marginTop: 2 },
  amountText: { fontSize: 18, fontWeight: '700', color: '#107C10' },
  label: { fontSize: 12, fontWeight: '600', color: '#999', marginBottom: 8, textTransform: 'uppercase' },
  imageContainer: { width: '100%', height: 250, backgroundColor: '#EEE', borderRadius: 12, overflow: 'hidden' },
  proofImage: { width: '100%', height: '100%' },
  zoomOverlay: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 5, borderRadius: 5 },
  zoomText: { color: '#FFF', fontSize: 10 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  rejectButton: { flex: 1, padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#E74C3C', alignItems: 'center' },
  rejectText: { color: '#E74C3C', fontWeight: '600' },
  approveButton: { flex: 2, backgroundColor: '#21307A', padding: 15, borderRadius: 10, alignItems: 'center' },
  approveText: { color: '#FFF', fontWeight: '600' },
});