// Get the rating status for a character from localStorage
export const getCharacterRatingStatus = (characterId) => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`character_${characterId}_rating_status`);
};

// Set the rating status for a character in localStorage
export const setCharacterRatingStatus = (characterId, status) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`character_${characterId}_rating_status`, status);
};

// Check if a user has already rated a character
export const hasUserRatedCharacter = (characterId) => {
  if (typeof window === 'undefined') return false;
  return getCharacterRatingStatus(characterId) !== null;
};

// Rate a character
export async function rateCharacter(characterId, rating) {
  try {
    if (!characterId) {
      throw new Error('Character ID is required');
    }

    const response = await fetch('/api/rate-character', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ characterId, rating }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to rate character');
    }
    
    setCharacterRatingStatus(characterId, rating);
    return data;
  } catch (error) {
    console.error('Error in rateCharacter:', error);
    throw error;
  }
}