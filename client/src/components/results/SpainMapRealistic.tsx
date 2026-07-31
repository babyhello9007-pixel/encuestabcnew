import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { geoJsonToSpanish } from '@/lib/provinceGeoJsonMapper';
import { calcularEscanosProvincia, calcularEscanosJuvenilesProvincia } from '@/lib/dhondtByProvince';

interface ProvinceData {
  name: string;
  votos: Record<string, number>;
  ganador: string;
  porcentajeGanador: number;
}

interface SpainMapRealisticProps {
  votosPorProvincia: Record<string, Record<string, number>>;
  provinciaMetricsMap?: Record<string, { edad_promedio: number; ideologia_promedio: number }>;
  onProvinceClick?: (province: string, data: ProvinceData, votos: Record<string, number>, escanos: Record<string, number>) => void;
  isYouthAssociations?: boolean;
  partyMeta?: Record<string, { color?: string }>;
}

export const SpainMapRealistic: React.FC<SpainMapRealisticProps> = ({
  votosPorProvincia,
  provinciaMetricsMap = {},
  onProvinceClick,
  isYouthAssociations = false,
  partyMeta = {},
}) => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getColorForParty = useCallback(
    (partyId: string) => partyMeta[partyId]?.color || '#6B7280',
    [partyMeta]
  );

  // Carga diferida del GeoJSON
  useEffect(() => {
    const loadGeoJson = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/georef-spain-provincia.geojson');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setGeoJsonData(data);
        setError(null);
      } catch (err) {
        console.error('Error cargando GeoJSON:', err);
        setError('Error al cargar la cartografía de las provincias');
      } finally {
        setLoading(false);
      }
    };

    loadGeoJson();
  }, []);

  const getProvinceData = useCallback(
    (province: string): ProvinceData => {
      const votos = votosPorProvincia[province] || {};
      const totalVotos = Object.values(votos).reduce((a, b) => a + b, 0);

      let ganador = '';
      let maxVotos = 0;

      for (const [partido, votoCount] of Object.entries(votos)) {
        if (votoCount > maxVotos) {
          maxVotos = votoCount;
          ganador = partido;
        }
      }

      return {
        name: province,
        votos,
        ganador,
        porcentajeGanador: totalVotos > 0 ? (maxVotos / totalVotos) * 100 : 0,
      };
    },
    [votosPorProvincia]
  );

  const handleProvinceClick = (provinceName: string) => {
    const data = getProvinceData(provinceName);
    const votos = votosPorProvincia[provinceName] || {};
    const escanos = isYouthAssociations
      ? calcularEscanosJuvenilesProvincia(provinceName, votos)
      : calcularEscanosProvincia(provinceName, votos);

    onProvinceClick?.(provinceName, data, votos, escanos);
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const geoJsonProvinceName = feature.properties?.prov_name;
    if (!geoJsonProvinceName) return;

    const spanishProvinceName = geoJsonToSpanish(geoJsonProvinceName);
    const hasData = spanishProvinceName in votosPorProvincia;

    if (!hasData) {
      (layer as L.Path).setStyle({
        fillColor: '#1E293B',
        fillOpacity: 0.4,
        color: '#334155',
        weight: 1,
      });
      return;
    }

    const data = getProvinceData(spanishProvinceName);
    const color = getColorForParty(data.ganador);

    (layer as L.Path).setStyle({
      fillColor: color,
      fillOpacity: 0.75,
      color: '#475569',
      weight: 1,
    });

    layer.on('click', () => {
      handleProvinceClick(spanishProvinceName);
    });

    layer.on('mouseover', () => {
      (layer as L.Path).setStyle({
        weight: 2,
        fillOpacity: 0.95,
        color: '#38BDF8', // Highlight Cyan
      });
    });

    layer.on('mouseout', () => {
      (layer as L.Path).setStyle({
        weight: 1,
        fillOpacity: 0.75,
        color: '#475569',
      });
    });

    const metrics = provinciaMetricsMap[spanishProvinceName];
    const totalVotos = Object.values(data.votos).reduce((a, b) => a + b, 0);
    const escanos = isYouthAssociations
      ? calcularEscanosJuvenilesProvincia(spanishProvinceName, data.votos)
      : calcularEscanosProvincia(spanishProvinceName, data.votos);

    // Contenido Popup HTML estilizado en Modo Noche con efecto Frosted Glass
    const popupContentHtml = `
      <div class="w-80 p-4 bg-slate-900/85 backdrop-blur-md text-slate-100 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] font-sans">
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
          <h3 class="text-base font-bold tracking-wide text-slate-50 uppercase">${spanishProvinceName}</h3>
          <span class="text-[10px] font-medium tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
            Activo
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2 mb-4">
          <div class="bg-white/5 backdrop-blur-sm border border-white/5 p-2 rounded-xl">
            <p class="text-slate-400 text-[10px] font-semibold tracking-wider uppercase">Total Votos</p>
            <p class="text-base font-bold text-white mt-0.5">${totalVotos.toLocaleString()}</p>
          </div>
          ${
            metrics
              ? `
            <div class="bg-white/5 backdrop-blur-sm border border-white/5 p-2 rounded-xl">
              <p class="text-slate-400 text-[10px] font-semibold tracking-wider uppercase">Edad Media</p>
              <p class="text-base font-bold text-white mt-0.5">${metrics.edad_promedio.toFixed(1)} <span class="text-xs font-normal text-slate-400">años</span></p>
            </div>
            <div class="bg-white/5 backdrop-blur-sm border border-white/5 p-2 rounded-xl col-span-2 flex justify-between items-center">
              <p class="text-slate-400 text-[10px] font-semibold tracking-wider uppercase">Posición Ideológica</p>
              <p class="text-sm font-bold text-sky-400">${metrics.ideologia_promedio.toFixed(1)} <span class="text-slate-500">/ 10</span></p>
            </div>
          `
              : ''
          }
        </div>

        <div class="space-y-2">
          <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Resultados por Partido</p>
          <div class="max-h-56 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            ${Object.entries(data.votos)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([partido, votos]) => {
                const porcentaje = totalVotos > 0 ? ((votos / totalVotos) * 100).toFixed(1) : '0.0';
                const escanosPartido = escanos[partido] || 0;
                const partyColor = getColorForParty(partido);

                return `
                  <div class="flex items-center gap-2 p-2 bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/5">
                    <div class="flex-1 min-w-0">
                      <div class="flex justify-between items-center mb-1">
                        <p class="text-xs font-semibold text-slate-200 truncate">${partido}</p>
                        <span class="text-xs font-bold text-slate-300">${porcentaje}%</span>
                      </div>
                      <div class="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-500" style="width: ${porcentaje}%; background-color: ${partyColor}; border-right: 1px solid rgba(255,255,255,0.4);"></div>
                      </div>
                    </div>
                    <div class="text-right flex-shrink-0 flex flex-col items-end pl-1">
                      <p class="text-[11px] font-medium text-slate-400">${votos.toLocaleString()}</p>
                      ${
                        escanosPartido > 0
                          ? `<span class="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded-md mt-0.5">${escanosPartido} esc.</span>`
                          : ''
                      }
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = popupContentHtml;

    layer.bindPopup(container, {
      maxWidth: 340,
      className: 'custom-dark-popup',
    });
  };

  if (loading) {
    return (
      <div className="w-full h-[600px] flex flex-col items-center justify-center p-8 bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl">
        <div class="w-8 h-8 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mb-4"></div>
        <p class="text-slate-400 text-sm font-medium tracking-wide">Cargando cartografía del mapa...</p>
      </div>
    );
  }

  if (error || !geoJsonData) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center p-8 bg-slate-950 rounded-2xl border border-red-900/30">
        <p className="text-red-400 text-sm font-medium">{error || 'Error al cargar el mapa'}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 font-sans">
      {/* Banner de Estado (Frosted Glass Dark Mode) */}
      <div className="w-full p-4 bg-emerald-950/30 backdrop-blur-md border border-emerald-500/20 rounded-2xl shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] flex items-center gap-3">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <p className="text-emerald-300 font-medium text-xs md:text-sm tracking-wide">
          <strong className="font-semibold text-emerald-200">Mapa en tiempo real:</strong> Mostrando los datos y proyecciones de escaños por provincia.
        </p>
      </div>

      {/* Contenedor del Mapa con diseño Modo Noche / Liquid Edge */}
      <div className="relative w-full h-[600px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
        <MapContainer
          center={[40, -3.5]}
          zoom={6}
          style={{ height: '100%', width: '100%', background: '#020617' }}
        >
          {/* CartoDB Dark Matter Tiles para una estética Noche / Dark Mode limpia */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <GeoJSON data={geoJsonData} onEachFeature={onEachFeature} />
        </MapContainer>
      </div>

      {/* Estilos inyectados para Leaflet Popups oscuros */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-popup-tip-container {
          display: none !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        /* Custom scrollbar para los resultados */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
};
