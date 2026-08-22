import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { geoJsonToSpanish } from '@/lib/provinceGeoJsonMapper';
import { calcularEscanosProvincia, calcularEscanosJuvenilesProvincia } from '@/lib/dhondtByProvince';
import { resolveCanonicalParty, type CanonicalPartyIndex } from '@/lib/canonicalPartyConfig';

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
  partyIndex: CanonicalPartyIndex;
}

export const SpainMapRealistic: React.FC<SpainMapRealisticProps> = ({
  votosPorProvincia,
  provinciaMetricsMap = {},
  onProvinceClick,
  isYouthAssociations = false,
  partyIndex,
}) => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getPartyBrand = useCallback(
    (partyId: string) => resolveCanonicalParty(partyId, partyIndex),
    [partyIndex],
  );
  const getColorForParty = useCallback(
    (partyId: string) => getPartyBrand(partyId)?.color || '#6B7280',
    [getPartyBrand],
  );
  const getPartyDisplayName = useCallback(
    (partyId: string) => getPartyBrand(partyId)?.display_name || partyId,
    [getPartyBrand],
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
      <div style="width: 100%; padding: 10px; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(12px); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); font-family: sans-serif; color: #e2e8f0; font-size: 13px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
          <h3 style="font-size: 12px; font-weight: 700; color: #f1f5f9; margin: 0; text-transform: uppercase;">${spanishProvinceName}</h3>
          <span style="font-size: 8px; font-weight: 600; color: #10b981; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); padding: 2px 5px; border-radius: 10px;">
            Activo
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;">
          <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 6px; border-radius: 6px;">
            <p style="font-size: 8px; font-weight: 600; color: #94a3b8; margin: 0 0 2px 0; text-transform: uppercase;">Votos</p>
            <p style="font-size: 11px; font-weight: 700; color: #fff; margin: 0;">${totalVotos.toLocaleString()}</p>
          </div>
          ${
            metrics
              ? `
            <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 6px; border-radius: 6px;">
              <p style="font-size: 8px; font-weight: 600; color: #94a3b8; margin: 0 0 2px 0; text-transform: uppercase;">Edad</p>
              <p style="font-size: 11px; font-weight: 700; color: #fff; margin: 0;">${metrics.edad_promedio.toFixed(0)}</p>
            </div>
            <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 6px; border-radius: 6px; grid-column: 1 / -1;">
              <p style="font-size: 8px; font-weight: 600; color: #94a3b8; margin: 0 0 2px 0; text-transform: uppercase;">Ideología: ${metrics.ideologia_promedio.toFixed(1)}/10</p>
            </div>
          `
              : ''
          }
        </div>

        <div style="margin-top: 8px;">
          <p style="font-size: 8px; font-weight: 600; color: #94a3b8; margin: 0 0 6px 0; text-transform: uppercase;">Partidos</p>
          <div style="max-height: 150px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;">
            ${Object.entries(data.votos)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([partido, votos]) => {
                const porcentaje = totalVotos > 0 ? ((votos / totalVotos) * 100).toFixed(1) : '0.0';
                const escanosPartido = escanos[partido] || 0;
                const partyColor = getColorForParty(partido);
                const partyBrand = getPartyBrand(partido);
                const logo = partyBrand?.logo_url
                  ? `<img src="${partyBrand.logo_url}" alt="" style="width:18px;height:18px;object-fit:contain;border-radius:50%;background:#fff;flex:0 0 auto;" onerror="this.style.display='none'" />`
                  : `<span style="width:8px;height:8px;border-radius:50%;background:${partyColor};display:inline-block;flex:0 0 auto;"></span>`;

                return `
                  <div style="display: flex; align-items: center; gap: 6px; padding: 6px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; font-size: 10px;">
                    ${logo}
                    <div style="flex: 1; min-width: 0;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                        <p style="font-weight: 600; color: #e2e8f0; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${getPartyDisplayName(partido)}</p>
                        <span style="font-weight: 700; color: #cbd5e1; margin-left: 4px;">${porcentaje}%</span>
                      </div>
                      <div style="height: 3px; background: #1e293b; border-radius: 2px; overflow: hidden;">
                        <div style="height: 100%; border-radius: 2px; width: ${porcentaje}%; background-color: ${partyColor};"></div>
                      </div>
                    </div>
                    <div style="text-align: right; flex-shrink: 0;">
                      <p style="font-weight: 600; color: #94a3b8; margin: 0; font-size: 9px;">${votos.toLocaleString()}</p>
                      ${
                        escanosPartido > 0
                          ? `<span style="font-weight: 700; color: #fbbf24; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.2); padding: 1px 3px; border-radius: 3px; display: inline-block; margin-top: 2px; font-size: 8px;">${escanosPartido}e</span>`
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
      maxWidth: 280,
      minWidth: 200,
      className: 'custom-dark-popup',
      autoPan: true,
      autoPanPaddingTopLeft: [50, 50],
      autoPanPaddingBottomRight: [50, 50],
    });
  };

  if (loading) {
    return (
      <div className="w-full h-[300px] sm:h-[400px] md:h-[600px] flex flex-col items-center justify-center p-4 sm:p-8 bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="w-8 h-8 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-xs sm:text-sm font-medium tracking-wide">Cargando cartografía del mapa...</p>
      </div>
    );
  }

  if (error || !geoJsonData) {
    return (
      <div className="w-full h-[300px] sm:h-[400px] md:h-[600px] flex items-center justify-center p-4 sm:p-8 bg-slate-950 rounded-2xl border border-red-900/30">
        <p className="text-red-400 text-xs sm:text-sm font-medium">{error || 'Error al cargar el mapa'}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2 sm:space-y-4 font-sans">
      {/* Banner de Estado (Frosted Glass Dark Mode) */}
      <div className="w-full p-2 sm:p-4 bg-emerald-950/30 backdrop-blur-md border border-emerald-500/20 rounded-xl sm:rounded-2xl shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] flex items-center gap-2 sm:gap-3">
        <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <p className="text-emerald-300 font-medium text-xs tracking-wide">
          <strong className="font-semibold text-emerald-200">Mapa en vivo:</strong> Datos por provincia
        </p>
      </div>

      {/* Contenedor del Mapa con diseño Modo Noche / Liquid Edge */}
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[600px] bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
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
      <style>{`
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 12px !important;
        }
        .leaflet-popup-tip-container {
          display: none !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          padding: 0 !important;
          width: auto !important;
        }
        .leaflet-popup {
          margin-bottom: 20px !important;
        }
        @media (max-width: 768px) {
          .leaflet-popup-content-wrapper {
            max-width: 280px !important;
          }
          .leaflet-popup {
            margin-bottom: 10px !important;
          }
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
