import { supabase } from './supabase';

export interface PartyMetrics {
  partyId: string;
  partyName: string;
  totalVotes: number;
  averageAge: number;
  averageIdeology: number;
  ageDistribution: { range: string; count: number }[];
  ideologyDistribution: { range: string; count: number }[];
}

export const calculateMetricsByParty = async (
  activeTab: "general" | "youth"
): Promise<PartyMetrics[]> => {
  try {
    // Obtener todas las respuestas
    const { data: responses, error } = await supabase
      .from("respuestas")
      .select("partido_general, partido_juvenil, edad, ideologia");

    if (error) throw error;
    if (!responses || responses.length === 0) return [];

    // Agrupar por partido
    const partyData: Record<string, any> = {};

    responses.forEach((response: any) => {
      const partyId = activeTab === "general" ? response.partido_general : response.partido_juvenil;
      
      if (!partyId) return;

      if (!partyData[partyId]) {
        partyData[partyId] = {
          votes: 0,
          ages: [],
          ideologies: [],
        };
      }

      partyData[partyId].votes += 1;
      
      if (response.edad) {
        partyData[partyId].ages.push(response.edad);
      }
      
      if (response.ideologia) {
        partyData[partyId].ideologies.push(response.ideologia);
      }
    });

    // Calcular métricas
    const metrics: PartyMetrics[] = Object.entries(partyData).map(([partyId, data]) => {
      const averageAge = data.ages.length > 0
        ? Math.round(data.ages.reduce((a: number, b: number) => a + b, 0) / data.ages.length * 10) / 10
        : 0;

      const averageIdeology = data.ideologies.length > 0
        ? Math.round(data.ideologies.reduce((a: number, b: number) => a + b, 0) / data.ideologies.length * 10) / 10
        : 0;

      // Distribución de edades
      const ageDistribution = calculateDistribution(data.ages, [
        { range: "18-25", min: 18, max: 25 },
        { range: "26-35", min: 26, max: 35 },
        { range: "36-50", min: 36, max: 50 },
        { range: "51-65", min: 51, max: 65 },
        { range: "65+", min: 65, max: 150 },
      ]);

      // Distribución de ideología
      const ideologyDistribution = calculateDistribution(data.ideologies, [
        { range: "1-3 (Izquierda)", min: 1, max: 3 },
        { range: "4-6 (Centro)", min: 4, max: 6 },
        { range: "7-10 (Derecha)", min: 7, max: 10 },
      ]);

      return {
        partyId,
        partyName: partyId,
        totalVotes: data.votes,
        averageAge,
        averageIdeology,
        ageDistribution,
        ideologyDistribution,
      };
    });

    return metrics;
  } catch (error) {
    console.error("Error calculating metrics by party:", error);
    return [];
  }
};

const calculateDistribution = (
  values: number[],
  ranges: { range: string; min: number; max: number }[]
) => {
  return ranges.map(({ range, min, max }) => ({
    range,
    count: values.filter(v => v >= min && v <= max).length,
  }));
};

export const getMetricsForParty = async (
  partyId: string,
  activeTab: "general" | "youth"
): Promise<PartyMetrics | null> => {
  const allMetrics = await calculateMetricsByParty(activeTab);
  return allMetrics.find(m => m.partyId === partyId) || null;
};

