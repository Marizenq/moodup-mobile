import { MOCK_SUGGESTIONS } from "@/constants/mockSuggestions";

export async function fetchSubTriggers(trigger: string) {
  const key = trigger?.toLowerCase().trim();

  console.log("TRIGGER RECEBIDO:", key);

  return MOCK_SUGGESTIONS[key] || [];
}