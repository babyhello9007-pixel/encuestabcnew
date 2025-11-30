import { describe, it, expect } from 'vitest';
import {
  calcularEscanosGeneralesPorProvincia,
  calcularEscanosProvincia,
  getEscanosPorProvincia,
  getTotalEscanos,
} from '../dhondtByProvince';

describe('Ley d\'Hondt por Provincia', () => {
  describe('getTotalEscanos', () => {
    it('debe retornar 350 escaños totales', () => {
      const total = getTotalEscanos();
      expect(total).toBe(350);
    });
  });

  describe('getEscanosPorProvincia', () => {
    it('debe retornar un objeto con todas las provincias', () => {
      const escanos = getEscanosPorProvincia();
      expect(Object.keys(escanos).length).toBeGreaterThan(0);
      expect(escanos['Madrid']).toBe(37);
      expect(escanos['Barcelona']).toBe(32);
    });

    it('debe sumar 350 escaños en total', () => {
      const escanos = getEscanosPorProvincia();
      const total = Object.values(escanos).reduce((a, b) => a + b, 0);
      expect(total).toBe(350);
    });
  });

  describe('calcularEscanosProvincia', () => {
    it('debe calcular escaños para una provincia con votos válidos', () => {
      const votos = {
        PP: 100,
        PSOE: 80,
        VOX: 50,
        SUMAR: 30,
      };
      
      const escanos = calcularEscanosProvincia('Madrid', votos);
      
      // Madrid tiene 37 escaños
      const totalEscanos = Object.values(escanos).reduce((a, b) => a + b, 0);
      expect(totalEscanos).toBe(37);
    });

    it('debe aplicar el umbral del 3% dentro de la provincia', () => {
      const votos = {
        PP: 100,
        PSOE: 80,
        PEQUEÑO: 1, // Menos del 3%
      };
      
      const escanos = calcularEscanosProvincia('Barcelona', votos);
      
      // PEQUEÑO no debe tener escaños por no superar el 3%
      expect(escanos['PEQUEÑO']).toBeUndefined();
      expect(escanos['PP']).toBeGreaterThan(0);
      expect(escanos['PSOE']).toBeGreaterThan(0);
    });

    it('debe distribuir escaños proporcionalmente', () => {
      const votos = {
        PP: 100,
        PSOE: 100,
        VOX: 100,
      };
      
      const escanos = calcularEscanosProvincia('Valencia', votos);
      
      // Con votos iguales, deben tener escaños similares (Valencia tiene 16 escaños)
      const total = Object.values(escanos).reduce((a, b) => a + b, 0);
      expect(total).toBe(16);
      // Los tres partidos deben tener escaños similares
      expect(Math.abs(escanos['PP'] - escanos['PSOE'])).toBeLessThanOrEqual(1);
    });
  });

  describe('calcularEscanosGeneralesPorProvincia', () => {
    it('debe calcular escaños totales a nivel nacional', () => {
      const votosPorProvincia: Record<string, Record<string, number>> = {
        'Madrid': {
          PP: 100,
          PSOE: 80,
          VOX: 50,
        },
        'Barcelona': {
          PP: 50,
          PSOE: 100,
          ERC: 80,
        },
      };
      
      const escanos = calcularEscanosGeneralesPorProvincia(votosPorProvincia);
      
      // Debe tener escaños para los partidos
      expect(escanos['PP']).toBeGreaterThan(0);
      expect(escanos['PSOE']).toBeGreaterThan(0);
    });

    it('debe sumar escaños provinciales correctamente', () => {
      const votosPorProvincia: Record<string, Record<string, number>> = {
        'Madrid': {
          PP: 100,
          PSOE: 80,
        },
        'Barcelona': {
          PP: 50,
          PSOE: 100,
        },
      };
      
      const escanos = calcularEscanosGeneralesPorProvincia(votosPorProvincia);
      const total = Object.values(escanos).reduce((a, b) => a + b, 0);
      
      // Total debe ser 37 (Madrid) + 32 (Barcelona) = 69
      expect(total).toBe(69);
    });

    it('debe manejar provincias sin votos', () => {
      const votosPorProvincia: Record<string, Record<string, number>> = {
        'Madrid': {
          PP: 100,
          PSOE: 80,
        },
      };
      
      const escanos = calcularEscanosGeneralesPorProvincia(votosPorProvincia);
      
      // Debe retornar un objeto válido
      expect(typeof escanos).toBe('object');
      expect(Object.keys(escanos).length).toBeGreaterThan(0);
    });

    it('debe aplicar el umbral del 3% en cada provincia independientemente', () => {
      const votosPorProvincia: Record<string, Record<string, number>> = {
        'Madrid': {
          PP: 100,
          PSOE: 80,
          PEQUEÑO: 1, // Menos del 3% en Madrid
        },
        'Barcelona': {
          PP: 50,
          PSOE: 100,
          PEQUEÑO: 80, // Más del 3% en Barcelona
        },
      };
      
      const escanos = calcularEscanosGeneralesPorProvincia(votosPorProvincia);
      
      // PEQUEÑO debe tener escaños de Barcelona pero no de Madrid
      expect(escanos['PEQUEÑO']).toBeGreaterThan(0);
    });
  });
});
