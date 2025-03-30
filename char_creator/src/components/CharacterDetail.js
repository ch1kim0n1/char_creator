import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { FiDownload, FiEdit, FiArrowLeft, FiUser } from 'react-icons/fi';
import useCharacters from '../hooks/useCharacters';

const CharacterDetail = ({ characterId }) => {
  const router = useRouter();
  const { getCharacter, exportForCharacterAI } = useCharacters();
  
  let character = getCharacter(characterId);
  
  // Remove template handling since we'll be using the create page instead
  if (!character) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">Character not found</h2>
        <button 
          onClick={() => router.push('/')}
          className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
        >
          Return to dashboard
        </button>
      </div>
    );
  }

  const handleExport = () => {
    const data = exportForCharacterAI(character.id);
    if (data) {
      // Create a downloadable blob
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.name}_character_ai.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  const handleImageDownload = () => {
    if (character.imageUrl) {
      const a = document.createElement('a');
      a.href = character.imageUrl;
      a.download = `${character.name}_image.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 overflow-x-hidden">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0">
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <FiArrowLeft className="mr-1" /> Back
        </button>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white sm:flex-grow">{character.name}</h1>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 max-w-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/edit/${character.id}`)}
            className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/30 min-w-[80px]"
          >
            <FiEdit size={18} /> Edit
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/30 min-w-[80px]"
          >
            <FiDownload size={18} /> Export
          </motion.button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden max-w-full">
        <div className="md:flex">
          <div className="md:w-1/3 bg-gray-200 dark:bg-gray-700 flex items-center justify-center p-6">
            <div className="relative w-full h-72 md:h-80">
              {character.imageUrl ? (
                <>
                  <img 
                    src={character.imageUrl} 
                    alt={character.name} 
                    className="w-full h-full object-cover rounded-lg shadow-md"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleImageDownload}
                    className="absolute bottom-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                    title="Download image"
                  >
                    <FiDownload size={18} />
                  </motion.button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-lg">
                  <FiUser className="w-24 h-24 text-gray-400" />
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6 md:p-8 md:w-2/3">
            <div className="space-y-6">
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {character.gender && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</h3>
                      <p className="mt-1 text-base text-gray-800 dark:text-white capitalize">{character.gender}</p>
                    </div>
                  )}
                  
                  {character.age && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Age</h3>
                      <p className="mt-1 text-base text-gray-800 dark:text-white">{character.age}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {character.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                  <p className="mt-1 text-base text-gray-800 dark:text-white">{character.description}</p>
                </div>
              )}
              
              {character.personality && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Personality</h3>
                  <p className="mt-1 text-base text-gray-800 dark:text-white">{character.personality}</p>
                </div>
              )}
              
              {character.interests && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Interests & Hobbies</h3>
                  <p className="mt-1 text-base text-gray-800 dark:text-white">{character.interests}</p>
                </div>
              )}
              
              {character.background && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Background Story</h3>
                  <p className="mt-1 text-base text-gray-800 dark:text-white whitespace-pre-line">{character.background}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {(character.scenario || character.greeting) && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-5 bg-gray-200 dark:bg-gray-800/50">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Character AI Settings</h2>
            
            <div className="space-y-4">
              {character.scenario && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Scenario</h3>
                  <p className="mt-1 text-base text-gray-800 dark:text-white">{character.scenario}</p>
                </div>
              )}
              
              {character.greeting && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">First Message</h3>
                  <p className="mt-1 text-base text-gray-800 dark:text-white">{character.greeting}</p>
                </div>
              )}
              
              <div className="mt-4">
                <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  <FiDownload size={16} /> Download Character AI Format
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterDetail;
