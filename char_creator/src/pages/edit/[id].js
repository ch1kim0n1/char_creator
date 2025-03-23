import { useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import CharacterForm from '../../components/CharacterForm';
import useCharacters from '../../hooks/useCharacters';

export default function EditCharacter() {
  const router = useRouter();
  const { id } = router.query;
  const { getCharacter, createCharacter } = useCharacters();
  
  const character = id ? getCharacter(id) : null;
  
  const handleSubmit = useCallback(async (formData, imageFile) => {
    if (!id) return null;
    
    // Delete the old character and create a new one with the same ID
    // This is a workaround since we're using local storage and don't have a proper update method
    const updatedData = {
      ...formData,
      id // Keep the same ID
    };
    
    return await createCharacter(updatedData, imageFile);
  }, [id, createCharacter]);

  if (!character && id) {
    return (
      <Layout title="Edit Character | Fiction Character Creator">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">Character not found</h2>
          <button 
            onClick={() => router.push('/')}
            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
          >
            Return to dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Edit Character | Fiction Character Creator">
      {character && (
        <CharacterForm 
          initialData={character} 
          onSubmit={handleSubmit} 
          isEdit={true} 
        />
      )}
    </Layout>
  );
} 