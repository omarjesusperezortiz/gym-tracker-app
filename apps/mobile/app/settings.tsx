import { getSupabase } from '@gym-tracker/core';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/src/lib/auth';
import { colors, radius } from '@/src/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await getSupabase().auth.signOut();
    setSigningOut(false);
    router.back();
  }

  return (
    <View style={styles.container}>
      <View style={styles.grab} />
      <Text style={styles.title}>Settings</Text>
      {session?.user.email && <Text style={styles.email}>{session.user.email}</Text>}

      <Pressable style={styles.signOutBtn} onPress={signOut} disabled={signingOut}>
        {signingOut ? <ActivityIndicator color={colors.danger} /> : <Text style={styles.signOutText}>Sign out</Text>}
      </Pressable>

      <Pressable style={styles.closeBtn} onPress={() => router.back()}>
        <Text style={styles.closeText}>Close</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.panel,
    padding: 20,
    paddingTop: 12,
  },
  grab: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  email: { fontSize: 13, color: colors.mut, marginBottom: 24 },
  signOutBtn: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: { color: colors.danger, fontWeight: '700', fontSize: 15 },
  closeBtn: {
    marginTop: 12,
    backgroundColor: colors.surf,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeText: { color: colors.ink2, fontWeight: '600', fontSize: 15 },
});
