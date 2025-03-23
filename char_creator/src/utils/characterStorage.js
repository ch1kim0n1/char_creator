import { v4 as uuidv4 } from 'uuid';

// Local storage keys
const CHARACTERS_KEY = 'fiction_characters';

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
 * Alias for getCharacters for API consistency
 * @returns {Array} Array of character objects
 */
export const getAllCharacters = getCharacters;

/**
 * Save a new character to local storage
 * @param {Object} characterData - Character data object
 * @returns {Object} Saved character with ID
 */
export const saveCharacter = (characterData) => {
  const characters = getCharacters();
  
  const newCharacter = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    ...characterData
  };
  
  const updatedCharacters = [...characters, newCharacter];
  localStorage.setItem(CHARACTERS_KEY, JSON.stringify(updatedCharacters));
  
  return newCharacter;
};

/**
 * Get a character by ID
 * @param {string} id - Character ID
 * @returns {Object|null} Character object or null if not found
 */
export const getCharacterById = (id) => {
  const characters = getCharacters();
  return characters.find(char => char.id === id) || null;
};

/**
 * Delete a character by ID
 * @param {string} id - Character ID
 * @returns {boolean} Success status
 */
export const deleteCharacter = (id) => {
  const characters = getCharacters();
  const updatedCharacters = characters.filter(char => char.id !== id);
  
  if (updatedCharacters.length === characters.length) {
    return false; // Character not found
  }
  
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
  
  // Format according to Character AI requirements
  return {
    name: character.name,
    description: character.description || '',
    personality: character.personality || '',
    scenario: character.scenario || '',
    first_message: character.greeting || '',
    avatar_uri: character.imageUrl || '',
    // Add other Character AI specific fields as needed
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
