import { supabase } from './supabase';

const COOLDOWN_MINUTES = 30;

export async function checkVotingCooldown(userIP: string): Promise<{ canVote: boolean; remainingMinutes: number }> {
  try {
    const { data, error } = await supabase
      .from('voting_cooldown')
      .select('last_vote')
      .eq('ip_address', userIP)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking cooldown:', error);
      return { canVote: true, remainingMinutes: 0 };
    }

    if (!data) {
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
    return { canVote: true, remainingMinutes: 0 };
  }
}

export async function recordVote(userIP: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('voting_cooldown')
      .upsert(
        {
          ip_address: userIP,
          last_vote: new Date().toISOString(),
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
