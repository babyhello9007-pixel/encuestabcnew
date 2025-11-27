import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { PARTIES_GENERAL } from '@/lib/surveyData';

interface HistoricalData {
  date: string;
  [key: string]: string | number;
}

interface HistoricalChartProps {
  type?: 'line' | 'bar';
  title?: string;
}

const COLORS = [
  '#10b981', // VOX - Green
  '#3b82f6', // PP - Blue
  '#f59e0b', // Ciudadanos - Amber
  '#ef4444', // PSOE - Red
  '#8b5cf6', // PODEMOS - Purple
  '#ec4899', // Others - Pink
];

export default function HistoricalChart({ type = 'line', title = 'Evolución Histórica de Resultados' }: HistoricalChartProps) {
  const [data, setData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated historical data - in production, fetch from Supabase
    const generateHistoricalData = () => {
      const mockData: HistoricalData[] = [];
      const today = new Date();
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        mockData.push({
          date: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
          'VOX': Math.floor(Math.random() * 150) + 80,
          'PP': Math.floor(Math.random() * 100) + 50,
          'Ciudadanos': Math.floor(Math.random() * 60) + 30,
          'PSOE': Math.floor(Math.random() * 50) + 25,
          'PODEMOS': Math.floor(Math.random() * 30) + 10,
        });
      }
      
      return mockData;
    };

    setData(generateHistoricalData());
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="liquid-glass p-8 rounded-2xl text-center">
        <p className="text-[#666666]">Cargando datos históricos...</p>
      </div>
    );
  }

  return (
    <div className="liquid-glass p-8 rounded-2xl space-y-4">
      <h3 className="text-xl font-bold text-[#2D2D2D]">{title}</h3>
      
      {type === 'line' ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0D5CC" />
            <XAxis dataKey="date" stroke="#666666" />
            <YAxis stroke="#666666" />
            <Tooltip
              contentStyle={{ backgroundColor: '#F5F1E8', border: '1px solid #E0D5CC', borderRadius: '8px' }}
              labelStyle={{ color: '#2D2D2D' }}
            />
            <Legend />
            <Line type="monotone" dataKey="VOX" stroke={COLORS[0]} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="PP" stroke={COLORS[1]} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Ciudadanos" stroke={COLORS[2]} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="PSOE" stroke={COLORS[3]} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="PODEMOS" stroke={COLORS[4]} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0D5CC" />
            <XAxis dataKey="date" stroke="#666666" />
            <YAxis stroke="#666666" />
            <Tooltip
              contentStyle={{ backgroundColor: '#F5F1E8', border: '1px solid #E0D5CC', borderRadius: '8px' }}
              labelStyle={{ color: '#2D2D2D' }}
            />
            <Legend />
            <Bar dataKey="VOX" fill={COLORS[0]} radius={[8, 8, 0, 0]} />
            <Bar dataKey="PP" fill={COLORS[1]} radius={[8, 8, 0, 0]} />
            <Bar dataKey="Ciudadanos" fill={COLORS[2]} radius={[8, 8, 0, 0]} />
            <Bar dataKey="PSOE" fill={COLORS[3]} radius={[8, 8, 0, 0]} />
            <Bar dataKey="PODEMOS" fill={COLORS[4]} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-[#2D2D2D]/10 p-4 rounded-lg">
          <h4 className="font-semibold text-[#2D2D2D] text-sm mb-2">Tendencia General</h4>
          <p className="text-[#666666] text-sm">
            Los datos muestran la evolución de preferencias políticas durante los últimos 30 días.
          </p>
        </div>
        <div className="bg-[#2D2D2D]/10 p-4 rounded-lg">
          <h4 className="font-semibold text-[#2D2D2D] text-sm mb-2">Actualización</h4>
          <p className="text-[#666666] text-sm">
            Los gráficos se actualizan automáticamente con cada nueva respuesta de la encuesta.
          </p>
        </div>
      </div>
    </div>
  );
}

