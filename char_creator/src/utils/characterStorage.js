import { v4 as uuidv4 } from 'uuid';

// Local storage keys
const CHARACTERS_KEY = 'fiction_characters';
const VERSIONS_KEY = 'fiction_character_versions';
const SHARED_CHARACTERS_KEY = 'fiction_shared_characters';

/**
 * Get all characters from local storage
 * @returns {Array} Array of character objects
 */
export const getCharacters = () => {
  if (typeof window === 'undefined') return [];
  
  const charactersJson = localStorage.getItem(CHARACTERS_KEY);
  return charactersJson ? JSON.parse(charactersJson) : [];
};

/**
 * Get character versions from local storage
 * @param {string} characterId - Character ID
 * @returns {Array} Array of version objects
 */
export const getCharacterVersions = (characterId) => {
  if (typeof window === 'undefined') return [];
  
  const versionsJson = localStorage.getItem(VERSIONS_KEY);
  const allVersions = versionsJson ? JSON.parse(versionsJson) : {};
  return allVersions[characterId] || [];
};

/**
 * Save character version to local storage
 * @param {string} characterId - Character ID
 * @param {Object} versionData - Version data object
 */
export const saveCharacterVersion = (characterId, versionData) => {
  const versions = getCharacterVersions(characterId);
  versions.push({
    ...versionData,
    timestamp: new Date().toISOString()
  });
  
  const allVersions = JSON.parse(localStorage.getItem(VERSIONS_KEY) || '{}');
  allVersions[characterId] = versions;
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(allVersions));
};

/**
 * Get character version by ID
 * @param {string} characterId - Character ID
 * @param {string} versionId - Version ID
 * @returns {Object|null} Version object or null if not found
 */
export const getCharacterVersion = (characterId, versionId) => {
  const versions = getCharacterVersions(characterId);
  return versions.find(v => v.id === versionId) || null;
};

/**
 * Save or update a character in local storage
 * @param {Object} characterData - Character data object
 * @param {string} [existingId] - Optional existing character ID for updates
 * @returns {Object} Saved character with ID
 */
export const saveCharacter = (characterData, existingId = null) => {
  const characters = getCharacters();
  
  // If updating an existing character
  if (existingId) {
    const existingIndex = characters.findIndex(char => char.id === existingId);
    if (existingIndex === -1) {
      throw new Error('Character not found');
    }

    // Save current version before updating
    const currentCharacter = characters[existingIndex];
    saveCharacterVersion(existingId, {
      id: uuidv4(),
      data: { ...currentCharacter },
      changes: Object.keys(characterData).filter(key => 
        characterData[key] !== currentCharacter[key]
      )
    });

    const updatedCharacter = {
      ...characters[existingIndex],
      ...characterData,
      updatedAt: new Date().toISOString()
    };

    characters[existingIndex] = updatedCharacter;
    localStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters));
    return updatedCharacter;
  }
  
  // For new characters, check for duplicates (excluding the current character if editing)
  const isDuplicate = characters.some(char => 
    char.id !== existingId && // Exclude current character when editing
    char.name.toLowerCase() === characterData.name.toLowerCase() &&
    char.gender === characterData.gender &&
    char.age === characterData.age
  );

  if (isDuplicate) {
    throw new Error('A character with these details already exists');
  }
  
  const newCharacter = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...characterData
  };
  
  const updatedCharacters = [...characters, newCharacter];
  localStorage.setItem(CHARACTERS_KEY, JSON.stringify(updatedCharacters));
  
  return newCharacter;
};

/**
 * Alias for getCharacters for API consistency
 * @returns {Array} Array of character objects
 */
export const getAllCharacters = getCharacters;

/**
 * Get all shared characters from local storage
 * @returns {Array} Array of shared character objects
 */
export const getSharedCharacters = () => {
  if (typeof window === 'undefined') return [];
  
  const sharedCharactersJson = localStorage.getItem(SHARED_CHARACTERS_KEY);
  return sharedCharactersJson ? JSON.parse(sharedCharactersJson) : [];
};

/**
 * Save a shared character to local storage
 * @param {Object} characterData - Character data object
 * @returns {Object} Saved shared character with ID
 */
export const saveSharedCharacter = (characterData) => {
  if (typeof window === 'undefined') {
    throw new Error('Cannot save shared character on server side');
  }

  const sharedCharacters = getSharedCharacters();
  
  // Create a new shared character with a unique ID
  const newSharedCharacter = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isShared: true,
    ...characterData
  };
  
  // Add to shared characters array
  const updatedSharedCharacters = [...sharedCharacters, newSharedCharacter];
  
  // Save to localStorage
  try {
    localStorage.setItem(SHARED_CHARACTERS_KEY, JSON.stringify(updatedSharedCharacters));
  } catch (error) {
    console.error('Error saving shared character:', error);
    throw new Error('Failed to save shared character');
  }
  
  return newSharedCharacter;
};

/**
 * Get a shared character by ID
 * @param {string} id - Shared character ID
 * @returns {Object|null} Shared character object or null if not found
 */
export const getSharedCharacterById = (id) => {
  if (!id) return null;
  
  try {
    const sharedCharacters = getSharedCharacters();
    const character = sharedCharacters.find(char => char.id === id);
    
    if (!character) {
      return null;
    }
    
    return character;
  } catch (error) {
    console.error('Error getting shared character:', error);
    return null;
  }
};

/**
 * Get a character by ID (including shared characters)
 * @param {string} id - Character ID
 * @returns {Object|null} Character object or null if not found
 */
