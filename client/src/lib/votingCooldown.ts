import { supabase } from './supabase';

const COOLDOWN_MINUTES = 0.05;

export async function getUserIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    console.error('Error getting user IP:', error);
    return 'unknown';
  }
}

export async function checkVotingCooldown(userIP: string): Promise<{ canVote: boolean; remainingMinutes: number }> {
  try {
    // Consultar el último voto del usuario
    const { data, error } = await supabase
      .from('voting_cooldown')
      .select('last_vote')
      .eq('ip_address', userIP)
      .maybeSingle();

    if (error) {
      console.error('Error checking cooldown:', error);
      return { canVote: true, remainingMinutes: 0 };
    }

    if (!data) {
      // No hay registro previo, puede votar
      return { canVote: true, remainingMinutes: 0 };
    }

    const lastVoteTime = new Date(data.last_vote).getTime();
    const now = new Date().getTime();
    const minutesElapsed = (now - lastVoteTime) / (1000 * 60);

    if (minutesElapsed < COOLDOWN_MINUTES) {
      const remainingMinutes = Math.ceil(COOLDOWN_MINUTES - minutesElapsed);
      return { canVote: false, remainingMinutes };
    }

    return { canVote: true, remainingMinutes: 0 };
  } catch (error) {
    console.error('Error in checkVotingCooldown:', error);
    // En caso de error, permitir votar (no bloquear)
    return { canVote: true, remainingMinutes: 0 };
  }
}

export async function recordVote(userIP: string): Promise<boolean> {
  try {
    const now = new Date().toISOString();

    // Usar upsert para actualizar si existe o crear si no existe
    const { error } = await supabase
      .from('voting_cooldown')
      .upsert(
        {
          ip_address: userIP,
          last_vote: now,
          updated_at: now,
        },
        {
          onConflict: 'ip_address',
        }
      );

    if (error) {
      console.error('Error recording vote:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in recordVote:', error);
    return false;
  }
}
