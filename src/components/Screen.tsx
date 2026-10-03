import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, space, typography } from '@/theme';

export function Screen({ title, subtitle, right, children, refreshing, onRefresh }: { title: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode; refreshing?: boolean; onRefresh?: () => void }) {
  return <SafeAreaView style={styles.page} edges={['top']}>
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} /> : undefined}
    >
      <View style={styles.header}>
        <View style={styles.titles}>
          {subtitle && <Text style={typography.label}>{subtitle}</Text>}
          <Text style={typography.title} accessibilityRole="header">{title}</Text>
        </View>
        {right}
      </View>
      {children}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: space.lg - 4, paddingTop: space.lg, paddingBottom: space.xxl, gap: space.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md, marginBottom: space.sm },
  titles: { flex: 1, gap: space.xs },
});
