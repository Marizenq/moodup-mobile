import { api } from "@/services/api";
import React, { useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

type Msg = { id: string; role: "user" | "ai"; text: string };

const INITIAL: Msg[] = [
  { id: "m0", role: "ai", text: "Oi! Eu sou a IA do MoodUp. Como você está agora?" },
];

export default function AIChatScreen() {
  const listRef = useRef<FlatList<Msg>>(null);

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ guardamos em ordem “natural” (do mais antigo pro mais novo)
  const [msgs, setMsgs] = useState<Msg[]>(INITIAL);

  // ✅ lista para render (inverted usa a ordem invertida)
  const data = useMemo(() => [...msgs].reverse(), [msgs]);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true }); // inverted -> offset 0 é “fim”
    });
  }

  async function send() {
    const message = text.trim();
    if (!message || loading) return;

    const userMsg: Msg = { id: String(Date.now()), role: "user", text: message };
    setMsgs((prev) => [...prev, userMsg]);
    setText("");
    scrollToBottom();

    try {
      setLoading(true);

      // ✅ por enquanto manda só a mensagem
      const res = await api.post("/ai/chat", { message });

      const replyText = res.data?.reply ?? "Não consegui responder agora.";
      const aiMsg: Msg = { id: String(Date.now()) + "-ai", role: "ai", text: replyText };

      setMsgs((prev) => [...prev, aiMsg]);
      scrollToBottom();
    } catch (e: any) {
      Alert.alert("Ops", "Não consegui falar com a IA agora.");
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    Alert.alert("Limpar conversa", "Deseja apagar as mensagens desta conversa?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Limpar", style: "destructive", onPress: () => setMsgs(INITIAL) },
    ]);
  }

  // ✅ no web: Enter envia / Shift+Enter quebra linha
  function onKeyPressWeb(e: any) {
    if (Platform.OS !== "web") return;
    if (e?.nativeEvent?.key === "Enter" && !e?.nativeEvent?.shiftKey) {
      e.preventDefault?.();
      send();
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>IA do MoodUp</Text>
          <Text style={s.subtitle}>Um papo rápido pra te ajudar a organizar o que você sente.</Text>
        </View>

        <Pressable onPress={clearChat} style={s.clearBtn}>
          <Text style={s.clearBtnText}>Limpar</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(item) => item.id}
        inverted
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.listContent}
        renderItem={({ item }) => (
          <View style={[s.row, item.role === "user" ? s.rowRight : s.rowLeft]}>
            <View style={[s.bubble, item.role === "user" ? s.userBubble : s.aiBubble]}>
              <Text style={s.bubbleText}>{item.text}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={
          loading ? (
            <View style={s.typingRow}>
              <View style={[s.bubble, s.aiBubble, { flexDirection: "row", alignItems: "center", gap: 8 }]}>
                <ActivityIndicator size="small" color="#E5E7EB" />
                <Text style={[s.bubbleText, { opacity: 0.9 }]}>Digitando…</Text>
              </View>
            </View>
          ) : null
        }
      />

      <View style={s.composer}>
        <TextInput
          value={text}
          onChangeText={setText}
          onKeyPress={onKeyPressWeb}
          placeholder="Digite aqui..."
          placeholderTextColor="#6B7280"
          style={s.input}
          multiline
        />

        <Pressable
          onPress={send}
          disabled={loading || !text.trim()}
          style={({ pressed }) => [
            s.btn,
            pressed && { opacity: 0.9 },
            (loading || !text.trim()) && { opacity: 0.55 },
          ]}
        >
          <Text style={s.btnText}>{loading ? "..." : "Enviar"}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F19" },

  header: {
    padding: 16,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: { color: "#E5E7EB", fontSize: 22, fontWeight: "800" },
  subtitle: { color: "#94A3B8", marginTop: 4 },

  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.12)",
    backgroundColor: "rgba(255,255,255,.06)",
  },
  clearBtnText: { color: "#E5E7EB", fontWeight: "800", fontSize: 12 },

  listContent: { padding: 16, gap: 10 },

  row: { width: "100%", flexDirection: "row" },
  rowLeft: { justifyContent: "flex-start" },
  rowRight: { justifyContent: "flex-end" },

  bubble: {
    padding: 12,
    borderRadius: 14,
    maxWidth: Platform.OS === "web" ? 560 : "85%",
  },
  userBubble: { backgroundColor: "#2563EB" },
  aiBubble: { backgroundColor: "rgba(255,255,255,.08)" },
  bubbleText: { color: "#E5E7EB", fontSize: 14, lineHeight: 20 },

  typingRow: { width: "100%", flexDirection: "row", justifyContent: "flex-start", marginTop: 6 },

  composer: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,.08)",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    color: "#E5E7EB",
    backgroundColor: "#0B1220",
    borderWidth: 1,
    borderColor: "#243041",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  btn: { backgroundColor: "#2dd4bf", borderRadius: 12, paddingHorizontal: 14, justifyContent: "center" },
  btnText: { color: "#08101a", fontWeight: "900" },
});