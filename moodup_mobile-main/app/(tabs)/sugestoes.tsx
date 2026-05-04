import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { fetchSubTriggers } from "@/services/suggestions";

export default function Sugestoes() {
  const { trigger } = useLocalSearchParams();

  const [subTriggers, setSubTriggers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  // 🔥 map robusto (resolve seu problema)

  // 🔥 useEffect corrigido
  useEffect(() => {
    async function load() {
      if (!trigger) return;

      const triggerValue = Array.isArray(trigger) ? trigger[0] : trigger;

      const key = String(triggerValue).toLowerCase().trim();

      const data = await fetchSubTriggers(key);

setSelected(null); // 🔥 NOVA LINHA

setSubTriggers(data || []);

      console.log("KEY FINAL:", key);
      console.log("DADOS:", data);

      setSubTriggers(data || []);
    }

    load();
  }, [trigger]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0B0F19", padding: 20 }}>
      <Text style={{ color: "#fff", fontSize: 18, marginBottom: 16 }}>
        O que mais contribuiu para isso?
      </Text>

      {/* 🔹 LISTA */}
      {subTriggers.length === 0 ? (
        <Text style={{ color: "#64748B" }}>
          Nenhuma opção encontrada para esse gatilho.
        </Text>
      ) : (
        subTriggers.map((item) => (
          <Pressable
            key={`${item.id}-${item.name}`}
            onPress={() => setSelected(item)}
            style={{
              padding: 10,
              borderRadius: 8,
              marginBottom: 8,
              backgroundColor:
                selected?.id === item.id ? "#1D4ED8" : "transparent",
            }}
          >
            <Text style={{ color: "#E5E7EB" }}>• {item.name}</Text>
          </Pressable>
        ))
      )}

      {/* 🔹 RESPOSTA */}
      {selected && (
        <View style={{ marginTop: 20 }}>
          {selected.intro_text && (
            <Text style={{ color: "#A7F3D0", marginBottom: 10 }}>
              {selected.intro_text}
            </Text>
          )}

          {selected.suggestions?.map((s: any) => (
            <Text key={`${selected.id}-${s.id}`} style={{ color: "#CBD5E1", marginBottom: 4 }}>
              • {s.text}
            </Text>
          ))}

          {selected.closing_text && (
            <Text style={{ color: "#93C5FD", marginTop: 10 }}>
              {selected.closing_text}
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}
