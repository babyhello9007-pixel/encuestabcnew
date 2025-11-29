import { describe, it, expect } from 'vitest';
import { normalizeProvinceName, normalizeProvinceInResponse } from '../provinceNormalizer';

describe('provinceNormalizer', () => {
  describe('normalizeProvinceName', () => {
    it('should convert Vizcaya to Bizkaia', () => {
      expect(normalizeProvinceName('Vizcaya')).toBe('Bizkaia');
    });

    it('should convert Guipúzcoa to Gipuzkoa', () => {
      expect(normalizeProvinceName('Guipúzcoa')).toBe('Gipuzkoa');
    });

    it('should keep other province names unchanged', () => {
      expect(normalizeProvinceName('Madrid')).toBe('Madrid');
      expect(normalizeProvinceName('Barcelona')).toBe('Barcelona');
      expect(normalizeProvinceName('Valencia')).toBe('Valencia');
    });

    it('should handle null and undefined', () => {
      expect(normalizeProvinceName(null)).toBeNull();
      expect(normalizeProvinceName(undefined)).toBeNull();
    });

    it('should handle empty string', () => {
      expect(normalizeProvinceName('')).toBeNull();
    });
  });

  describe('normalizeProvinceInResponse', () => {
    it('should normalize provincia field in response object', () => {
      const response = {
        provincia: 'Vizcaya',
        edad: 25,
        voto: 'VOX'
      };
      const normalized = normalizeProvinceInResponse(response);
      expect(normalized.provincia).toBe('Bizkaia');
      expect(normalized.edad).toBe(25);
      expect(normalized.voto).toBe('VOX');
    });

    it('should handle response with Guipúzcoa', () => {
      const response = {
        provincia: 'Guipúzcoa',
        edad: 30
      };
      const normalized = normalizeProvinceInResponse(response);
      expect(normalized.provincia).toBe('Gipuzkoa');
    });

    it('should preserve other fields in response', () => {
      const response = {
        provincia: 'Madrid',
        edad: 25,
        voto_generales: 'PP',
        nota_ejecutivo: 5
      };
      const normalized = normalizeProvinceInResponse(response);
      expect(normalized.provincia).toBe('Madrid');
      expect(normalized.edad).toBe(25);
      expect(normalized.voto_generales).toBe('PP');
      expect(normalized.nota_ejecutivo).toBe(5);
    });

    it('should handle null provincia', () => {
      const response = {
        provincia: null,
        edad: 25
      };
      const normalized = normalizeProvinceInResponse(response);
      expect(normalized.provincia).toBeNull();
    });
  });
});
