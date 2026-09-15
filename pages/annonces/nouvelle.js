/**
 * app/parcelle/nouvelle.js — 新規
 * Zen-styled new parcelle form inside a card.
 */

import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import CustomButton from "../../src/components/CustomButton";
import CustomInput from "../../src/components/CustomInput";
import { COLORS, SHADOWS, SIZES } from "../../src/constants/theme";
import { auth } from "../../src/services/firebase";
import { creerParcelle } from "../../src/services/parcelleService";
import { estNombrePositif, estNonVide } from "../../src/utils/validation";

export default function ParcelleFormScreen() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [surface, setSurface] = useState("");
  const [culturePrincipale, setCulturePrincipale] = useState("");
  const [periodeRecolte, setPeriodeRecolte] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreurs, setErreurs] = useState({});

  function validerFormulaire() {
    const e = {};
    if (!estNonVide(nom)) e.nom = "Le nom est obligatoire.";
    if (!surface || !estNombrePositif(parseFloat(surface))) e.surface = "Surface invalide.";
    if (!estNonVide(culturePrincipale)) e.culturePrincipale = "Culture obligatoire.";
    setErreurs(e);
    return Object.keys(e).length === 0;
  }

  async function gererCreation() {
    if (!validerFormulaire()) return;
    setLoading(true);
    try {
      const user = auth.currentUser;
      await creerParcelle(
        {
          nom: nom.trim(),
          surface: parseFloat(surface),
          culturePrincipale: culturePrincipale.trim(),
          periodeRecolte: periodeRecolte.trim(),
          description: description.trim(),
        },
        user.uid
      );
      Alert.alert("✅ Succès", "Parcelle créée.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (_) {
      Alert.alert("Erreur", "Impossible de créer la parcelle.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen options={{ title: "Nouvelle parcelle" }} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>🌾 Créer une parcelle</Text>
        <View style={styles.card}>
          <CustomInput label="Nom *" value={nom} onChangeText={setNom} placeholder="Champ Nord" error={erreurs.nom} />
          <CustomInput label="Surface (ha) *" value={surface} onChangeText={setSurface} placeholder="2.5" keyboardType="decimal-pad" error={erreurs.surface} />
          <CustomInput label="Culture *" value={culturePrincipale} onChangeText={setCulturePrincipale} placeholder="Blé, Maïs, Tomates…" error={erreurs.culturePrincipale} />
          <CustomInput label="Période de récolte" value={periodeRecolte} onChangeText={setPeriodeRecolte} placeholder="Juin — Août" />
          <CustomInput label="Description" value={description} onChangeText={setDescription} placeholder="Notes supplémentaires…" multiline />
          <CustomButton title="Créer" onPress={gererCreation} loading={loading} icon="✨" style={styles.button} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.paddingXl, paddingBottom: 40 },
  heading: {
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
  button: { marginTop: SIZES.paddingSm },
});
