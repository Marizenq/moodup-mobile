import React, { useMemo, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Linking } from "react-native";
import { api } from "@/services/api";

const MOODS = [
  { key: "muito_triste", emoji: "😞", label: "Muito mal" },
  { key: "triste", emoji: "😕", label: "Mal" },
  { key: "neutro", emoji: "😐", label: "Ok" },
  { key: "bem", emoji: "🙂", label: "Bem" },
  { key: "muito_bem", emoji: "😁", label: "Ótimo" },
] as const;

const TRIGGERS = [
  "Trabalho",
  "Escola/Faculdade",
  "Família",
  "Trânsito",
  "Amizades",
  "Dinheiro",
  "Saúde",
  "Sono",
  "Outro",
] as const;

export default function CreateMood() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  const [moodKey, setMoodKey] =
    useState<(typeof MOODS)[number]["key"]>("neutro");
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const moodSelected = useMemo(
    () => MOODS.find((m) => m.key === moodKey),
    [moodKey]
  );

  const lvl = Number(level);

  function toggleTrigger(t: string) {
    setSelectedTriggers((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function levelText(n: number) {
    if (n <= 1) return "Muito baixo";
    if (n === 2) return "Baixo";
    if (n === 3) return "Ok";
    if (n === 4) return "Bom";
    return "Ótimo";
  }

  async function handleCreate() {
    setErro("");

    if (!title.trim()) {
      setErro("Digite um título.");
      return;
    }

    // Se nível estiver baixo, mostramos o modal (sem bloquear salvar)
    if (level <= 2) {
      setShowHelp(true);
    }

    try {
      setLoading(true);

    //   await api.post("/moods", {
    //     title: title.trim(),
    //     level,
    //     date,
    //     note: note.trim() ? note.trim() : undefined,
    //     mood: moodKey,
    //     triggers: selectedTriggers,
    //   });

    await api.post("/moods", {
  title: title.trim(),
  level: lvl,          // ✅ garante number
  score: lvl,          // ✅ fallback caso o backend ainda use score em algum lugar
  date,
  note: note.trim() ? note.trim() : null,
  mood: moodKey,
  triggers: selectedTriggers,
});

      router.replace("/(tabs)" as any);
    } catch (e: any) {
      setErro(
        e?.response?.data?.message ||
          e?.message ||
          "Não foi possível criar o mood."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={s.container}>
        <ScrollView
          style={{ flex: 1 }} // ✅ garante scroll
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.card}>
            <Text style={s.title}>Criar mood</Text>
            <Text style={s.subtitle}>Registre como você está hoje</Text>

            <Text style={s.label}>Humor</Text>
            <View style={s.row}>
              {MOODS.map((m) => {
                const active = m.key === moodKey;
                return (
                  <Pressable
                    key={m.key}
                    onPress={() => setMoodKey(m.key)}
                    style={[s.emojiBtn, active && s.emojiBtnActive]}
                  >
                    <Text style={s.emoji}>{m.emoji}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={s.muted}>
              Selecionado: {moodSelected?.emoji} • {moodSelected?.label}
            </Text>

            <Text style={s.label}>Título</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Dia produtivo"
              placeholderTextColor="#6B7280"
              style={s.input}
            />

            <Text style={s.label}>Nível (1 a 5)</Text>
            <View style={s.levelRow}>
              {[1, 2, 3, 4, 5].map((n) => {
                const active = level === n;
                return (
                  <Pressable
                    key={n}
                    onPress={() => setLevel(n as any)}
                    style={[s.levelBtn, active && s.levelBtnActive]}
                  >
                    <Text style={[s.levelText, active && s.levelTextActive]}>
                      {n}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={s.muted}>Como está hoje: {levelText(level)}</Text>

            <Text style={s.label}>Data (YYYY-MM-DD)</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="2026-02-23"
              placeholderTextColor="#6B7280"
              style={s.input}
            />

            <Text style={s.label}>O que pode ter estragado o dia?</Text>
            <View style={s.triggersWrap}>
              {TRIGGERS.map((t) => {
                const active = selectedTriggers.includes(t);
                return (
                  <Pressable
                    key={t}
                    onPress={() => toggleTrigger(t)}
                    style={[s.chip, active && s.chipActive]}
                  >
                    <Text style={[s.chipText, active && s.chipTextActive]}>
                      {t}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={s.label}>Observação (opcional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="O que aconteceu hoje?"
              placeholderTextColor="#6B7280"
              style={[s.input, { height: 110 }]}
              multiline
            />

            {erro ? <Text style={s.errorText}>{erro}</Text> : null}

            <Pressable
              onPress={handleCreate}
              disabled={loading}
              style={[s.button, loading && { opacity: 0.6 }]}
            >
              <Text style={s.buttonText}>
                {loading ? "SALVANDO..." : "SALVAR"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              style={{ marginTop: 12, alignItems: "center" }}
            >
              <Text style={s.linkText}>Voltar</Text>
            </Pressable>

            {/* ✅ respiro extra pra não cortar no final */}
            <View style={{ height: 24 }} />
          </View>
        </ScrollView>

        {/* Modal de apoio (nível baixo) */}
        <Modal
          visible={showHelp}
          transparent
          animationType="fade"
          onRequestClose={() => setShowHelp(false)}
        >
          <View style={s.modalBackdrop}>
            <View style={s.modalCard}>
              <Text style={s.modalTitle}>Ei, vi que hoje tá pesado.</Text>
              <Text style={s.modalText}>
                Se você quiser, dá pra buscar apoio agora. Você não precisa
                passar por isso sozinha.
              </Text>

              <Pressable
                style={s.modalBtn}
                onPress={() => Linking.openURL("tel:188")}
              >
                <Text style={s.modalBtnText}>Ligar para o CVV (188)</Text>
              </Pressable>

              <Pressable
                style={[
                  s.modalBtn,
                  { backgroundColor: "rgba(255,255,255,.06)" },
                ]}
                onPress={() => {
                  setShowHelp(false);
                  router.push("/ai" as any);
                }}
              >
                <Text style={[s.modalBtnText, { color: "#e7ecff" }]}>
                  Falar com a IA agora
                </Text>
              </Pressable>

              <Pressable
                style={[s.modalBtn, { backgroundColor: "#2dd4bf" }]}
                onPress={() => {
                  setShowHelp(false);
                  // router.push("/(tabs)/psicologa" as any)
                }}
              >
                <Text style={[s.modalBtnText, { color: "#08101a" }]}>
                  Contato da psicóloga
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowHelp(false)}
                style={{ marginTop: 10 }}
              >
                <Text style={[s.linkText, { textAlign: "center" }]}>
                  Fechar
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F19",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  card: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    backgroundColor: "#0F172A",
    borderColor: "#1F2937",
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
  },
  title: {
    color: "#E5E7EB",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: { color: "#94A3B8", marginBottom: 18 },
  label: {
    color: "#CBD5E1",
    marginBottom: 6,
    marginTop: 10,
    fontSize: 13,
  },
  input: {
    backgroundColor: "#0B1220",
    borderColor: "#243041",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#E5E7EB",
  },
  row: { flexDirection: "row", gap: 10 },
  emojiBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#243041",
    backgroundColor: "#0B1220",
    alignItems: "center",
    justifyContent: "center",
  },
  emojiBtnActive: { borderColor: "rgba(109,94,252,.9)" },
  emoji: { fontSize: 26 },
  muted: { color: "#94A3B8", marginTop: 6 },

  levelRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  levelBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#243041",
    backgroundColor: "#0B1220",
    alignItems: "center",
    justifyContent: "center",
  },
  levelBtnActive: {
    borderColor: "#2563EB",
    backgroundColor: "rgba(37,99,235,.15)",
  },
  levelText: { color: "#E5E7EB", fontWeight: "800" },
  levelTextActive: { color: "#93C5FD" },

  triggersWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#243041",
    backgroundColor: "#0B1220",
  },
  chipActive: {
    borderColor: "#2dd4bf",
    backgroundColor: "rgba(45,212,191,.12)",
  },
  chipText: { color: "#E5E7EB", fontWeight: "700", fontSize: 12 },
  chipTextActive: { color: "#A7F3D0" },

  errorText: { color: "#ff6b6b", marginTop: 10, fontSize: 13 },
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "800", letterSpacing: 0.4 },
  linkText: { color: "#E5E7EB", opacity: 0.9 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#0F172A",
    borderColor: "rgba(255,255,255,.10)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
  },
  modalTitle: { color: "#E5E7EB", fontSize: 18, fontWeight: "900" },
  modalText: { color: "#94A3B8", marginTop: 8, marginBottom: 12 },
  modalBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  modalBtnText: { color: "#fff", fontWeight: "900" },
});