import { useState, useEffect, useRef } from 'react';
import { getPartyColor } from '@/lib/partyConfig';
import { PARTIES_GENERAL } from '@/lib/surveyData';
import { calcularEscanosProvincia } from '@/lib/dhondtByProvince';
import { VerifySeatsModal } from '@/components/VerifySeatsModal';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

interface ProvinceData {
  name: string;
  votos: Record<string, number>;
  ganador: string;
  porcentajeGanador: number;
}

interface SpainMapRealisticProps {
  votosPorProvincia: Record<string, Record<string, number>>;
  onProvinceClick?: (province: string, data: ProvinceData, votos: Record<string, number>, escanos: Record<string, number>) => void;
}

// Mapeo de IDs del SVG a nombres de provincias
const SVG_PROVINCE_MAPPING: Record<string, string> = {
  "pr_la_corunya": "La Coruña",
  "pr_lugo": "Lugo",
  "pr_ourense": "Ourense",
  "pr_pontevedra": "Pontevedra",
  "pr_asturias": "Asturias",
  "pr_cantabria": "Cantabria",
  "pr_vizcaya": "Vizcaya",
  "pr_guipuzcoa": "Guipúzcoa",
  "pr_alava": "Álava",
  "pr_navarra": "Navarra",
  "pr_la_rioja": "La Rioja",
  "pr_huesca": "Huesca",
  "pr_teruel": "Teruel",
  "pr_zaragoza": "Zaragoza",
  "pr_barcelona": "Barcelona",
  "pr_girona": "Girona",
  "pr_lleida": "Lleida",
  "pr_tarragona": "Tarragona",
  "pr_leon": "León",
  "pr_palencia": "Palencia",
  "pr_valladolid": "Valladolid",
  "pr_burgos": "Burgos",
  "pr_soria": "Soria",
  "pr_segovia": "Segovia",
  "pr_avila": "Ávila",
  "pr_salamanca": "Salamanca",
  "pr_zamora": "Zamora",
  "pr_madrid": "Madrid",
  "pr_guadalajara": "Guadalajara",
  "pr_cuenca": "Cuenca",
  "pr_ciudad_real": "Ciudad Real",
  "pr_albacete": "Albacete",
  "pr_toledo": "Toledo",
  "pr_caceres": "Cáceres",
  "pr_badajoz": "Badajoz",
  "pr_castellon": "Castellón",
  "pr_valencia": "Valencia",
  "pr_alicante": "Alicante",
  "pr_murcia": "Murcia",
  "pr_jaen": "Jaén",
  "pr_cordoba": "Córdoba",
  "pr_sevilla": "Sevilla",
  "pr_huelva": "Huelva",
  "pr_cadiz": "Cádiz",
  "pr_malaga": "Málaga",
  "pr_granada": "Granada",
  "pr_almeria": "Almería",
  "pr_ceuta": "Ceuta",
  "pr_melilla": "Melilla",
};

/**
 * Mapa realista de España usando SVG de Wikipedia
 * Colorea provincias según el partido ganador
 */
