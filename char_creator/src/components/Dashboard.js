import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCharacters from '../hooks/useCharacters';
import ErrorPopup from './ErrorPopup';

export default function Dashboard() {
  const { 
    characters, 
    loading, 
    removeCharacter, 
    error,
    setError 
  } = useCharacters();
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this character?')) {
      const success = await removeCharacter(id);
      if (!success) {
        // Error is already handled by useCharacters hook
        console.error('Failed to delete character');
      }
    }
  };

  return (
    <div className="dashboard-container">
      {error && <ErrorPopup message={error} onDismiss={() => setError(null)} />}
      <div className="dashboard-header">
        <h1>Your Characters</h1>
        <Link to="/create" className="create-button">
          Create New Character
        </Link>
      </div>
      
      {loading ? (
        <div className="loading">Loading characters...</div>
      ) : (
        <div className="characters-grid">
          {characters.map(character => (
            <div key={character.id} className="character-card">
              {/* ... existing character card content ... */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 