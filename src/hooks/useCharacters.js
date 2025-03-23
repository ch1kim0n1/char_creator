import { useState, useEffect, useCallback } from 'react';
import {
  getCharacters,
  saveCharacter,
  getCharacterById,
  deleteCharacter,
  exportCharacterAI,
  exportFormattedCharacter,
  downloadCharacterAsText,
  saveCharacterImage
} from '../utils/characterStorage';

/**
 * Custom hook for managing characters
 * @returns {Object} Character management methods and state
 */
export default function useCharacters() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load characters on mount
  useEffect(() => {
    const loadCharacters = () => {
      try {
        const data = getCharacters();
        setCharacters(data);
      } catch (error) {
        console.error('Failed to load characters:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCharacters();
  }, []);

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
      throw error;
    }
  }, []);

  // Delete a character
  const removeCharacter = useCallback((id) => {
    try {
      const success = deleteCharacter(id);
      if (success) {
        setCharacters(prev => prev.filter(char => char.id !== id));
      }
      return success;
    } catch (error) {
      console.error('Failed to delete character:', error);
      return false;
    }
  }, []);

  // Get a character by ID
  const getCharacter = useCallback((id) => {
    return getCharacterById(id);
  }, []);

  // Export character for Character AI
  const exportForCharacterAI = useCallback((id) => {
    return exportCharacterAI(id);
  }, []);

  // Export formatted character
  const getFormattedCharacter = useCallback((id) => {
    return exportFormattedCharacter(id);
  }, []);

  // Download character as text file
  const downloadCharacterText = useCallback((id) => {
    return downloadCharacterAsText(id);
  }, []);

  return {
    characters,
    loading,
    createCharacter,
    removeCharacter,
    getCharacter,
    exportForCharacterAI,
    getFormattedCharacter,
    downloadCharacterText
  };
} 