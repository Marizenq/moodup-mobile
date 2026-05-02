import { api } from "@/services/api";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    async function load() {
      try {
        // 1) último mood
        const moodsRes = await api.get("/moods?per_page=1");
        const mood = moodsRes.data?.data?.[0] ?? null;
        setLastMood(mood);

        // 2) recursos do back (paginado)
        const resRes = await api.get("/resources?per_page=50");
        const list: Resource[] = resRes.data?.data ?? [];
        setResources(list);
      } catch (e: any) {
        console.log("Erro Ajuda:", e?.response?.status, e?.response?.data, e?.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const level = lastMood?.level ?? 3;

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

      {/* ALERTA: nível baixo */}
      {level <= 2 && (
        <>
          <Text style={s.alert}>
            Percebemos que seu último registro indica um momento difícil.
          </Text>

          <Pressable style={s.aiBtn} onPress={() => router.push("/(tabs)/ai" as any)}>
            <Text style={s.aiBtnText}>Conversar com a IA agora</Text>
          </Pressable>

          {/* (Opcional) botões CVV/psicóloga - você pode colocar aqui */}
          {/*
          <Pressable style={[s.btn, { marginTop: 10 }]} onPress={() => Linking.openURL("tel:188")}>
            <Text style={s.btnText}>Ligar para o CVV (188)</Text>
          </Pressable>
          */}

          {renderSection("Exercícios rápidos", byType.exercicio)}
          {renderSection("Vídeos para acalmar", byType.video)}
          {renderSection("Músicas para relaxar", byType.musica)}
        </>
      )}

      {/* NEUTRO */}
      {level === 3 && (
        <>
          {renderSection("Exercícios leves", byType.exercicio)}
          {renderSection("Vídeos recomendados", byType.video)}
          {renderSection("Músicas recomendadas", byType.musica)}
        </>
      )}

      {/* BOM */}
      {level >= 4 && (
        <>
          {renderSection("Desenvolvimento pessoal", byType.livro)}
          {renderSection("Vídeos recomendados", byType.video)}
          {renderSection("Músicas recomendadas", byType.musica)}
          {renderSection("Exercícios opcionais", byType.exercicio)}
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

  title: { color: "#E5E7EB", fontSize: 24, fontWeight: "900" },

  alert: { color: "#facc15", marginTop: 12, fontWeight: "600" },

  sectionTitle: { color: "#E5E7EB", fontSize: 16, fontWeight: "800" },

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

  aiBtn: {
    marginTop: 14,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  aiBtnText: { color: "#fff", fontWeight: "900" },
});