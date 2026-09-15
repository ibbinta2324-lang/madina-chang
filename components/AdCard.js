/**
 * components/AdCard.js
 * Zen-styled announcement card component.
 */

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { COLORS, SHADOWS, SIZES } from "../src/constants/theme";

export default function AdCard({ ad, onPress }) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress(ad);
    } else {
      router.push({ pathname: "/annonces/[id]", params: { id: ad.id } });
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {ad.titre || "Sans titre"}
        </Text>
        <Text style={styles.badge}>{ad.type || "Annonce"}</Text>
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {ad.description || "Aucune description"}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.date}>
          {ad.createdAt 
            ? new Date(ad.createdAt).toLocaleDateString("fr-FR")
            : "Date inconnue"
          }
        </Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {ad.actif ? "✓ Actif" : "⊗ Inactif"}
          </Text>
        </View>
      </View>

      {ad.details && (
        <Text style={styles.details} numberOfLines={1}>
          {ad.details}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingLg,
    marginBottom: SIZES.paddingMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SIZES.paddingSm,
  },
  title: {
    fontSize: SIZES.lg,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
    marginRight: SIZES.paddingSm,
  },
  badge: {
    fontSize: SIZES.xs,
    fontWeight: "700",
    color: COLORS.primary,
    backgroundColor: COLORS.primaryMuted + "30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
    textTransform: "uppercase",
  },
  description: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SIZES.paddingSm,
  },
  details: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    marginTop: SIZES.paddingSm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: SIZES.paddingSm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  date: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  statusBadge: {
    backgroundColor: COLORS.primaryMuted + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.radiusMd,
  },
  statusText: {
    fontSize: SIZES.xs,
    fontWeight: "600",
    color: COLORS.primary,
  },
});
