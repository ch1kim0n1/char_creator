import { useState, useEffect, useCallback } from 'react';
import {
  getCharacters,
  saveCharacter,
  getCharacterById,
  deleteCharacter,
  exportCharacterAI,
  exportFormattedCharacter,
  downloadCharacterAsText,
  saveCharacterImage,
  getCharacterVersions,
  getCharacterVersion
} from '../utils/characterStorage';

/**
 * Custom hook for managing characters
 * @returns {Object} Character management methods and state
 */
export default function useCharacters() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Load characters on mount and validate their existence
  useEffect(() => {
    const loadCharacters = () => {
      try {
        const data = getCharacters();
        // Validate each character's existence and filter out invalid ones
        const validCharacters = data.filter(char => {
          if (!char || !char.id) return false;
          const exists = getCharacterById(char.id);
          return exists !== null && exists.id === char.id;
        });
        
        // If we found invalid characters, update storage
        if (validCharacters.length !== data.length) {
          localStorage.setItem('fiction_characters', JSON.stringify(validCharacters));
        }
        
        setCharacters(validCharacters);
      } catch (error) {
        console.error('Failed to load characters:', error);
        setError('Failed to load characters. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadCharacters();
  }, []);

  // Cleanup function to remove any invalid characters from storage
  useEffect(() => {
    if (!loading) {
      const cleanupStorage = () => {
        const storedCharacters = getCharacters();
        const validCharacters = storedCharacters.filter(char => {
          return char && char.id && getCharacterById(char.id) !== null;
        });
        
        if (validCharacters.length !== storedCharacters.length) {
          localStorage.setItem('fiction_characters', JSON.stringify(validCharacters));
          setCharacters(validCharacters);
        }
      };
      
      cleanupStorage();
    }
  }, [loading]);


  // Create a new character
  const createCharacter = useCallback(async (characterData, imageFile) => {
    try {
      const newCharacter = saveCharacter(characterData);
      
      if (imageFile) {
        const imageUrl = await saveCharacterImage(newCharacter.id, imageFile);
        newCharacter.imageUrl = imageUrl;
      }
      
      setCharacters(prev => [...prev, newCharacter]);
      return newCharacter;
    } catch (error) {
      console.error('Failed to create character:', error);
      setError(error.message || 'Failed to create character. Please try again.');
      throw error;
    }
  }, []);

  // Update an existing character
  const updateCharacter = useCallback(async (id, characterData, imageFile) => {
    try {
      const updatedCharacter = saveCharacter(characterData, id);
      
      if (imageFile) {
        const imageUrl = await saveCharacterImage(id, imageFile);
        updatedCharacter.imageUrl = imageUrl;
      }
      
      setCharacters(prev => prev.map(char => 
        char.id === id ? updatedCharacter : char
      ));
      
      return updatedCharacter;
    } catch (error) {
      console.error('Failed to update character:', error);
      setError(error.message || 'Failed to update character. Please try again.');
      throw error;
    }
  }, []);

  // Delete a character
  const removeCharacter = useCallback((id) => {
    try {
      const success = deleteCharacter(id);
      if (success) {
        setCharacters(prev => prev.filter(char => char.id !== id));
      } else {
        setError('Failed to delete character. Please try again.');
      }
      return success;
    } catch (error) {
      console.error('Failed to delete character:', error);
      setError('Failed to delete character. Please try again.');
      return false;
    }
  }, []);

  // Get a character by ID
  const getCharacter = useCallback((id) => {
    try {
      const character = getCharacterById(id);
      if (!character) {
        setCharacters(prev => prev.filter(char => char.id !== id));
        setError('Character not found. It may have been deleted.');
      }
      return character;
    } catch (error) {
      console.error('Failed to get character:', error);
      setError('Failed to load character. Please try again.');
      return null;
    }
  }, []);

  // Export character for Character AI
  const exportForCharacterAI = useCallback((id) => {
    try {
      return exportCharacterAI(id);
    } catch (error) {
      console.error('Failed to export character:', error);
      setError('Failed to export character. Please try again.');
      return null;
    }
  }, []);

  // Export formatted character
  const getFormattedCharacter = useCallback((id) => {
    try {
      return exportFormattedCharacter(id);
    } catch (error) {
      console.error('Failed to format character:', error);
      setError('Failed to format character. Please try again.');
      return null;
    }
  }, []);

  // Download character as text file
  const downloadCharacterText = useCallback((id) => {
    try {
      return downloadCharacterAsText(id);
    } catch (error) {
      console.error('Failed to download character:', error);
      setError('Failed to download character. Please try again.');
      return false;
    }
  }, []);

  // Get character versions
  const getVersions = useCallback((id) => {
    try {
      return getCharacterVersions(id);
    } catch (error) {
      console.error('Failed to get character versions:', error);
      setError('Failed to load character versions. Please try again.');
      return [];
    }
  }, []);

  // Get specific character version
  const getVersion = useCallback((characterId, versionId) => {
    try {
      return getCharacterVersion(characterId, versionId);
    } catch (error) {
      console.error('Failed to get character version:', error);
      setError('Failed to load character version. Please try again.');
      return null;
    }
  }, []);

  return {
    characters,
    loading,
    error,
    setError,
    createCharacter,
    updateCharacter,
    removeCharacter,
    getCharacter,
    exportForCharacterAI,
    getFormattedCharacter,
    downloadCharacterText,
    getVersions,
    getVersion
  };
}