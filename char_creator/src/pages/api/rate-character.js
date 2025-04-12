import { getCharacterById, updateCharacterRatings } from '../../utils/characterStorage';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { characterId, rating } = req.body;
    
    if (!characterId) {
      return res.status(400).json({ message: 'Character ID is required' });
    }

    // Get the character data
    const character = await getCharacterById(characterId);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Initialize or update ratings
    const currentRatings = character.ratings || { likes: 0, dislikes: 0 };
    const updatedRatings = {
      ...currentRatings,
      [rating === 'like' ? 'likes' : 'dislikes']: (currentRatings[rating === 'like' ? 'likes' : 'dislikes'] || 0) + 1
    };

    // Update the character with new ratings
    const updatedCharacter = await updateCharacterRatings(characterId, updatedRatings);

    return res.status(200).json({ 
      success: true, 
      ratings: updatedCharacter.ratings 
    });
  } catch (error) {
    console.error('Error rating character:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}