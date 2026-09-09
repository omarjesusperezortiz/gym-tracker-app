import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/src/theme';

export default function TodayScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>☀️</Text>
      <Text style={styles.title}>Today's recommendation</Text>
      <Text style={styles.body}>
        Coming in a later phase. Head to Home to pick a session and start training.
      </Text>
      <Pressable style={styles.button} onPress={() => router.push('/(tabs)/home')}>
        <Text style={styles.buttonText}>Go to Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  emoji: { fontSize: 40, marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '700', color: colors.ink },
  body: { fontSize: 14, color: colors.mut, textAlign: 'center', lineHeight: 20 },
  button: {
    marginTop: 12,
    backgroundColor: colors.acc,
    borderRadius: radius.sm,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonText: { color: colors.accInk, fontWeight: '700' },
});
