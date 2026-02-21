import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function MemberRegistration() {
  const router = useRouter();
  const { mandalName } = useLocalSearchParams();
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!result.canceled) setProfileImage(result.assets[0].uri);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 25, paddingTop: 60 }}>
      <Text style={styles.header}>Join {mandalName}</Text>
      
      <BlurView intensity={100} style={styles.idCard}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarWrap}>
          {profileImage ? <Image source={{ uri: profileImage }} style={styles.img} /> : <Ionicons name="camera" size={30} color="#21307A" />}
        </TouchableOpacity>
        <View style={{ marginLeft: 15 }}>
          <Text style={styles.idName}>{name || "Your Name"}</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>MEMBER</Text></View>
        </View>
      </BlurView>

      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} placeholder="Rahul Jain" onChangeText={setName} />
        <Text style={styles.label}>Mobile Number</Text>
        <TextInput style={styles.input} placeholder="+91" keyboardType="phone-pad" />
        
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/(auth)/payment')}>
          <Text style={styles.btnText}>Proceed to Payment</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { fontSize: 24, fontWeight: '900', color: '#21307A', marginBottom: 20 },
  idCard: { padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F4F8' },
  avatarWrap: { width: 70, height: 70, borderRadius: 15, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  idName: { fontSize: 18, fontWeight: '700' },
  badge: { backgroundColor: '#FFD700', padding: 4, borderRadius: 5, marginTop: 5, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, fontWeight: '800' },
  form: { marginTop: 30, gap: 15 },
  label: { fontSize: 12, fontWeight: '700', color: '#999' },
  input: { backgroundColor: '#F9F9F9', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#EEE' },
  btn: { backgroundColor: '#21307A', padding: 20, borderRadius: 15, marginTop: 20, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '700' }
});