export const SpainMapRealistic: React.FC<SpainMapRealisticProps> = ({
  votosPorProvincia,
  onProvinceClick,
}) => {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyData, setVerifyData] = useState<{
    provincia: string;
    votos: Record<string, number>;
    escanos: Record<string, number>;
    escanosPorPartido: Record<string, number>;
  } | null>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Calcular el partido ganador por provincia
  const getProvinceData = (province: string): ProvinceData => {
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
  };

  const handleProvinceClick = (province: string) => {
    const data = getProvinceData(province);
    const votos = votosPorProvincia[province] || {};
    const escanos = calcularEscanosProvincia(province, votos);
    setSelectedProvince(province);
    onProvinceClick?.(province, data, votos, escanos);
  };

  // Cargar y procesar el SVG
  useEffect(() => {
    const loadSVG = async () => {
      try {
        const response = await fetch('/assets/spain-provinces.svg');
        let svgText = await response.text();

        // Crear un parser para el SVG
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');

        // Colorear cada provincia
        Object.entries(SVG_PROVINCE_MAPPING).forEach(([svgId, provinceName]) => {
          const element = svgDoc.getElementById(svgId);
          if (element) {
            const data = getProvinceData(provinceName);
            const hasData = Object.keys(votosPorProvincia).includes(provinceName);
            const color = hasData ? getPartyColor(data.ganador) : '#CCCCCC';
            
            element.setAttribute('fill', color);
            element.setAttribute('class', 'province-path');
            element.setAttribute('data-province', provinceName);
            element.style.stroke = 'white';
            element.style.strokeWidth = '1.5';
            element.style.cursor = 'pointer';
            element.style.transition = 'all 0.2s ease';
            
            // Agregar evento de click
            element.addEventListener('click', () => handleProvinceClick(provinceName));
            
            // Agregar evento de hover
            element.addEventListener('mouseenter', () => {
              element.style.strokeWidth = '2.5';
              element.style.opacity = '0.8';
            });
            element.addEventListener('mouseleave', () => {
              element.style.strokeWidth = '1.5';
              element.style.opacity = '1';
            });
          }
        });

        // Serializar el SVG modificado
        const serializer = new XMLSerializer();
        const modifiedSvgText = serializer.serializeToString(svgDoc);

        // Renderizar en el contenedor
        if (svgContainerRef.current) {
          svgContainerRef.current.innerHTML = modifiedSvgText;
        }
      } catch (error) {
        console.error('Error loading SVG:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSVG();
  }, [votosPorProvincia]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-400">Cargando mapa...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Llamada a la acción */}
      <div className="p-4 bg-gradient-to-r from-red-900 to-red-800 rounded-lg border border-red-600">
        <p className="text-white text-sm mb-2">
          <strong>Tu provincia no aparece?</strong> Ayúdanos respondiendo la encuesta.
        </p>
        <a
          href="https://encuestabc-6q57y6uz.manus.space/nano-encuesta"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-white text-red-900 font-semibold rounded hover:bg-gray-100 transition-colors text-sm"
        >
          Responder Encuesta
        </a>
      </div>

      {/* Leyenda de partidos */}
      <div className="flex flex-wrap gap-3 p-4 bg-gray-900 rounded-lg">
        {Object.entries(PARTIES_GENERAL).map(([key, party]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: getPartyColor(key) }}
            />
            <span className="text-xs text-gray-300">{party.name}</span>
          </div>
        ))}
        {/* Leyenda para provincias sin datos */}
        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-600">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#CCCCCC' }} />
          <span className="text-xs text-gray-300">Sin datos</span>
        </div>
      </div>

      {/* SVG del mapa */}
      <div className="w-full flex justify-center p-4 bg-gray-900 rounded-lg overflow-auto">
        <div
          ref={svgContainerRef}
          className="w-full flex justify-center"
          style={{
            maxWidth: '100%',
          }}
        />
      </div>

      {/* Botón de verificación de escaños */}
      {selectedProvince && Object.keys(votosPorProvincia[selectedProvince] || {}).length > 0 && (
        <div className="p-4 bg-blue-100 rounded-lg border border-blue-300 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900">Verificar Escaños</h3>
            <p className="text-sm text-blue-700">Comprueba si la distribución de escaños es correcta según la Ley d'Hondt</p>
          </div>
          <Button
            onClick={() => {
              const votos = votosPorProvincia[selectedProvince] || {};
              const escanos = calcularEscanosProvincia(selectedProvince, votos);
              const escanosPorPartido = calcularEscanosProvincia(selectedProvince, votos);
              setVerifyData({
                provincia: selectedProvince,
                votos,
                escanos,
                escanosPorPartido,
              });
              setShowVerifyModal(true);
            }}
            className="flex items-center gap-2"
            variant="default"
          >
            <CheckCircle2 className="w-4 h-4" />
            Verificar
          </Button>
        </div>
      )}

      {/* Información de la provincia seleccionada */}
      {selectedProvince && (
        <div className="p-4 bg-gray-900 rounded-lg">
          <h3 className="text-lg font-bold text-white mb-3">{selectedProvince}</h3>
          <div className="space-y-2">
            {Object.entries(
              votosPorProvincia[selectedProvince] || {}
            )
              .sort(([, a], [, b]) => b - a)
              .map(([partido, votos]) => {
                const total = Object.values(
                  votosPorProvincia[selectedProvince] || {}
                ).reduce((a, b) => a + b, 0);
                const porcentaje = total > 0 ? (votos / total) * 100 : 0;
                const escanosPart = calcularEscanosProvincia(selectedProvince, votosPorProvincia[selectedProvince] || {})[partido] || 0;
                const partyName = PARTIES_GENERAL[partido as keyof typeof PARTIES_GENERAL]?.name || partido;

                return (
                  <div key={partido} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: getPartyColor(partido) }}
                      />
                      <span className="text-gray-300">{partyName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-semibold">{votos}</span>
                      <span className="text-gray-400 ml-2">({porcentaje.toFixed(1)}%) - {escanosPart} escaños</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Modal de verificación de escaños */}
      {verifyData && (
        <VerifySeatsModal
          isOpen={showVerifyModal}
          onClose={() => setShowVerifyModal(false)}
          provincia={verifyData.provincia}
          votosProvincia={verifyData.votos}
          escanosProvincia={verifyData.escanos}
          escanosPorPartido={verifyData.escanosPorPartido}
        />
      )}
    </div>
  );
};
