import { getCharacterById, updateCharacterRatings } from '../../utils/characterStorage';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { characterId, rating } = req.body;
    
    console.log('Rating request received:', { characterId, rating });
    
    if (!characterId) {
      console.error('Missing character ID in request');
      return res.status(400).json({ message: 'Character ID is required' });
    }

    // Get the character data
    const character = await getCharacterById(characterId);
    
    console.log('Character lookup result:', character ? 'Found' : 'Not found');
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Initialize or update ratings
    const currentRatings = character.ratings || { likes: 0, dislikes: 0 };
    const updatedRatings = {
      ...currentRatings,
      [rating === 'like' ? 'likes' : 'dislikes']: (currentRatings[rating === 'like' ? 'likes' : 'dislikes'] || 0) + 1
    };

    console.log('Updating ratings:', { before: currentRatings, after: updatedRatings });

    // Update the character with new ratings
    const updatedCharacter = await updateCharacterRatings(characterId, updatedRatings);

    if (!updatedCharacter) {
      console.error('Failed to update character');
      throw new Error('Failed to update character ratings');
    }

    return res.status(200).json({ 
      success: true, 
      ratings: updatedCharacter.ratings 
    });
  } catch (error) {
    console.error('Error rating character:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}