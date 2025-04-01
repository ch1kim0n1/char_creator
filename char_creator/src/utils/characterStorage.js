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

  // Get all characters to find relationship names
  const allCharacters = getCharacters();
  
  // Format relationships
  const relationships = character.relationships || {};
  const formattedRelationships = Object.entries(relationships).map(([relatedId, status]) => {
    const relatedCharacter = allCharacters.find(char => char.id === relatedId);
    return relatedCharacter ? `${relatedCharacter.name} - ${status}` : null;
  }).filter(Boolean);

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
    relationships: formattedRelationships,
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
  
  // Get relationships data
  const relationshipsJson = localStorage.getItem('characterRelationships');
  const relationships = relationshipsJson ? JSON.parse(relationshipsJson) : {};
  const characterRelationships = relationships[character.id] || {};
  
  // Format relationships
  const formattedRelationships = Object.entries(characterRelationships)
    .map(([relatedId, relationship]) => {
      const relatedChar = getCharacterById(relatedId);
      if (!relatedChar) return null;
      const relationType = relationship.type === 'custom' ? relationship.customType : relationship.type;
      return `${relatedChar.name} - ${relationType}`;
    })
    .filter(Boolean)
    .join('\n');

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
Greeting: ${character.greeting || ''}
Relationships:
${formattedRelationships}`;
};

/**
 * Download character in Character.AI format
 * @param {Object} character - Character object
 * @returns {Promise<boolean>} Success status
 */
export const downloadCharacterFile = async (character) => {
  if (!character) return false;
  
  // Get relationships data
  const relationshipsJson = localStorage.getItem('characterRelationships');
  const relationships = relationshipsJson ? JSON.parse(relationshipsJson) : {};
  const characterRelationships = relationships[character.id] || {};
  
  // Format relationships
  const formattedRelationships = Object.entries(characterRelationships)
    .map(([relatedId, relationship]) => {
      const relatedChar = getCharacterById(relatedId);
      if (!relatedChar) return null;
      const relationType = relationship.type === 'custom' ? relationship.customType : relationship.type;
      return `${relatedChar.name} - ${relationType}`;
    })
    .filter(Boolean);
  
  // Format for Character.AI
  const characterData = {
    name: character.name || '',
    description: character.description || '',
    personality: character.personality || '',
    scenario: character.scenario || '',
    first_message: character.greeting || '',
    avatar_uri: character.imageUrl || '',
    relationships: formattedRelationships,
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

/**
 * Export character as a zip file containing data and pfp
 * @param {Object} character - Character object
 * @param {string} format - Export format ('text' or 'character.ai')
 * @returns {Promise<boolean>} Success status
 */
export const downloadCharacterBundle = async (character, format = 'text') => {
  if (!character) return false;

  try {
    // Dynamic import JSZip only when needed
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const folderName = `${character.name.replace(/\s+/g, '_')}_export`;
    const folder = zip.folder(folderName);

    // Add character data file
    const characterData = format === 'text' ? 
      exportCharacterAsText(character) : 
      JSON.stringify(await downloadCharacterFile(character), null, 2);
    
    folder.file(
      format === 'text' ? 'character.txt' : 'character.json', 
      characterData
    );

    // Add profile picture if exists
    if (character.imageUrl) {
      const response = await fetch(character.imageUrl);
      const blob = await response.blob();
      folder.file('profile_picture.png', blob);
    }

    // Generate and download zip
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${folderName}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error creating character bundle:', error);
    return false;
  }
};

/**
 * Get character statistics including demographics and text analysis
 * @returns {Object} Statistics data
 */
export const getCharacterStatistics = () => {
  const characters = getCharacters();
  
  // Basic demographics
  const genderStats = characters.reduce((acc, char) => {
    const gender = char.gender || 'unspecified';
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {});

  const heightStats = characters
    .filter(char => char.height)
    .map(char => parseInt(char.height))
    .filter(height => !isNaN(height));

  const avgHeight = heightStats.length ? 
    Math.round(heightStats.reduce((a, b) => a + b) / heightStats.length) : 0;

  // Attribute analysis
  const personalityWords = characters
    .filter(char => char.personality)
    .flatMap(char => char.personality.toLowerCase().split(/\W+/))
    .filter(word => word.length > 3);

  const skillsList = characters
    .filter(char => char.skills)
    .flatMap(char => char.skills.toLowerCase().split(/,|\n/))
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0);

  // Calculate completeness scores
  const fields = ['name', 'gender', 'age', 'height', 'personality', 'background', 'skills'];
  const completenessScores = characters.map(char => {
    const filledFields = fields.filter(field => char[field] && char[field].toString().trim().length > 0);
    return (filledFields.length / fields.length) * 100;
  });

  const avgCompleteness = completenessScores.length ?
    Math.round(completenessScores.reduce((a, b) => a + b) / completenessScores.length) : 0;

  // Species distribution
  const speciesDistribution = characters.reduce((acc, char) => {
    const species = char.species || 'Unspecified';
    acc[species] = (acc[species] || 0) + 1;
    return acc;
  }, {});

  // Age distribution
  const ageDistribution = characters.reduce((acc, char) => {
    if (!char.age) return acc;
    const age = parseInt(char.age);
    if (isNaN(age)) return acc;
    
    const ageGroup = 
      age < 18 ? '0-17' :
      age < 30 ? '18-29' :
      age < 50 ? '30-49' :
      age < 70 ? '50-69' :
      '70+';
    
    acc[ageGroup] = (acc[ageGroup] || 0) + 1;
    return acc;
  }, {});

  // Creation timeline
  const creationTimeline = characters
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .reduce((acc, char) => {
      const date = new Date(char.createdAt).toLocaleDateString();
      const existingDate = acc.find(d => d.date === date);
      if (existingDate) {
        existingDate.count++;
      } else {
        acc.push({ date, count: 1 });
      }
      return acc;
    }, []);

  // Calculate completeness for each character
  const charactersWithCompleteness = characters.map(char => {
    const filledFields = fields.filter(field => char[field] && char[field].toString().trim().length > 0);
    const completeness = Math.round((filledFields.length / fields.length) * 100);
    return { ...char, completeness };
  });

  // Get top creators (most complete characters)
  const topCreators = charactersWithCompleteness
    .sort((a, b) => b.completeness - a.completeness)
    .slice(0, 6);

  // Common traits analysis
  const traitWords = characters
    .flatMap(char => [
      ...(char.personality?.toLowerCase().split(/\W+/) || []),
      ...(char.traits?.toLowerCase().split(/\W+/) || [])
    ])
    .filter(word => word.length > 3);

  const mostCommonTraits = getWordFrequency(traitWords)
    .slice(0, 20)
    .map(({ word, count }) => ({
      word,
      count,
      size: Math.max(1, Math.min(3, count / 2))
    }));

  // Enhanced creation and edit timeline
  const timelineData = characters.reduce((acc, char) => {
    const createDate = new Date(char.createdAt).toLocaleDateString();
    const updateDate = new Date(char.updatedAt).toLocaleDateString();
    
    // Track creations
    acc.creations[createDate] = (acc.creations[createDate] || 0) + 1;
    
    // Track edits (only if update is different from creation)
    if (char.updatedAt !== char.createdAt) {
      acc.edits[updateDate] = (acc.edits[updateDate] || 0) + 1;
    }
    
    return acc;
  }, { creations: {}, edits: {} });

  // Additional statistics
  const additionalStats = {
    // Language distribution
    languageStats: characters.reduce((acc, char) => {
      const lang = char.language || 'Unspecified';
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {}),
    
    // Occupation categories
    occupationStats: characters.reduce((acc, char) => {
      const occupation = char.occupation || 'Unspecified';
      acc[occupation] = (acc[occupation] || 0) + 1;
      return acc;
    }, {}),
    
    // Status analysis
    statusStats: characters.reduce((acc, char) => {
      const status = char.status || 'Unspecified';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {}),
    
    // Background length analysis
    backgroundStats: characters.reduce((acc, char) => {
      if (!char.background) return acc;
      const wordCount = char.background.split(/\s+/).length;
      acc.push(wordCount);
      return acc;
    }, []),
    
    // Likes/Dislikes analysis
    preferencesStats: characters.reduce((acc, char) => {
      if (char.likes) acc.likes += char.likes.split(',').length;
      if (char.dislikes) acc.dislikes += char.dislikes.split(',').length;
      return acc;
    }, { likes: 0, dislikes: 0 }),

    // Image usage statistics
    imageStats: {
      withImage: characters.filter(char => char.imageUrl).length,
      withoutImage: characters.filter(char => !char.imageUrl).length
    }
  };

  // Convert timeline data to sorted arrays
  const allDates = [...new Set([
    ...Object.keys(timelineData.creations),
    ...Object.keys(timelineData.edits)
  ])].sort();
  
  const creationTimelineEnhanced = allDates.map(date => ({
    date,
    creations: timelineData.creations[date] || 0,
    edits: timelineData.edits[date] || 0
  }));

  return {
    totalCharacters: characters.length,
    genderDistribution: genderStats,
    heightStatistics: {
      average: avgHeight,
      min: Math.min(...heightStats),
      max: Math.max(...heightStats),
    },
    mostCommonPersonalityWords: getWordFrequency(personalityWords).slice(0, 10),
    mostCommonSkills: getWordFrequency(skillsList).slice(0, 10),
    completeness: {
      average: avgCompleteness,
      scores: completenessScores
    },
    speciesDistribution,
    ageDistribution,
    creationTimeline,
    topCreators,
    mostCommonTraits,
    creationTimelineEnhanced,
    additionalStats
  };
};

// Helper function to get word frequency
function getWordFrequency(words) {
  const frequency = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .map(([word, count]) => ({ word, count }));
}

export const syncCharacterWithStorage = async (characterId) => {
  try {
    const characters = JSON.parse(localStorage.getItem(CHARACTERS_KEY) || '[]');
    const character = characters.find(char => char.id === characterId);
    if (!character) {
      console.error('Character not found in storage:', characterId);
      return null;
    }
    return character;
  } catch (error) {
    console.error('Error syncing character:', error);
    return null;
  }
};

// Update the updateCharacterRatings function
export async function updateCharacterRatings(characterId, ratings) {
  try {
    const characters = getCharacters();
    const characterIndex = characters.findIndex(char => char.id === characterId);
    
    if (characterIndex === -1) {
      throw new Error('Character not found');
    }

    // Update the character's ratings
    characters[characterIndex] = {
      ...characters[characterIndex],
      ratings: { ...(characters[characterIndex].ratings || {}), ...ratings }
    };

    // Save the updated characters back to storage
    localStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters));
    
    return characters[characterIndex];
  } catch (error) {
    console.error('Error updating character ratings:', error);
    throw error;
  }
}