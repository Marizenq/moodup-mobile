import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, FlatList, Dimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { fetchSubTriggers } from "@/services/suggestions";

const { width: screenWidth } = Dimensions.get("window");

type TriggerItem = {
  id: string;
  name: string;
};

export default function Sugestoes() {
  const { trigger } = useLocalSearchParams();

  const [triggersList, setTriggersList] = useState<TriggerItem[]>([]);
  const [selectedTrigger, setSelectedTrigger] = useState<string>("");
  const [subTriggers, setSubTriggers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Processar os gatilhos recebidos (múltiplos ou único)
  useEffect(() => {
    if (!trigger) return;

    const triggerValue = Array.isArray(trigger) ? trigger[0] : trigger;
    
    console.log("TRIGGER RECEBIDO NA TELA:", triggerValue);
    
    if (triggerValue.includes(',')) {
      const names = triggerValue.split(',').map(t => t.trim());
      const items = names.map((name, index) => ({
        id: String(index),
        name: name.toLowerCase()
      }));
      setTriggersList(items);
      setSelectedTrigger(items[0].name);
    } else {
      // 🔥 MESMO PARA 1 GATILHO, ADICIONAMOS À LISTA
      const items = [{ id: "0", name: triggerValue.toLowerCase() }];
      setTriggersList(items);
      setSelectedTrigger(triggerValue.toLowerCase());
    }
  }, [trigger]);

  // Carregar sub-triggers baseado no gatilho selecionado
  useEffect(() => {
    async function load() {
      if (!selectedTrigger) return;
      
      setLoading(true);
      setSelected(null);
      
      const data = await fetchSubTriggers(selectedTrigger);
      
      console.log("DADOS RECEBIDOS:", data);
      
      setSubTriggers(data || []);
      setLoading(false);
    }
    
    load();
  }, [selectedTrigger]);

  const getEmoji = (name: string) => {
    switch(name) {
      case "trabalho": return "💼";
      case "escola": return "📚";
      case "familia": return "👨‍👩‍👧";
      case "amizades": return "👫";
      case "dinheiro": return "💰";
      case "saude": return "🩺";
      case "sono": return "😴";
      case "transito": return "🚗";
      default: return "💬";
    }
  };

  const renderTriggerItem = ({ item }: { item: TriggerItem }) => {
    const isActive = selectedTrigger === item.name;
    const displayName = item.name.charAt(0).toUpperCase() + item.name.slice(1);
    
    return (
      <Pressable
        onPress={() => setSelectedTrigger(item.name)}
        style={{
          width: screenWidth * 0.4,
          backgroundColor: isActive ? "rgba(45,212,191,.15)" : "#0B1220",
          borderRadius: 16,
          padding: 12,
          alignItems: "center",
          borderWidth: 1,
          borderColor: isActive ? "#2dd4bf" : "#243041",
          marginHorizontal: 4,
        }}
      >
        <Text style={{
          fontSize: 32,
          marginBottom: 8,
          opacity: isActive ? 1 : 0.7,
        }}>
          {getEmoji(item.name)}
        </Text>
        <Text style={{
          color: isActive ? "#2dd4bf" : "#CBD5E1",
          fontSize: 14,
          fontWeight: isActive ? "bold" : "500",
        }}>
          {displayName}
        </Text>
      </Pressable>
    );
  };

  // 🔥 Se ainda estiver carregando a lista de gatilhos, mostra loading
  if (triggersList.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0B0F19", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#94A3B8" }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0F19" }}>
      {/* 🔥 CARROSSEL - AGORA APARECE PARA 1 OU MAIS GATILHOS */}
      <View style={{
        backgroundColor: "#0F172A",
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#1F2937",
      }}>
        <Text style={{
          color: "#94A3B8",
          fontSize: 12,
          paddingHorizontal: 16,
          marginBottom: 12,
        }}>
          📌 {triggersList.length === 1 ? "1 gatilho identificado" : `${triggersList.length} gatilhos identificados`}
        </Text>
        
        <FlatList
          data={triggersList}
          renderItem={renderTriggerItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 12 }}
          style={{ minHeight: 100 }} // 🔥 GARANTE ALTURA MÍNIMA
        />
        
        {triggersList.length > 1 && (
          <Text style={{
            color: "#64748B",
            fontSize: 10,
            textAlign: "center",
            marginTop: 12,
          }}>
            👆 Deslize para o lado e toque para ver mais opções
          </Text>
        )}
      </View>

      {/* CONTEÚDO PRINCIPAL */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ color: "#fff", fontSize: 18, marginBottom: 16 }}>
          O que mais contribuiu para isso?
        </Text>

        {loading ? (
          <Text style={{ color: "#94A3B8", textAlign: "center", marginTop: 40 }}>
            Carregando sugestões...
          </Text>
        ) : subTriggers.length === 0 ? (
          <Text style={{ color: "#64748B" }}>
            Nenhuma opção encontrada para este gatilho.
          </Text>
        ) : (
          <>
            {subTriggers.map((item) => (
              <Pressable
                key={`${item.id}-${item.name}`}
                onPress={() => setSelected(item)}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 8,
                  backgroundColor: selected?.id === item.id ? "#1D4ED8" : "transparent",
                }}
              >
                <Text style={{ color: "#E5E7EB" }}>• {item.name}</Text>
              </Pressable>
            ))}

            {selected && (
              <View style={{ marginTop: 20 }}>
                {selected.intro_text && (
                  <Text style={{ color: "#A7F3D0", marginBottom: 10 }}>
                    {selected.intro_text}
                  </Text>
                )}

                {selected.suggestions?.map((s: any) => (
                  <View key={`${selected.id}-${s.id}`} style={{ flexDirection: "row", marginBottom: 6 }}>
                    <Text style={{ color: "#2dd4bf", marginRight: 8 }}>•</Text>
                    <Text style={{ color: "#CBD5E1", flex: 1 }}>
                      {s.text}
                    </Text>
                  </View>
                ))}

                {selected.closing_text && (
                  <Text style={{ color: "#93C5FD", marginTop: 10 }}>
                    {selected.closing_text}
                  </Text>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}