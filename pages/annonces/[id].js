/**
 * app/parcelle/[id].js — 詳細
 * Zen-styled parcelle detail screen with stats, history, and actions.
 */

import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import CustomButton from "../../src/components/CustomButton";
import LoadingScreen from "../../src/components/LoadingScreen";
import { COLORS, SHADOWS, SIZES } from "../../src/constants/theme";
import { auth } from "../../src/services/firebase";
import {
    recupererParcelle,
    supprimerParcelle,
} from "../../src/services/parcelleService";
import { recupererRecoltesParParcelle } from "../../src/services/recolteService";

export default function ParcelleDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [parcelle, setParcelle] = useState(null);
  const [recoltes, setRecoltes] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      chargerDonnees();
    }, [id])
  );

  async function chargerDonnees() {
    try {
      setLoading(true);
      const user = auth.currentUser;
      const [parcelleData, recoltesData] = await Promise.all([
        recupererParcelle(id),
        recupererRecoltesParParcelle(id, user.uid),
      ]);
      setParcelle(parcelleData);
      setRecoltes(recoltesData);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  }

  function confirmerSuppression() {
    Alert.alert(
      "Supprimer",
      `Supprimer \"${parcelle.nom}\" ? Cette action est irréversible.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await supprimerParcelle(id);
              Alert.alert("Succès", "Parcelle supprimée.");
              router.back();
            } catch (_) {
              Alert.alert("Erreur", "Impossible de supprimer.");
            }
          },
        },
      ]
    );
  }

  function formaterDate(dateISO) {
    if (!dateISO) return "—";
    return new Date(dateISO).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function calculerPoidsTotal() {
    return recoltes.reduce((t, r) => t + (r.poids || 0), 0);
  }

  if (loading) return <LoadingScreen message="Chargement..." />;

  if (!parcelle) {
    return (
      <View style={styles.container}>
        <Text style={styles.erreur}>Parcelle introuvable.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ title: parcelle.nom }} />

      {/* Info card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌾 Informations</Text>
        <View style={styles.card}>
          <InfoRow label="Culture" value={parcelle.culturePrincipale} />
          <InfoRow label="Surface" value={`${parcelle.surface} ha`} />
          <InfoRow label="Période" value={parcelle.periodeRecolte || "—"} />
          <InfoRow label="Description" value={parcelle.description || "—"} last />
        </View>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Résumé</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{recoltes.length}</Text>
            <Text style={styles.statLabel}>Récoltes</Text>
          </View>
          <View style={[styles.statCard, styles.statCardAccent]}>
            <Text style={[styles.statValue, { color: COLORS.primaryDark }]}>
              {calculerPoidsTotal()} kg
            </Text>
            <Text style={styles.statLabel}>Poids total</Text>
          </View>
        </View>
      </View>

      {/* Add harvest */}
      <View style={styles.section}>
        <CustomButton
          title="Ajouter une récolte"
          icon="🌱"
          onPress={() =>
            router.push({
              pathname: "/parcelle/recolte",
              params: { parcelleId: id, parcelleName: parcelle.nom },
            })
          }
        />
      </View>

      {/* History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Historique</Text>
        {recoltes.length === 0 ? (
          <Text style={styles.emptyText}>Aucune récolte enregistrée.</Text>
        ) : (
          recoltes.map((r) => (
            <View key={r.id} style={styles.historyCard}>
              <View style={styles.historyRow}>
                <Text style={styles.historyDate}>{formaterDate(r.date)}</Text>
                <View style={styles.historyBadge}>
                  <Text style={styles.historyWeight}>{r.poids} kg</Text>
                </View>
              </View>
              {r.zone ? (
                <Text style={styles.historyZone}>{r.zone}</Text>
              ) : null}
            </View>
          ))
        )}
      </View>

      {/* Actions */}
      <View style={[styles.section, { paddingBottom: 40 }]}>
        <CustomButton
          title="Modifier la parcelle"
          onPress={() =>
            router.push({ pathname: "/parcelle/modifier", params: { id } })
          }
          variant="outline"
          icon="✏️"
          style={styles.actionButton}
        />
        <CustomButton
          title="Supprimer la parcelle"
          onPress={confirmerSuppression}
          variant="danger"
          icon="🗑️"
          style={styles.actionButton}
        />
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value, last }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  section: {
    paddingHorizontal: SIZES.paddingXl,
    paddingTop: SIZES.paddingLg,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: "300",
    color: COLORS.text,
    letterSpacing: 0.8,
    marginBottom: SIZES.paddingMd,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingXl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  infoRow: {
    paddingVertical: SIZES.paddingSm,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  infoLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: SIZES.lg,
    color: COLORS.text,
    fontWeight: "400",
  },
  statsRow: {
    flexDirection: "row",
    gap: SIZES.paddingMd,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    paddingVertical: SIZES.paddingLg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  statCardAccent: {
    backgroundColor: COLORS.primaryMuted + "30",
    borderColor: COLORS.primaryMuted,
  },
  statValue: {
    fontSize: SIZES.xxl,
    fontWeight: "600",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  historyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.paddingLg,
    marginBottom: SIZES.paddingSm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyDate: {
    fontSize: SIZES.md,
    fontWeight: "500",
    color: COLORS.text,
  },
  historyBadge: {
    backgroundColor: COLORS.primaryMuted,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: SIZES.radiusFull,
  },
  historyWeight: {
    fontSize: SIZES.sm,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  historyZone: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  emptyText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  actionButton: {
    marginBottom: SIZES.paddingMd,
  },
  erreur: {
    fontSize: SIZES.lg,
    color: COLORS.error,
    textAlign: "center",
    marginTop: 60,
  },
});
