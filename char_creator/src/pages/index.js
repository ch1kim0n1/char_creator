import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  FiPlus, 
  FiUser, 
  FiEdit2, 
  FiTrash2, 
  FiDownload, 
  FiAlertCircle, 
  FiSearch, 
  FiMoon, 
  FiSun,
  FiMessageSquare,
  FiInfo,
  FiShield,
  FiHeart,
  FiSend
} from 'react-icons/fi';
import { MdOutlineAutoAwesome } from 'react-icons/md';
import { 
  getAllCharacters, 
  deleteCharacter, 
  exportCharacterAsText, 
  downloadCharacterFile 
} from '../utils/characterStorage';

export default function Home() {
  const router = useRouter();
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [emptyState, setEmptyState] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);
  
  useEffect(() => {
    // For testing, remove this line in production
    localStorage.removeItem('disclaimerAcknowledged');
    
    // Check if user has already acknowledged the disclaimer
    const hasAcknowledgedDisclaimer = localStorage.getItem('disclaimerAcknowledged');
    if (hasAcknowledgedDisclaimer === 'true') {
      setShowDisclaimer(false);
    } else {
      setShowDisclaimer(true); // Explicitly set to true if not acknowledged
    }
    
    // Check for dark mode preference
    if (typeof window !== 'undefined') {
      const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(isDarkMode);
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      }
    }

    // Fetch characters
    const loadCharacters = async () => {
      try {
        const charactersData = await getAllCharacters();
        setCharacters(charactersData);
        setEmptyState(charactersData.length === 0);
      } catch (error) {
        console.error('Error loading characters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacters();
  }, []);

  const handleCreateCharacter = () => {
    router.push('/create');
  };

  const handleViewCharacter = (id) => {
    router.push(`/character/${id}`);
  };

  const handleEditCharacter = (e, id) => {
    e.stopPropagation();
    router.push(`/edit/${id}`);
  };

  const confirmDelete = (e, id) => {
    e.stopPropagation();
    setShowDeleteConfirm(id);
  };

  const handleDeleteCharacter = async (id) => {
    try {
      await deleteCharacter(id);
      setCharacters(characters.filter(char => char.id !== id));
      setShowDeleteConfirm(null);
      
      if (characters.length === 1) {
        setEmptyState(true);
      }
    } catch (error) {
      console.error('Error deleting character:', error);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(null);
  };
  
  const handleExportCharacter = async (e, character, format = 'text') => {
    e.stopPropagation();
    
    if (format === 'text') {
      // Export as plain text
      const textData = exportCharacterAsText(character);
      const blob = new Blob([textData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${character.name.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Export as character.ai format
      await downloadCharacterFile(character);
    }
  };
  
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', newDarkMode);
      
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleDisclaimerAgree = () => {
    localStorage.setItem('disclaimerAcknowledged', 'true');
    setShowDisclaimer(false);
  };

  // Filter characters based on search term
  const filteredCharacters = searchTerm
    ? characters.filter(char => 
        char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (char.description && char.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : characters;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
  };

  // Empty state illustrations
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-48 h-48 mb-6 relative">
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <FiMessageSquare className="w-24 h-24 text-accent/30" />
        </motion.div>
        <motion.div 
          className="absolute inset-4 flex items-center justify-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <FiUser className="w-20 h-20 text-accent/40" />
        </motion.div>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No Characters Yet</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        Create your first fictional character to get started. Bring your stories to life with detailed personalities.
      </p>
      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={handleCreateCharacter}
        className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl hover:bg-accent-dark transition-colors shadow-md shadow-accent/20"
      >
        <FiPlus />
        Create First Character
      </motion.button>
    </div>
  );

  return (
    <>
      <Head>
        <title>C.AI Character Creator</title>
        <meta name="description" content="Create and manage your fictional characters for Character.AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-200 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
        {/* Header with theme toggle */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="flex items-center mr-2">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="text-accent text-2xl"
                  >
                    <MdOutlineAutoAwesome className="animate-sparkle" />
                  </motion.div>
                </div>
                <motion.h1 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-bold text-gray-900 dark:text-white"
                >
                  C.AI Character Creator
                </motion.h1>
              </div>
              
              <div className="flex items-center gap-4">
                <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent-light transition-colors">
                  <FiInfo className="w-5 h-5" />
                </Link>
                
                <Link href="/feedback" className="text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent-light transition-colors">
                  <FiSend className="w-5 h-5" />
                </Link>
                
                <button 
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                  aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                </button>
                
                <Link 
                  href="/settings" 
                  className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                  aria-label="Settings"
                >
                  <FiShield className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
          {/* Dashboard header with search and actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white animate-slide-in-left">Characters</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 animate-slide-in-left" style={{ animationDelay: '100ms' }}>
                {characters.length} {characters.length === 1 ? 'character' : 'characters'} in your collection
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {!emptyState && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search characters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </motion.div>
              )}
              
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleCreateCharacter}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent to-accent-light text-white rounded-xl hover:bg-accent-dark transition-all duration-300 shadow-lg shadow-accent/20 hover-glow"
              >
                <FiPlus className="text-lg" />
                New Character
              </motion.button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <motion.div 
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full"
              ></motion.div>
            </div>
          ) : emptyState ? (
            <EmptyState />
          ) : filteredCharacters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FiAlertCircle className="w-16 h-16 text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No Results Found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No characters match your search query. Try a different search term.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-accent hover:text-accent-dark font-medium"
              >
                Clear search
              </button>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredCharacters.map((character) => (
                <motion.div
                  key={character.id}
                  variants={itemVariants}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  onClick={() => handleViewCharacter(character.id)}
                  className="relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-all duration-300 shadow-md cursor-pointer hover-glow"
                >
                  <div className="aspect-square relative bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    {character.imageUrl ? (
                      <img 
                        src={character.imageUrl} 
                        alt={character.name} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiUser className="w-20 h-20 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1 truncate">
                      {character.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {character.description || 'No description provided.'}
                    </p>
                    
                    <div className="flex justify-between">
                      <div className="flex gap-1">
                        <motion.button
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          onClick={(e) => handleEditCharacter(e, character.id)}
                          className="p-2 text-accent hover:bg-accent/20 rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
                          aria-label="Edit"
                        >
                          <FiEdit2 />
                        </motion.button>
                        
                        <motion.button
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          onClick={(e) => confirmDelete(e, character.id)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-status-error rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
                          aria-label="Delete"
                        >
                          <FiTrash2 />
                        </motion.button>
                      </div>
                      
                      <div className="dropdown relative">
                        <motion.button
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          onClick={(e) => handleExportCharacter(e, character)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                          aria-label="Export"
                        >
                          <FiDownload />
                        </motion.button>
                        
                        <div className="dropdown-menu opacity-0 invisible absolute right-0 mt-2 py-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                          <button 
                            onClick={(e) => handleExportCharacter(e, character, 'text')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          >
                            Export as Text
                          </button>
                          <button 
                            onClick={(e) => handleExportCharacter(e, character, 'character')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          >
                            Export as Character
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </main>

        {/* Footer with heart */}
        <footer className="footer">
          <p>Made with <span className="text-accent hover:scale-125 inline-block transition-transform duration-300 animate-heartbeat"><FiHeart /></span> for character creators</p>
        </footer>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
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
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleCancelDelete}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleDeleteCharacter(showDeleteConfirm)}
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

      {/* Disclaimer Overlay */}
      {showDisclaimer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <FiAlertCircle className="text-accent text-2xl flex-shrink-0" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Important Disclaimer</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              C.AI Character Creator is a <span className="font-semibold">fan-made tool</span> and is not 
              affiliated with, endorsed by, or connected to Character.AI in any way. This is an 
              independent project created to help the community.
            </p>
            
            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="agreement"
                checked={disclaimerAgreed}
                onChange={() => setDisclaimerAgreed(!disclaimerAgreed)}
                className="w-5 h-5 accent-accent rounded mr-3"
              />
              <label 
                htmlFor="agreement" 
                className="text-gray-700 dark:text-gray-300 cursor-pointer select-none"
              >
                I understand that this tool is not affiliated with Character.AI
              </label>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleDisclaimerAgree}
                disabled={!disclaimerAgreed}
                className={`px-6 py-3 rounded-xl ${
                  disclaimerAgreed 
                    ? 'bg-gradient-to-r from-accent to-accent-light text-white hover:shadow-lg shadow-accent/20 hover:scale-[1.02] transition-all duration-300' 
                    : 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                } transition-colors`}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
