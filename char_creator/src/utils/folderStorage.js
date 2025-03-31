// Constants
const FOLDERS_STORAGE_KEY = 'characterFolders';

// Helper function to validate folder data
const validateFolder = (folder) => {
  return (
    folder &&
    typeof folder.id === 'string' &&
    typeof folder.name === 'string' &&
    Array.isArray(folder.characters) &&
    folder.characters.every(char => 
      char && 
      typeof char.id === 'string' &&
      typeof char.name === 'string'
    )
  );
};

// Get all folders from localStorage
export const getAllFolders = () => {
  try {
    const savedFolders = localStorage.getItem(FOLDERS_STORAGE_KEY);
    if (!savedFolders) return [];
    
    const folders = JSON.parse(savedFolders);
    // Filter out invalid folders
    return folders.filter(folder => validateFolder(folder));
  } catch (error) {
    console.error('Error loading folders:', error);
    return [];
  }
};

// Save folders to localStorage
export const saveFolders = (folders) => {
  try {
    // Filter out invalid folders before saving
    const validFolders = folders.filter(folder => validateFolder(folder));
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(validFolders));
    return true;
  } catch (error) {
    console.error('Error saving folders:', error);
    return false;
  }
};

// Create a new folder
export const createFolder = (name) => {
  try {
    const folders = getAllFolders();
    const newFolder = {
      id: `folder_${Date.now()}`,
      name,
      characters: []
    };
    
    if (validateFolder(newFolder)) {
      folders.push(newFolder);
      saveFolders(folders);
      return newFolder;
    }
    return null;
  } catch (error) {
    console.error('Error creating folder:', error);
    return null;
  }
};

// Delete a folder
export const deleteFolder = (folderId) => {
  try {
    const folders = getAllFolders();
    const updatedFolders = folders.filter(folder => folder.id !== folderId);
    saveFolders(updatedFolders);
    return true;
  } catch (error) {
    console.error('Error deleting folder:', error);
    return false;
  }
};

// Update a folder's name
export const updateFolderName = (folderId, newName) => {
  try {
    const folders = getAllFolders();
    const updatedFolders = folders.map(folder => 
      folder.id === folderId ? { ...folder, name: newName } : folder
    );
    saveFolders(updatedFolders);
    return true;
  } catch (error) {
    console.error('Error updating folder name:', error);
    return false;
  }
};

// Add a character to a folder
export const addCharacterToFolder = (folderId, character) => {
  try {
    const folders = getAllFolders();
    const updatedFolders = folders.map(folder => {
      if (folder.id === folderId) {
        // Check if character is already in the folder
        if (!folder.characters.some(char => char.id === character.id)) {
          // Make sure we store all necessary character data
          const characterToStore = {
            id: character.id,
            name: character.name,
            imageUrl: character.imageUrl,
            // Add any other essential character properties you need to preserve
          };
          return {
            ...folder,
            characters: [...folder.characters, characterToStore]
          };
        }
      }
      return folder;
    });
    saveFolders(updatedFolders);
    return true;
  } catch (error) {
    console.error('Error adding character to folder:', error);
    return false;
  }
};

// Remove a character from a folder
export const removeCharacterFromFolder = (folderId, characterId) => {
  try {
    const folders = getAllFolders();
    const updatedFolders = folders.map(folder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          characters: folder.characters.filter(char => char.id !== characterId)
        };
      }
      return folder;
    });
    saveFolders(updatedFolders);
    return true;
  } catch (error) {
    console.error('Error removing character from folder:', error);
    return false;
  }
};

// Move a character from one folder to another
export const moveCharacterToFolder = (characterId, sourceFolderId, targetFolderId) => {
  try {
    const folders = getAllFolders();
    const updatedFolders = folders.map(folder => {
      // Remove from source folder
      if (folder.id === sourceFolderId) {
        return {
          ...folder,
          characters: folder.characters.filter(char => char.id !== characterId)
        };
      }
      // Add to target folder
      if (folder.id === targetFolderId) {
        const character = folders
          .find(f => f.id === sourceFolderId)
          ?.characters.find(char => char.id === characterId);
        if (character && !folder.characters.some(char => char.id === characterId)) {
          return {
            ...folder,
            characters: [...folder.characters, character]
          };
        }
      }
      return folder;
    });
    saveFolders(updatedFolders);
    return true;
  } catch (error) {
    console.error('Error moving character between folders:', error);
    return false;
  }
};

// Get all folders containing a specific character
export const getCharacterFolders = (characterId) => {
  try {
    const folders = getAllFolders();
    return folders.filter(folder => 
      folder.characters.some(char => char.id === characterId)
    );
  } catch (error) {
    console.error('Error getting character folders:', error);
    return [];
  }
};

// Clear all folders
export const clearAllFolders = () => {
  try {
    localStorage.removeItem(FOLDERS_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing folders:', error);
    return false;
  }
};