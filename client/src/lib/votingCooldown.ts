import { supabase } from './supabase';

export const COOLDOWN_SECONDS = 15;

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

export async function checkVotingCooldown(userIP: string): Promise<{ canVote: boolean; remainingSeconds: number }> {
  try {
    const { data, error } = await supabase
      .from('voting_cooldown')
      .select('last_vote')
      .eq('ip_address', userIP)
      .maybeSingle();

    if (error) {
      console.error('Error checking cooldown:', error);
      return { canVote: true, remainingSeconds: 0 };
    }

    if (!data) {
      return { canVote: true, remainingSeconds: 0 };
    }

    const secondsElapsed = (Date.now() - new Date(data.last_vote).getTime()) / 1000;
    if (secondsElapsed < COOLDOWN_SECONDS) {
      return { canVote: false, remainingSeconds: Math.ceil(COOLDOWN_SECONDS - secondsElapsed) };
    }

    return { canVote: true, remainingSeconds: 0 };
  } catch (error) {
    console.error('Error in checkVotingCooldown:', error);
    return { canVote: true, remainingSeconds: 0 };
  }
}

export async function recordVote(userIP: string): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('voting_cooldown')
      .upsert(
        { ip_address: userIP, last_vote: now, updated_at: now },
        { onConflict: 'ip_address' },
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
