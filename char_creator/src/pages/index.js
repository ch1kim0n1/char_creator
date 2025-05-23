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
  FiSend,
  FiDownloadCloud,
  FiGithub,
  FiUsers,
  FiFolder,
  FiBarChart2
} from 'react-icons/fi';
import { MdOutlineAutoAwesome, MdCreate } from 'react-icons/md';
import { 
  getAllCharacters, 
  deleteCharacter, 
  exportCharacterAsText, 
  downloadCharacterFile 
} from '../utils/characterStorage';
import { getAllFolders, deleteFolder } from '../utils/folderStorage';
import IntroAnimation from '../components/IntroAnimation';
import FolderManager from '../components/FolderManager';
import Footer from '../components/website_essentials/Footer';

export default function Home() {
  const router = useRouter();
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [emptyState, setEmptyState] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showHelpPopup, setShowHelpPopup] = useState(false);
  const [isFolderManagerOpen, setIsFolderManagerOpen] = useState(false);
  const [folders, setFolders] = useState([]);
  const [showDeleteFolderConfirm, setShowDeleteFolderConfirm] = useState(null);

  // Add this object for button descriptions
  const buttonDescriptions = {
    replay: "Replay the introduction animation",
    feedback: "Feedback Page",
    about: "About Page",
    github: "Author's GitHub profile",
    relationships: "Map relationships between your characters",
    stats: "Characters' Statistics"
  };
  
  const handleReplayIntro = () => {
    setShowIntro(true);
  };

  useEffect(() => {
    // For testing, remove this line in production
    localStorage.removeItem('disclaimerAcknowledged');
    
    // Check if the disclaimer has been acknowledged in this session
    const hasAcknowledged = sessionStorage.getItem('disclaimerAcknowledged');
    if (hasAcknowledged === 'true') {
      setShowDisclaimer(false);
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

    // Load characters and folders from localStorage on component mount
    const loadData = async () => {
      try {
        const charactersData = await getAllCharacters();
        setCharacters(charactersData);

        // Load folders using the new folderStorage functions
        const savedFolders = getAllFolders();
        setFolders(savedFolders);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
    if (!hasSeenIntro) {
      setShowIntro(true);
      sessionStorage.setItem('hasSeenIntro', 'true');
    }
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
      
      // Update folders to remove the deleted character
      const updatedFolders = folders.map(folder => ({
        ...folder,
        characters: folder.characters.filter(char => char.id !== id)
      })).filter(folder => folder.characters.length > 0);
      setFolders(updatedFolders);
      
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

  const handleDisclaimerAgree = () => {
    // Store in sessionStorage instead of localStorage to persist across tabs but reset on browser close
    sessionStorage.setItem('disclaimerAcknowledged', 'true');
    setShowDisclaimer(false);
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
  
  const handleExportAllData = async () => {
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const imagesFolder = zip.folder('images');
      const charactersFolder = zip.folder('characters');

      // Process each character separately
      for (const character of characters) {
        // Create a clean version of character data without imageUrl
        const characterData = { ...character };
        delete characterData.imageUrl;
        
        // Add relationships data if it exists in localStorage
        const relationshipKey = `relationships_${character.id}`;
        const relationships = localStorage.getItem(relationshipKey);
        if (relationships) {
          characterData.relationships = JSON.parse(relationships);
        }
        
        // Save character data as individual JSON file
        const fileName = `${character.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        charactersFolder.file(fileName, JSON.stringify(characterData, null, 2));

        // Save image if exists
        if (character.imageUrl) {
          try {
            const response = await fetch(character.imageUrl);
            if (!response.ok) throw new Error('Image fetch failed');
            const blob = await response.blob();
            const imgFileName = `${character.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
            imagesFolder.file(imgFileName, blob);
          } catch (error) {
            // Silently continue if image fetch fails - this is expected for data URLs
            console.debug(`Skipping image fetch for ${character.name}`);
            continue;
          }
        }
      }

      // Generate and download the zip file
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Download the file
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'char_creator_backup.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      // Only show error for actual failures, not for expected fetch issues
      if (!(error instanceof TypeError && error.message === 'Failed to fetch')) {
        console.error('Error exporting data:', error);
        alert('Failed to export data. Please try again.');
      }
    }
  };

  const handleRelationships = () => {
    router.push('/relationships');
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      await deleteFolder(folderId);
      
      // Update the local state
      const updatedFolders = folders.filter(f => f.id !== folderId);
      setFolders(updatedFolders);
      
      // Close the modal
      setShowDeleteFolderConfirm(null);
      
      // Close the folder manager if it's open
      setIsFolderManagerOpen(false);
      
      // Force a reload of folders from localStorage
      const reloadedFolders = getAllFolders();
      setFolders(reloadedFolders);
    } catch (error) {
      console.error('Error deleting folder:', error);
      alert('Failed to delete folder. Please try again.');
    }
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

  // Get characters that are not in any folder
  const unassignedCharacters = filteredCharacters.filter(char => 
    !folders.some(folder => folder.characters.some(c => c.id === char.id))
  );

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <IntroAnimation onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>
      
      <Head>
        <title>char_creator</title>
        <meta name="description" content="Create and manage your fictional characters for Character.AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200 flex flex-col">
        {/* Header with theme toggle */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
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
                  char_creator
                </motion.h1>
              </div>
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateCharacter}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl 
                    hover:bg-primary-dark transition-all duration-300 
                    border border-primary/20 shadow-lg shadow-white/20 
                    hover:shadow-xl hover:shadow-white/30 cursor-pointer border border-accent/20 hover:border-white/30"
                >
                  <FiPlus className="w-5 h-5" />
                  New Character
                </motion.button>

                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleReplayIntro}
                  className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 
                    hover:text-accent dark:hover:text-accent border border-gray-200 dark:border-gray-600 
                    transition-all duration-300 hover:shadow-md hover:scale-105 cursor-pointer"
                  aria-label="Replay Intro"
                  onMouseEnter={() => setShowHelpPopup(true)}
                  onMouseLeave={() => setShowHelpPopup(false)}
                >
                  <MdOutlineAutoAwesome className="w-5 h-5" />
                </motion.button>

                <Link 
                  href="/feedback" 
                  className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 
                    hover:text-accent dark:hover:text-accent border border-gray-200 dark:border-gray-600 
                    transition-all duration-300 hover:shadow-md hover:scale-105"
                  aria-label="Feedback"
                  onMouseEnter={() => setShowHelpPopup(true)}
                  onMouseLeave={() => setShowHelpPopup(false)}
                >
                  <FiSend className="w-5 h-5" />
                </Link>

                <Link 
                  href="/about" 
                  className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 
                    hover:text-accent dark:hover:text-accent border border-gray-200 dark:border-gray-600 
                    transition-all duration-300 hover:shadow-md hover:scale-105 cursor-pointer"
                  aria-label="About"
                  onMouseEnter={() => setShowHelpPopup(true)}
                  onMouseLeave={() => setShowHelpPopup(false)}
                >
                  <FiInfo className="w-5 h-5" />
                </Link>

                <Link 
                  href="https://github.com/ch1kim0n1" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 
                    hover:text-accent dark:hover:text-accent border border-gray-200 dark:border-gray-600 
                    transition-all duration-300 hover:shadow-md hover:scale-105"
                  aria-label="GitHub"
                  onMouseEnter={() => setShowHelpPopup(true)}
                  onMouseLeave={() => setShowHelpPopup(false)}
                >
                  <FiGithub className="w-5 h-5" />
                </Link>

                <Link 
                  href="/statistics" 
                  className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 
                    hover:text-accent dark:hover:text-accent border border-gray-200 dark:border-gray-600 
                    transition-all duration-300 hover:shadow-md hover:scale-105"
                  aria-label="Statistics"
                  onMouseEnter={() => setShowHelpPopup(true)}
                  onMouseLeave={() => setShowHelpPopup(false)}
                >
                  <FiBarChart2 className="w-5 h-5" />
                </Link>
              </div>

              {/* Help Popup */}
              <AnimatePresence>
                {showHelpPopup && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-16 right-4 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MdOutlineAutoAwesome className="w-4 h-4 text-accent" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{buttonDescriptions.replay}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiSend className="w-4 h-4 text-accent" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{buttonDescriptions.feedback}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiInfo className="w-4 h-4 text-accent" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{buttonDescriptions.about}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiGithub className="w-4 h-4 text-accent" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{buttonDescriptions.github}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiBarChart2 className="w-4 h-4 text-accent" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{buttonDescriptions.stats}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
          {/* Dashboard header with search and actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white animate-slide-in-left">
                Characters
              </h1>
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
                    className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 dark:border-gray-600 rounded-xl 
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </motion.div>
              )}
              
              <div className="flex gap-2">
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setIsFolderManagerOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 
                    bg-gradient-to-r from-primary to-secondary text-white rounded-xl 
                    transition-all duration-300 shadow-lg shadow-primary/20 
                    hover:shadow-xl hover:shadow-primary/30 cursor-pointer
                    border border-primary/20 hover:border-white/30"
                  title="Organize characters into folders"
                >
                  <FiFolder className="text-lg" />
                  <span className="hidden sm:inline">Organize</span>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleExportAllData}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 
                    bg-gradient-to-r from-primary to-secondary text-white rounded-xl 
                    transition-all duration-300 shadow-lg shadow-primary/20 
                    hover:shadow-xl hover:shadow-primary/30 cursor-pointer
                    border border-primary/20 hover:border-white/30"
                  title="Download all characters and images as ZIP"
                >
                  <FiDownloadCloud className="text-lg" />
                  <span className="hidden sm:inline">Export All</span>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleRelationships}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 
                    bg-gradient-to-r from-primary to-secondary text-white rounded-xl 
                    transition-all duration-300 shadow-lg shadow-primary/20 
                    hover:shadow-xl hover:shadow-primary/30 cursor-pointer
                    border border-primary/20 hover:border-white/30"
                  title={buttonDescriptions.relationships}
                >
                  <FiUsers className="text-lg" />
                  <span className="hidden sm:inline">Relationships</span>
                </motion.button>
              </div>
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
            <>
              {/* Folders Section */}
              {folders.length > 0 && (
                <div className="space-y-6 mb-8">
                  {folders.map(folder => (
                    <motion.div
                      key={folder.id}
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <FiFolder className="text-primary" size={24} />
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{folder.name}</h2>
                        </div>
                        
                        {/* Quick access buttons */}
                        <div className="flex items-center gap-2">
                          <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsFolderManagerOpen(true);
                            }}
                            className="cursor-pointer p-2 text-accent bg-accent/5 hover:bg-accent/10 
                              rounded-xl border border-accent/20 
                              transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 
                              hover:scale-105"
                            title="Assign Characters"
                          >
                            <FiPlus className="w-4 h-4" />
                          </motion.button>
                          
                          <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteFolderConfirm(folder.id);
                            }}
                            className="cursor-pointer p-2 text-white bg-red-300 dark:bg-red-500 
                              hover:bg-red-200 dark:hover:bg-red-900/20 
                              rounded-xl border border-red-200 dark:border-red-600 
                              transition-all duration-300 hover:shadow-md hover:scale-105"
                            title="Delete Folder"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {folder.characters.map((character) => (
                          <motion.div
                            key={character.id}
                            variants={itemVariants}
                            whileHover={{ y: -8, transition: { duration: 0.1 } }}
                            onClick={() => handleViewCharacter(character.id)}
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
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    onClick={(e) => handleEditCharacter(e, character.id)}
                                    className="cursor-pointer p-2.5 text-accent bg-accent/5 hover:bg-accent/10 
                                      rounded-xl border border-accent/20 
                                      transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 
                                      hover:scale-105 hover:border-accent/50"
                                    aria-label="Edit"
                                  >
                                    <FiEdit2 className="w-4 h-4" />
                                  </motion.button>
                                  
                                  <motion.button
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    onClick={(e) => confirmDelete(e, character.id)}
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
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    onClick={(e) => handleExportCharacter(e, character)}
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
                                      onClick={(e) => handleExportCharacter(e, character, 'text')}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 
                                        hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                      Export as Text
                                    </button>
                                    <button 
                                      onClick={(e) => handleExportCharacter(e, character, 'character')}
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
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Unassigned Characters</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {unassignedCharacters.map((character) => (
                      <motion.div
                        key={character.id}
                        variants={itemVariants}
                        whileHover={{ y: -8, transition: { duration: 0.1 } }}
                        onClick={() => handleViewCharacter(character.id)}
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
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={(e) => handleEditCharacter(e, character.id)}
                                className="cursor-pointer p-2.5 text-accent bg-accent/5 hover:bg-accent/10 
                                  rounded-xl border border-accent/20 
                                  transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 
                                  hover:scale-105 hover:border-accent/50"
                                aria-label="Edit"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </motion.button>
                              
                              <motion.button
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={(e) => confirmDelete(e, character.id)}
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
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={(e) => handleExportCharacter(e, character)}
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
                                  onClick={(e) => handleExportCharacter(e, character, 'text')}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 
                                    hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                  Export as Text
                                </button>
                                <button 
                                  onClick={(e) => handleExportCharacter(e, character, 'character')}
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
            </>
          )}
        </main>

        <Footer />
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
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4"
          >
            <div className="absolute inset-0 bg-black/50" />
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transition-all duration-300 relative z-10"
            >
              <div className="flex items-center gap-3 mb-4">
                <FiAlertCircle className="text-accent text-2xl flex-shrink-0" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Important Disclaimer</h2>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                char_creator is a <span className="font-semibold">fan-made tool</span> and is not 
                affiliated with, endorsed by, or connected to Character.AI in any way. This is an 
                independent project created to help the community.
              </p>
              
              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="agreement"
                  checked={disclaimerAgreed}
                  onChange={() => setDisclaimerAgreed(!disclaimerAgreed)}
                  className="w-5 h-5 accent-accent rounded mr-3 cursor-pointer"
                />
                <label 
                  htmlFor="agreement" 
                  className="text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                >
                  I understand that this tool is not affiliated with Character.AI
                </label>
              </div>
              
              <div className="flex justify-end">
                <motion.button
                  variants={buttonVariants}
                  whileHover={disclaimerAgreed ? { 
                    scale: 1.02,
                    boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
                  } : {}}
                  whileTap={disclaimerAgreed ? { scale: 0.98 } : {}}
                  animate={disclaimerAgreed ? {
                    y: [0, -2, 0],
                    transition: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  } : {}}
                  onClick={handleDisclaimerAgree}
                  disabled={!disclaimerAgreed}
                  className={`
                    px-6 py-3 rounded-xl
                    relative overflow-hidden
                    transition-all duration-300
                    ${disclaimerAgreed 
                      ? 'bg-gradient-to-r from-accent to-accent-light text-white ' +
                        'border-2 border-accent/20 ' +
                        'shadow-lg shadow-white/20 ' +
                        'hover:shadow-xl hover:shadow-white/30 ' +
                        'hover:border-white/30 ' +
                        'active:shadow-inner ' +
                        'transform perspective-1000 cursor-pointer'
                      : 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 ' +
                        'border-2 border-gray-400/20 ' +
                        'cursor-not-allowed'
                    }
                  `}
                >
                  <motion.span
                    animate={disclaimerAgreed ? {
                      background: [
                        "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)",
                        "linear-gradient(90deg, rgba(255,255,255,0) 100%, rgba(255,255,255,0.1) 150%, rgba(255,255,255,0) 200%)"
                      ],
                      x: [-200, 200]
                    } : {}}
                    transition={disclaimerAgreed ? {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear"
                    } : {}}
                    className="absolute inset-0 z-0"
                  />
                  <span className="relative z-10">Continue</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add FolderManager component at the end of the component */}
      <FolderManager
        isOpen={isFolderManagerOpen}
        onClose={() => setIsFolderManagerOpen(false)}
        characters={characters}
        onUpdateFolders={setFolders}
      />

      {/* Add Folder Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteFolderConfirm && (
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Folder</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Are you sure you want to delete this folder? The characters will be unassigned but not deleted.
              </p>
              
              <div className="flex justify-end gap-3">
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setShowDeleteFolderConfirm(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleDeleteFolder(showDeleteFolderConfirm)}
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
    </>
  );
}
