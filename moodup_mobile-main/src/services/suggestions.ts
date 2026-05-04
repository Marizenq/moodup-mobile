// services/suggestions.ts
import { MOCK_SUGGESTIONS } from "@/constants/mockSuggestions";

export async function fetchSubTriggers(trigger: string) {
  const key = trigger?.toLowerCase().trim();
  console.log("TRIGGER RECEBIDO NO FETCH:", key);
  console.log("DADOS ENCONTRADOS:", MOCK_SUGGESTIONS[key]);
  
  return MOCK_SUGGESTIONS[key] || [];
}