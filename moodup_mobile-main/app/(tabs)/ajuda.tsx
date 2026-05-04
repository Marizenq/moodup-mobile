import { api } from "@/services/api";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
    ActivityIndicator,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

type Mood = {
  id: number;
  level: number;
  mood?: string;
  title?: string;
};

type Resource = {
  id: number;
  type: "video" | "musica" | "livro" | "exercicio";
  title: string;
  description?: string | null;
  url?: string | null;
  author?: string | null;
  duration_minutes?: number | null;
  tags?: string[] | null;
};

export default function AjudaScreen() {
  const router = useRouter();

  const [lastMood, setLastMood] = useState<Mood | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Recarregar quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    try {
      setLoading(true);
      
      // 1) último mood
      const moodsRes = await api.get("/moods?per_page=1");
      const mood = moodsRes.data?.data?.[0] ?? null;
      
      console.log("📊 Último mood carregado:", mood);
      console.log("📊 Nível do mood:", mood?.level);
      
      setLastMood(mood);

      // 2) recursos do back
      const resRes = await api.get("/resources?per_page=50");
      const list: Resource[] = resRes.data?.data ?? [];
      setResources(list);
    } catch (e: any) {
      console.log("Erro Ajuda:", e?.response?.status, e?.response?.data, e?.message);
    } finally {
      setLoading(false);
    }
  }

  // Forçar recarga ao entrar na tela
  useEffect(() => {
    loadData();
  }, []);

  const level = lastMood?.level ?? 3;
  
  // Determinar o estado baseado no nível
  const getMoodState = () => {
    if (level <= 2) return "bad";
    if (level === 3) return "neutral";
    return "good";
  };
  
  const moodState = getMoodState();

  const byType = useMemo(() => {
    const map = {
      exercicio: [] as Resource[],
      video: [] as Resource[],
      musica: [] as Resource[],
      livro: [] as Resource[],
    };

    for (const r of resources) {
      if (r?.type && map[r.type]) map[r.type].push(r);
    }

    return map;
  }, [resources]);

  function openUrl(url?: string | null) {
    if (!url) return;
    Linking.openURL(url);
  }

  function renderSection(title: string, items: Resource[]) {
    if (!items || items.length === 0) return null;

    return (
      <View style={{ marginTop: 20 }}>
        <Text style={s.sectionTitle}>{title}</Text>

        <View style={{ gap: 10, marginTop: 10 }}>
          {items.map((it) => (
            <View key={String(it.id)} style={s.card}>
              <Text style={s.cardTitle}>{it.title}</Text>

              {!!it.author && <Text style={s.meta}>Por: {it.author}</Text>}

              {!!it.duration_minutes && (
                <Text style={s.meta}>Duração: {it.duration_minutes} min</Text>
              )}

              {!!it.description && <Text style={s.cardDesc}>{it.description}</Text>}

              {!!it.url && (
                <Pressable style={s.btn} onPress={() => openUrl(it.url)}>
                  <Text style={s.btnText}>Abrir</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={s.loading}>
        <ActivityIndicator size="large" color="#2dd4bf" />
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
      <Text style={s.title}>Auxílio Personalizado</Text>

      {/* CONTEÚDO PARA HUMOR BOM/ÓTIMO (level >= 4) */}
      {moodState === "good" && (
        <>
          <View style={s.goodCard}>
            <Text style={s.goodTitle}>🌟 Que bom que você está bem!</Text>
            <Text style={s.goodText}>
              Aproveite este momento para se desenvolver ainda mais. Separamos algumas dicas para você:
            </Text>
          </View>

          {renderSection("📚 Desenvolvimento pessoal", byType.livro)}
          {renderSection("🎥 Vídeos inspiradores", byType.video)}
          {renderSection("🎵 Músicas para energizar", byType.musica)}
          {renderSection("🧘 Exercícios opcionais", byType.exercicio)}
        </>
      )}

      {/* CONTEÚDO PARA HUMOR NEUTRO (level === 3) */}
      {moodState === "neutral" && (
        <>
          <View style={s.neutralCard}>
            <Text style={s.neutralTitle}>🌿 Dia estável</Text>
            <Text style={s.neutralText}>
              Manter o equilíbrio é importante. Aqui estão algumas sugestões para continuar bem:
            </Text>
          </View>

          {renderSection("🧘 Exercícios leves", byType.exercicio)}
          {renderSection("🎥 Vídeos recomendados", byType.video)}
          {renderSection("🎵 Músicas recomendadas", byType.musica)}
        </>
      )}

      {/* CONTEÚDO PARA HUMOR RUIM (level <= 2) */}
      {moodState === "bad" && (
        <>
          <View style={s.alertCard}>
            <Text style={s.alertTitle}>💙 Você não está sozinha</Text>
            <Text style={s.alertText}>
              Percebemos que seu último registro indica um momento difícil. 
              Aqui estão alguns recursos que podem ajudar:
            </Text>
          </View>

          {/* Botão CVV 188 */}
          <Pressable 
            style={s.cvvButton} 
            onPress={() => Linking.openURL("tel:188")}
          >
            <Text style={s.cvvButtonText}>📞 Ligar para o CVV (188)</Text>
            <Text style={s.cvvButtonSubtext}>Atendimento gratuito 24h</Text>
          </Pressable>

          {/* Botão Psicóloga */}
          <Pressable 
            style={s.psicologaButton} 
            onPress={() => Linking.openURL("mailto:psicologa@moodup.com.br")}
          >
            <Text style={s.psicologaButtonText}>🎓 Falar com a psicóloga</Text>
            <Text style={s.psicologaButtonSubtext}>Envie um e-mail para agendar</Text>
          </Pressable>

          {/* Botão Conversar com IA */}
          <Pressable 
            style={s.aiButton} 
            onPress={() => router.push("/(tabs)/sugestoes")}
          >
            <Text style={s.aiButtonText}>💬 Conversar com a IA</Text>
            <Text style={s.aiButtonSubtext}>Desabafe de forma anônima</Text>
          </Pressable>

          {renderSection("🧘 Exercícios para agora", byType.exercicio)}
          {renderSection("🎥 Vídeos para acalmar", byType.video)}
          {renderSection("🎵 Músicas para relaxar", byType.musica)}
        </>
      )}

      {/* Se vier vazio do back */}
      {resources.length === 0 && (
        <Text style={[s.meta, { marginTop: 16 }]}>
          Nenhum recurso encontrado. Verifique se o seed rodou e se a rota /resources está funcionando.
        </Text>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F19" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0B0F19" },

  title: { color: "#E5E7EB", fontSize: 24, fontWeight: "900", marginBottom: 8 },

  // Cards de humor BOM
  goodCard: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  goodTitle: { color: "#22c55e", fontSize: 18, fontWeight: "900", marginBottom: 8 },
  goodText: { color: "#CBD5E1", fontSize: 14, lineHeight: 20 },

  // Cards de humor NEUTRO
  neutralCard: {
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(234, 179, 8, 0.3)",
  },
  neutralTitle: { color: "#eab308", fontSize: 18, fontWeight: "900", marginBottom: 8 },
  neutralText: { color: "#CBD5E1", fontSize: 14, lineHeight: 20 },

  // Cards de alerta (humor RUIM)
  alertCard: {
    backgroundColor: "rgba(250, 204, 21, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(250, 204, 21, 0.3)",
  },
  alertTitle: { color: "#facc15", fontSize: 18, fontWeight: "900", marginBottom: 8 },
  alertText: { color: "#CBD5E1", fontSize: 14, lineHeight: 20 },

  // Botão CVV
  cvvButton: {
    backgroundColor: "#cf6060",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 16,
    alignItems: "center",
  },
  cvvButtonText: { color: "#4e4646", fontSize: 16, fontWeight: "900" },
  cvvButtonSubtext: { color: "#4e4646", fontSize: 12, marginTop: 4 },

  // Botão Psicóloga
  psicologaButton: {
    backgroundColor: "#72dbc1",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: "center",
  },
  psicologaButtonText: { color: "#4e4646", fontSize: 16, fontWeight: "900" },
  psicologaButtonSubtext: { color: "#4e4646", fontSize: 12, marginTop: 4 },

  // Botão IA
  aiButton: {
    backgroundColor: "#85a3e2",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: "center",
  },
  aiButtonText: { color: "#4e4646", fontSize: 16, fontWeight: "900" },
  aiButtonSubtext: { color: "#4e4646", fontSize: 12, marginTop: 4 },

  sectionTitle: { color: "#E5E7EB", fontSize: 18, fontWeight: "800", marginTop: 16 },

  card: {
    backgroundColor: "#0F172A",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.08)",
  },

  cardTitle: { color: "#E5E7EB", fontWeight: "900" },
  meta: { color: "#94A3B8", marginTop: 6, fontSize: 12 },
  cardDesc: { color: "#94A3B8", marginTop: 8 },

  btn: {
    marginTop: 12,
    backgroundColor: "#2dd4bf",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#08101a", fontWeight: "900" },
});