export const getCharacterById = (id) => {
  if (!id) return null;
  
  try {
    // First check regular characters
    const characters = getCharacters();
    const character = characters.find(char => char.id === id);
    
    if (character) {
      return character;
    }
    
    // If not found in regular characters, check shared characters
    return getSharedCharacterById(id);
  } catch (error) {
    console.error('Error getting character:', error);
    return null;
  }
};

/**
 * Delete a character by ID
 * @param {string} id - Character ID
 * @returns {boolean} Success status
 */
export const deleteCharacter = (id) => {
  if (!id) return false;
  
  const characters = getCharacters();
  const characterExists = characters.some(char => char.id === id);
  
  if (!characterExists) {
    return false;
  }
  
  const updatedCharacters = characters.filter(char => char.id !== id);
  localStorage.setItem(CHARACTERS_KEY, JSON.stringify(updatedCharacters));
  return true;
};

/**
 * Export character data for Character AI format
 * @param {string} id - Character ID
 * @returns {Object|null} Character AI formatted data or null if not found
 */
export const exportCharacterAI = (id) => {
  const character = getCharacterById(id);
  if (!character) return null;

  // Updated to match the provided format
  return {
    name: character.name,
    gender: character.gender || '',
    age: character.age || '',
    height: `${character.height || ''} cm`,
    language: character.language || '',
    status: character.status || '',
    occupation: character.occupation || '',
    personality: character.personality || '',
    skills: character.skills || '',
    appearance: character.appearance || '',
    figure: character.figure || '',
    attributes: character.attributes || '',
    species: character.species || '',
    habits: character.habits || '',
    likes: character.likes || '',
    dislikes: character.dislikes || '',
    background: character.background || '',
    scenario: character.scenario || '',
    greeting: character.greeting || '',
  };
};

/**
 * Export character data in the format from format.txt
 * @param {string} id - Character ID
 * @returns {string|null} Formatted character data as a string or null if not found
 */
export const exportFormattedCharacter = (id) => {
  const character = getCharacterById(id);
  if (!character) return null;
  
  // Format according to format.txt specification
  return `{Character("${character.name || ''}")
Gender("${character.gender || ''}")
Age("${character.age || ''}")
Heights("${character.height || ''} cm")
Language("${character.language || ''}")
Status("${character.status || ''}") 
Occupation("${character.occupation || ''}") 
Personality("${character.personality || ''}") 
Skill("${character.skills || ''}") 
Appearance("${character.appearance || character.description || ''}") 
Figure("${character.figure || ''}") 
Attributes("${character.attributes || ''}") 
Speciest("${character.species || ''}") 
Habit("${character.habits || ''}") 
Likes("${character.likes || ''}") 
Dislike("${character.dislikes || ''}")
Backstory/Roleplay("${character.background || ''}")}`;
};

/**
 * Download character as a text file in the format specified
 * @param {string} id - Character ID
 * @returns {boolean} Success status
 */
export const downloadCharacterAsText = (id) => {
  const formattedText = exportFormattedCharacter(id);
  if (!formattedText) return false;
  
  const character = getCharacterById(id);
  const fileName = `${character.name.replace(/\s+/g, '_')}_character.txt`;
  
  // Create a blob with the formatted text
  const blob = new Blob([formattedText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link and trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
  return true;
};

/**
 * Export character data as formatted text
 * @param {Object} character - Character object
 * @returns {string} Formatted character data as text
 */
export const exportCharacterAsText = (character) => {
  if (!character) return '';
  
  return `Character: ${character.name || ''}
Gender: ${character.gender || ''}
Age: ${character.age || ''}
Height: ${character.height || ''}
Language: ${character.language || ''}
Status: ${character.status || ''} 
Occupation: ${character.occupation || ''} 
Personality: ${character.personality || ''} 
Skills: ${character.skills || ''} 
Appearance: ${character.appearance || character.description || ''} 
Figure: ${character.figure || ''} 
Attributes: ${character.attributes || ''} 
Species: ${character.species || ''} 
Habits: ${character.habits || ''} 
Likes: ${character.likes || ''} 
Dislikes: ${character.dislikes || ''}
Background: ${character.background || ''}
Interests: ${character.interests || ''}
Scenario: ${character.scenario || ''}
Greeting: ${character.greeting || ''}`;
};

/**
 * Download character in Character.AI format
 * @param {Object} character - Character object
 * @returns {Promise<boolean>} Success status
 */
export const downloadCharacterFile = async (character) => {
  if (!character) return false;
  
  // Format for Character.AI
  const characterData = {
    name: character.name || '',
    description: character.description || '',
    personality: character.personality || '',
    scenario: character.scenario || '',
    first_message: character.greeting || '',
    avatar_uri: character.imageUrl || '',
    // Add additional Character.AI fields as needed
  };
  
  const fileName = `${character.name.replace(/\s+/g, '_')}_character_ai.json`;
  
  // Create a blob with the formatted JSON
  const blob = new Blob([JSON.stringify(characterData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link and trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
  return true;
};

/**
 * Save an image for a character
 * @param {string} id - Character ID
 * @param {File} imageFile - Image file
 * @returns {Promise<string>} URL of the saved image
 */
export const saveCharacterImage = async (id, imageFile) => {
  // In a real app, you would upload this to a server
  // For this example, we'll use a data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const characters = getCharacters();
      const characterIndex = characters.findIndex(char => char.id === id);
      
      if (characterIndex === -1) {
        reject(new Error('Character not found'));
        return;
      }
      
      characters[characterIndex].imageUrl = reader.result;
      localStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters));
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
};