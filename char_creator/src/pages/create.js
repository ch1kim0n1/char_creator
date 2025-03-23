import { useCallback } from 'react';
import Layout from '../components/Layout';
import CharacterForm from '../components/CharacterForm';
import useCharacters from '../hooks/useCharacters';

export default function CreateCharacter() {
  const { createCharacter } = useCharacters();
  
  const handleSubmit = useCallback(async (formData, imageFile) => {
    return await createCharacter(formData, imageFile);
  }, [createCharacter]);

  return (
    <Layout title="Create Character | Fiction Character Creator">
      <CharacterForm onSubmit={handleSubmit} />
    </Layout>
  );
} 