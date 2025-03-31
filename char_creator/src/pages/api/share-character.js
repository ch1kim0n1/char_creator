import { getCharacterById, saveSharedCharacter } from '../../utils/characterStorage';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { characterId } = req.body;

    if (!characterId) {
      return res.status(400).json({ message: 'Character ID is required' });
    }

    // Get the character data
    const character = getCharacterById(characterId);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Remove any existing ID and timestamps to create a fresh copy
    const { id, createdAt, updatedAt, ...characterData } = character;

    // Create a shared version of the character
    const sharedCharacter = saveSharedCharacter({
      ...characterData,
      originalId: characterId,
      isShared: true
    });

    return res.status(200).json({
      message: 'Character shared successfully',
      sharedCharacterId: sharedCharacter.id
    });
  } catch (error) {
    console.error('Error sharing character:', error);
    return res.status(500).json({ message: 'Error sharing character' });
  }
} 