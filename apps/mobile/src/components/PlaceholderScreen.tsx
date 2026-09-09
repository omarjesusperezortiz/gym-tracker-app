import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme';

export function PlaceholderScreen({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
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
});
