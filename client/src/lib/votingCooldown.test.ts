import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkVotingCooldown, recordVote, getUserIP } from './votingCooldown';
import { supabase } from './supabase';

// Mock de supabase
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('votingCooldown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkVotingCooldown', () => {
    it('debe permitir votar si no hay registro previo', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });
      
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await checkVotingCooldown('192.168.1.1');
      
      expect(result.canVote).toBe(true);
      expect(result.remainingMinutes).toBe(0);
    });

    it('debe bloquear votos dentro del período de cooldown', async () => {
      const now = new Date();
      const lastVoteTime = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutos atrás

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { last_vote: lastVoteTime.toISOString() },
              error: null,
            }),
          }),
        }),
      });
      
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await checkVotingCooldown('192.168.1.1');
      
      expect(result.canVote).toBe(false);
      expect(result.remainingMinutes).toBeGreaterThan(0);
      expect(result.remainingMinutes).toBeLessThanOrEqual(5);
    });

    it('debe permitir votar después del período de cooldown', async () => {
      const now = new Date();
      const lastVoteTime = new Date(now.getTime() - 16 * 60 * 1000); // 16 minutos atrás

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { last_vote: lastVoteTime.toISOString() },
              error: null,
            }),
          }),
        }),
      });
      
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await checkVotingCooldown('192.168.1.1');
      
      expect(result.canVote).toBe(true);
      expect(result.remainingMinutes).toBe(0);
    });

    it('debe manejar errores de base de datos permitiendo votar', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error'),
            }),
          }),
        }),
      });
      
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await checkVotingCooldown('192.168.1.1');
      
      expect(result.canVote).toBe(true);
      expect(result.remainingMinutes).toBe(0);
    });
  });

  describe('recordVote', () => {
    it('debe registrar un voto exitosamente', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      });
      
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await recordVote('192.168.1.1');
      
      expect(result).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('voting_cooldown');
    });

    it('debe manejar errores al registrar un voto', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({
          error: new Error('Insert error'),
        }),
      });
      
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await recordVote('192.168.1.1');
      
      expect(result).toBe(false);
    });
  });

  describe('getUserIP', () => {
    it('debe obtener la IP del usuario', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ ip: '203.0.113.42' }),
      });

      const ip = await getUserIP();
      
      expect(ip).toBe('203.0.113.42');
    });

    it('debe retornar "unknown" si hay error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const ip = await getUserIP();
      
      expect(ip).toBe('unknown');
    });
  });
});
