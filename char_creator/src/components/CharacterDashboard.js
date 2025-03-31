import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  FiPlus, 
  FiTrash2, 
  FiEdit, 
  FiDownload, 
  FiUser, 
  FiMessageSquare,
  FiFileText,
  FiFolder,
  FiEdit2,
  FiAlertCircle,
  FiSearch
} from 'react-icons/fi';
import { MdCreate, MdOutlineAutoAwesome } from 'react-icons/md';
import useCharacters from '../hooks/useCharacters';
import FolderManager from './FolderManager';
import { getAllCharacters, deleteCharacter, exportCharacterAsText, downloadCharacterFile } from '../utils/characterStorage';

const CharacterDashboard = () => {
  const { characters, loading, removeCharacter, exportForCharacterAI, downloadCharacterText } = useCharacters();
  const router = useRouter();
  const [exportedData, setExportedData] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isFolderManagerOpen, setIsFolderManagerOpen] = useState(false);
  const [folders, setFolders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load characters and folders from localStorage on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const charactersData = await getAllCharacters();
        setCharacters(charactersData);

        // Load folders from localStorage
        const savedFolders = localStorage.getItem('characterFolders');
        if (savedFolders) {
          const parsedFolders = JSON.parse(savedFolders);
          // Filter out empty folders
          const nonEmptyFolders = parsedFolders.filter(folder => folder.characters.length > 0);
          setFolders(nonEmptyFolders);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Save folders to localStorage whenever they change
  useEffect(() => {
    // Filter out empty folders before saving
    const nonEmptyFolders = folders.filter(folder => folder.characters.length > 0);
    localStorage.setItem('characterFolders', JSON.stringify(nonEmptyFolders));
  }, [folders]);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDelete = (id, confirm) => {
    if (confirm) {
      removeCharacter(id);
    }
    setDeleteConfirmId(null);
  };

  const handleExport = (id, e, type = 'json') => {
    e.stopPropagation();
    
    if (type === 'json') {
      const data = exportForCharacterAI(id);
      if (data) {
        setExportedData(data);
        
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
    } else if (type === 'text') {
      downloadCharacterText(id);
    }
  };

  // Filter characters based on search term
  const filteredCharacters = searchTerm
    ? characters.filter(char => 
        char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (char.description && char.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : characters;

  // Get characters that are not in any folder
  const unassignedCharacters = filteredCharacters.filter(char => 
    !folders.some(folder => folder.characters.some(c => c.id === char.id))
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    }
  };

  const buttonHover = {
    scale: 1.05,
    transition: { duration: 0.2 }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-60">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-12 h-12 text-primary"
        >
          <MdOutlineAutoAwesome className="w-full h-full" />
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-gray-600 dark:text-gray-300 font-medium"
        >
          Loading characters...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dashboard header with search and actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white animate-slide-in-left">
            Characters
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 animate-slide-in-left" style={{ animationDelay: '100ms' }}>
            {characters.length} {characters.length === 1 ? 'character' : 'characters'} in your collection
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search characters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 dark:border-gray-600 rounded-xl 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Folders Section */}
      {folders.length > 0 && (
        <div className="space-y-6">
          {folders.map(folder => (
            <motion.div
              key={folder.id}
              variants={container}
              initial="hidden"
              animate="show"
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-2 mb-4">
                <FiFolder className="text-primary" size={24} />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{folder.name}</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {folder.characters.map((character) => (
                  <motion.div
                    key={character.id}
                    variants={item}
                    whileHover={{ y: -8, transition: { duration: 0.1 } }}
                    className="group relative flex flex-col rounded-2xl overflow-hidden 
                      bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm 
                      border border-gray-100/50 dark:border-gray-700/50 
                      transition-all duration-300 hover:shadow-2xl hover:shadow-accent/20 
                      dark:hover:shadow-accent/10 cursor-pointer 
                      hover:border-accent/50 dark:hover:border-accent/50"
                  >
                    <div className="aspect-square relative bg-gradient-to-br from-gray-100 to-gray-200 
                      dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                      {character.imageUrl ? (
                        <div className="relative w-full h-full transform transition-transform duration-700 
                          group-hover:scale-110">
                          <img 
                            src={character.imageUrl} 
                            alt={character.name} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center 
                          bg-gradient-to-br from-accent/5 to-accent/10 
                          dark:from-accent/10 dark:to-accent/20">
                          <FiUser className="w-20 h-20 text-accent/40" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex-grow">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 
                        truncate group-hover:text-accent transition-colors duration-300">
                        {character.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 
                        group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors duration-300">
                        {character.description || 'No description provided.'}
                      </p>
                      
                      <div className="flex justify-between items-center mt-auto pt-4 
                        border-t border-gray-100 dark:border-gray-700/50">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={buttonHover}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/edit/${character.id}`);
                            }}
                            className="cursor-pointer p-2.5 text-accent bg-accent/5 hover:bg-accent/10 
                              rounded-xl border border-accent/20 
                              transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 
                              hover:scale-105 hover:border-accent/50"
                            aria-label="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </motion.button>
                          
                          <motion.button
                            whileHover={buttonHover}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(character.id);
                            }}
                            className="cursor-pointer p-2 text-white dark:text-white bg-red-300 dark:bg-red-500 
                              hover:bg-red-200 dark:hover:bg-red-900/20 hover:text-white border border-gray-200 dark:border-gray-600 
                              rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105"
                            aria-label="Delete"
                          >
                            <FiTrash2 />
                          </motion.button>
                        </div>
                        
                        <div className="dropdown relative">
                          <motion.button
                            whileHover={buttonHover}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExport(character.id, e, 'text');
                            }}
                            className="cursor-pointer p-2.5 text-accent bg-accent/5 hover:bg-accent/10 
                              rounded-xl border border-accent/20 
                              transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 
                              hover:scale-105 hover:border-accent/50"
                            aria-label="Export"
                          >
                            <FiDownload />
                          </motion.button>
                          
                          <div className="dropdown-menu opacity-0 invisible absolute right-0 mt-2 py-2 w-48 
                            bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExport(character.id, e, 'text');
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 
                                hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              Export as Text
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExport(character.id, e, 'json');
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 
                                hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              Export as Character
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Unassigned Characters Section */}
      {unassignedCharacters.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Unassigned Characters</h2>
            <motion.button
              whileHover={buttonHover}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFolderManagerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl 
                hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              <FiFolder className="w-5 h-5" />
              Organize
            </motion.button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {unassignedCharacters.map((character) => (
              <motion.div
                key={character.id}
                variants={item}
                whileHover={{ y: -8, transition: { duration: 0.1 } }}
                className="group relative flex flex-col rounded-2xl overflow-hidden 
                  bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm 
                  border border-gray-100/50 dark:border-gray-700/50 
                  transition-all duration-300 hover:shadow-2xl hover:shadow-accent/20 
                  dark:hover:shadow-accent/10 cursor-pointer 
                  hover:border-accent/50 dark:hover:border-accent/50"
              >
                <div className="aspect-square relative bg-gradient-to-br from-gray-100 to-gray-200 
                  dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                  {character.imageUrl ? (
                    <div className="relative w-full h-full transform transition-transform duration-700 
                      group-hover:scale-110">
                      <img 
                        src={character.imageUrl} 
                        alt={character.name} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center 
                      bg-gradient-to-br from-accent/5 to-accent/10 
                      dark:from-accent/10 dark:to-accent/20">
                      <FiUser className="w-20 h-20 text-accent/40" />
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex-grow">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 
                    truncate group-hover:text-accent transition-colors duration-300">
                    {character.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 
                    group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors duration-300">
                    {character.description || 'No description provided.'}
                  </p>
                  
                  <div className="flex justify-between items-center mt-auto pt-4 
                    border-t border-gray-100 dark:border-gray-700/50">
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={buttonHover}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/edit/${character.id}`);
                        }}
                        className="cursor-pointer p-2.5 text-accent bg-accent/5 hover:bg-accent/10 
                          rounded-xl border border-accent/20 
                          transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 
                          hover:scale-105 hover:border-accent/50"
                        aria-label="Edit"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={buttonHover}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(character.id);
                        }}
                        className="cursor-pointer p-2 text-white dark:text-white bg-red-300 dark:bg-red-500 
                          hover:bg-red-200 dark:hover:bg-red-900/20 hover:text-white border border-gray-200 dark:border-gray-600 
                          rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105"
                        aria-label="Delete"
                      >
                        <FiTrash2 />
                      </motion.button>
                    </div>
                    
                    <div className="dropdown relative">
                      <motion.button
                        whileHover={buttonHover}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExport(character.id, e, 'text');
                        }}
                        className="cursor-pointer p-2.5 text-accent bg-accent/5 hover:bg-accent/10 
                          rounded-xl border border-accent/20 
                          transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 
                          hover:scale-105 hover:border-accent/50"
                        aria-label="Export"
                      >
                        <FiDownload />
                      </motion.button>
                      
                      <div className="dropdown-menu opacity-0 invisible absolute right-0 mt-2 py-2 w-48 
                        bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExport(character.id, e, 'text');
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 
                            hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          Export as Text
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExport(character.id, e, 'json');
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 
                            hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          Export as Character
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Character</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Are you sure you want to delete this character? This action cannot be undone.
              </p>
              
              <div className="flex justify-end gap-3">
                <motion.button
                  whileHover={buttonHover}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  whileHover={buttonHover}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => confirmDelete(deleteConfirmId, true)}
                  className="px-4 py-2 bg-status-error text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  <FiTrash2 className="inline-block mr-2" />
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Folder Manager Modal */}
      <FolderManager
        isOpen={isFolderManagerOpen}
        onClose={() => setIsFolderManagerOpen(false)}
        characters={characters}
        onUpdateFolders={setFolders}
      />
    </div>
  );
};

export default CharacterDashboard;
