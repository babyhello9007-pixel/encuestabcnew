import { beforeEach, describe, expect, it, vi } from 'vitest';
import { COOLDOWN_SECONDS, checkVotingCooldown, recordVote, getUserIP } from './votingCooldown';
import { supabase } from './supabase';

vi.mock('./supabase', () => ({ supabase: { from: vi.fn() } }));

describe('votingCooldown', () => {
  beforeEach(() => vi.clearAllMocks());

  const mockLastVote = (lastVote: Date | null, error: Error | null = null) => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: lastVote ? { last_vote: lastVote.toISOString() } : null, error }),
        }),
      }),
    } as never);
  };

  it('permite votar sin un registro previo', async () => {
    mockLastVote(null);
    await expect(checkVotingCooldown('192.168.1.1')).resolves.toEqual({ canVote: true, remainingSeconds: 0 });
  });

  it('bloquea durante los 15 segundos configurados', async () => {
    mockLastVote(new Date(Date.now() - 5_000));
    const result = await checkVotingCooldown('192.168.1.1');
    expect(COOLDOWN_SECONDS).toBe(15);
    expect(result.canVote).toBe(false);
    expect(result.remainingSeconds).toBeGreaterThanOrEqual(9);
    expect(result.remainingSeconds).toBeLessThanOrEqual(10);
  });

  it('permite votar después de 15 segundos', async () => {
    mockLastVote(new Date(Date.now() - 16_000));
    await expect(checkVotingCooldown('192.168.1.1')).resolves.toEqual({ canVote: true, remainingSeconds: 0 });
  });

  it('permite votar si la consulta de cooldown falla', async () => {
    mockLastVote(null, new Error('Database error'));
    await expect(checkVotingCooldown('192.168.1.1')).resolves.toEqual({ canVote: true, remainingSeconds: 0 });
  });

  it('registra un voto correctamente', async () => {
    const mockFrom = vi.fn().mockReturnValue({ upsert: vi.fn().mockResolvedValue({ error: null }) });
    vi.mocked(supabase.from).mockImplementation(mockFrom);
    await expect(recordVote('192.168.1.1')).resolves.toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('voting_cooldown');
  });

  it('informa de un error al registrar un voto', async () => {
    vi.mocked(supabase.from).mockReturnValue({ upsert: vi.fn().mockResolvedValue({ error: new Error('Insert error') }) } as never);
    await expect(recordVote('192.168.1.1')).resolves.toBe(false);
  });

  it('obtiene una IP pública y devuelve unknown cuando la consulta falla', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ json: vi.fn().mockResolvedValue({ ip: '203.0.113.42' }) }).mockRejectedValueOnce(new Error('Network error'));
    await expect(getUserIP()).resolves.toBe('203.0.113.42');
    await expect(getUserIP()).resolves.toBe('unknown');
  });
});
