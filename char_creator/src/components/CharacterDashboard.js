import { useState } from 'react';
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
  FiFileText 
} from 'react-icons/fi';
import { MdCreate, MdOutlineAutoAwesome } from 'react-icons/md';
import useCharacters from '../hooks/useCharacters';

const CharacterDashboard = () => {
  const { characters, loading, removeCharacter, exportForCharacterAI, downloadCharacterText } = useCharacters();
  const router = useRouter();
  const [exportedData, setExportedData] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

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
    <div className="py-4">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Your Characters</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create, manage, and export your fictional characters</p>
        </div>
        <Link href="/create">
          <motion.button
            whileHover={buttonHover}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-4 rounded-full shadow-md transition-colors"
          >
            <MdCreate size={20} /> New Character
          </motion.button>
        </Link>
      </motion.div>

      {characters.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center py-16 px-4 bg-white dark:bg-gray-800 rounded-2xl shadow-character overflow-hidden"
        >
          <div className="bg-gray-200 dark:bg-gray-700 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiUser className="w-12 h-12 text-primary/60" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">No characters yet</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
            Create your first character to see it here. You can add details, images, and export them for your stories or AI chatbots.
          </p>
          <Link href="/create">
            <motion.button
              whileHover={buttonHover}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-full shadow-md transition-colors mx-auto"
            >
              <FiPlus size={18} /> Create First Character
            </motion.button>
          </Link>
        </motion.div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {characters.map(character => (
            <motion.div
              layout
              key={character.id}
              variants={item}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-character hover:shadow-character-hover character-card transition-all duration-300 w-[250px] h-[180px] mx-auto"
            >
              <div 
                onClick={() => router.push(`/character/${character.id}`)}
                className="cursor-pointer"
              >
                <div className="h-[100px] bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden relative">
                  {character.imageUrl ? (
                    <img 
                      src={character.imageUrl} 
                      alt={character.name} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                      <FiUser className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-1">{character.name}</h3>
                  {character.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">{character.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {character.gender && (
                      <span className="px-2 py-0.5 bg-primary bg-opacity-10 dark:bg-primary dark:bg-opacity-20 text-primary-dark dark:text-primary-light text-xs rounded-full">
                        {character.gender}
                      </span>
                    )}
                    {character.age && (
                      <span className="px-2 py-0.5 bg-secondary bg-opacity-10 dark:bg-secondary dark:bg-opacity-20 text-secondary-dark dark:text-secondary-light text-xs rounded-full">
                        Age: {character.age}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center px-3 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-200 dark:bg-gray-800/90">
                <div className="flex gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleExport(character.id, e, 'text')}
                    className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Download as text format"
                  >
                    <FiFileText size={16} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleExport(character.id, e, 'json')}
                    className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Export for Character AI"
                  >
                    <FiDownload size={16} />
                  </motion.button>
                </div>
                <div className="flex gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/edit/${character.id}`);
                    }}
                    className="text-gray-600 hover:text-secondary dark:text-gray-400 dark:hover:text-secondary-light p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Edit character"
                  >
                    <FiEdit size={16} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleDelete(character.id, e)}
                    className="text-gray-600 hover:text-status-error dark:text-gray-400 dark:hover:text-status-error p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Delete character"
                  >
                    <FiTrash2 size={16} />
                  </motion.button>
                </div>
              </div>

              {/* Delete confirmation overlay */}
              <AnimatePresence>
                {deleteConfirmId === character.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 p-4"
                  >
                    <p className="text-gray-800 dark:text-white font-medium mb-4 text-center">
                      Delete "{character.name}"?
                    </p>
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => confirmDelete(character.id, true)}
                        className="px-4 py-2 bg-status-error text-white rounded-lg"
                      >
                        Delete
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => confirmDelete(character.id, false)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default CharacterDashboard; 
