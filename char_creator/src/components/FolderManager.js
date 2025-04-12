import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFolder, FiFolderPlus, FiX, FiMove, FiUsers, FiTrash2, FiCheck } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  getAllFolders, 
  createFolder, 
  deleteFolder, 
  updateFolderName,
  addCharacterToFolder,
  removeCharacterFromFolder,
  moveCharacterToFolder,
  saveFolders
} from '../utils/folderStorage';

const FolderManager = ({ isOpen, onClose, characters, onUpdateFolders }) => {
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isAssigningCharacters, setIsAssigningCharacters] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [availableCharacters, setAvailableCharacters] = useState([]);
  const [folderToDelete, setFolderToDelete] = useState(null);

  // Load folders when component mounts or modal opens
  useEffect(() => {
    const loadFolders = () => {
      const savedFolders = getAllFolders();
      setFolders(savedFolders);
    };
    if (isOpen) {
      loadFolders(); // Reload folders when modal opens
    }
  }, [isOpen]);

  // Update parent component when folders change
  useEffect(() => {
    onUpdateFolders(folders);
  }, [folders, onUpdateFolders]);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder = createFolder(newFolderName.trim());
      if (newFolder) {
        setFolders([...folders, newFolder]);
        setNewFolderName('');
        setIsCreatingFolder(false);
      }
    }
  };

  const handleDeleteFolder = (folderId) => {
    if (deleteFolder(folderId)) {
      const updatedFolders = folders.filter(folder => folder.id !== folderId);
      setFolders(updatedFolders);
      onUpdateFolders(updatedFolders); // Update parent component immediately
      setFolderToDelete(null);
    }
  };

  const handleRenameFolder = (folderId, newName) => {
    if (updateFolderName(folderId, newName)) {
      setFolders(folders.map(folder => 
        folder.id === folderId ? { ...folder, name: newName } : folder
      ));
    }
  };

  const handleAssignCharacters = (folder) => {
    setSelectedFolder(folder);
    // Get characters that are not in the selected folder
    const unassignedChars = characters.filter(char => 
      !folder.characters.some(c => c.id === char.id)
    );
    setAvailableCharacters(unassignedChars);
    setIsAssigningCharacters(true);
  };

  const handleCharacterSelect = (characterId) => {
    setSelectedCharacters(prev => 
      prev.includes(characterId) 
        ? prev.filter(id => id !== characterId)
        : [...prev, characterId]
    );
  };

  const handleConfirmAssignment = () => {
    if (selectedFolder) {
      // Add selected characters to the folder
      const updatedFolders = folders.map(folder => {
        if (folder.id === selectedFolder.id) {
          // Get the full character objects for selected IDs
          const charactersToAdd = characters.filter(char => 
            selectedCharacters.includes(char.id)
          );
          
          // Combine existing characters with new ones
          const updatedCharacters = [
            ...folder.characters,
            ...charactersToAdd
          ];
          
          return {
            ...folder,
            characters: updatedCharacters
          };
        }
        return folder;
      });
      
      // Save to localStorage
      saveFolders(updatedFolders);
      
      // Update local state
      setFolders(updatedFolders);
      setIsAssigningCharacters(false);
      setSelectedFolder(null);
      setSelectedCharacters([]);
      setAvailableCharacters([]);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // Moving folders
    if (result.type === 'folder') {
      const newFolders = Array.from(folders);
      const [removed] = newFolders.splice(source.index, 1);
      newFolders.splice(destination.index, 0, removed);
      saveFolders(newFolders);
      setFolders(newFolders);
    }
    // Moving characters between folders
    else if (result.type === 'character') {
      const sourceFolderId = source.droppableId;
      const destinationFolderId = destination.droppableId;

      if (sourceFolderId === destinationFolderId) {
        // Reordering within the same folder
        const folder = folders.find(f => f.id === sourceFolderId);
        const newCharacters = Array.from(folder.characters);
        const [removed] = newCharacters.splice(source.index, 1);
        newCharacters.splice(destination.index, 0, removed);

        const updatedFolders = folders.map(f => {
          if (f.id === sourceFolderId) {
            return { ...f, characters: newCharacters };
          }
          return f;
        });
        saveFolders(updatedFolders);
        setFolders(updatedFolders);
      } else {
        // Moving between folders
        moveCharacterToFolder(draggableId, sourceFolderId, destinationFolderId);
        const updatedFolders = getAllFolders();
        setFolders(updatedFolders);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Organize Characters
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Your Folders</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCreatingFolder(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl 
                    hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                  <FiFolderPlus size={20} />
                  New Folder
                </motion.button>
              </div>

              {isCreatingFolder && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
                >
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Enter folder name"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 
                      text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="flex gap-2 mt-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCreateFolder}
                      className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg 
                        hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                    >
                      Create
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsCreatingFolder(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg 
                        hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.div>
              )}

              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {folders.map(folder => (
                    <motion.div
                      key={folder.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <FiFolder className="text-primary" size={20} />
                          <h4 className="font-semibold text-gray-800 dark:text-white">{folder.name}</h4>
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleAssignCharacters(folder)}
                            className="p-2 text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light 
                              rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title="Assign characters"
                          >
                            <FiUsers size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setFolderToDelete(folder)}
                            className="p-2 text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 
                              rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title="Delete folder"
                          >
                            <FiTrash2 size={18} />
                          </motion.button>
                        </div>
                      </div>

                      <Droppable droppableId={folder.id}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="min-h-[100px] space-y-2"
                          >
                            {folder.characters.map((character, index) => (
                              <Draggable
                                key={character.id}
                                draggableId={character.id}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm 
                                      border border-gray-200 dark:border-gray-600"
                                  >
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                                      {character.imageUrl ? (
                                        <img 
                                          src={character.imageUrl} 
                                          alt={character.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <FiUser className="w-4 h-4 text-gray-400" />
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                      {character.name}
                                    </span>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </motion.div>
                  ))}
                </div>
              </DragDropContext>

              <div className="mt-6 flex justify-end gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl 
                    hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    saveFolders(folders);
                    onUpdateFolders(folders);
                    onClose();
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl 
                    hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                  Save Changes
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {folderToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Delete Folder</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete the folder "{folderToDelete.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFolderToDelete(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl 
                    hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeleteFolder(folderToDelete.id)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character Assignment Modal */}
      <AnimatePresence>
        {isAssigningCharacters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden 
                border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 
                dark:from-gray-800 dark:to-gray-900">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white bg-gradient-to-r from-primary to-secondary 
                    bg-clip-text text-transparent">
                    Assign Characters
                  </h2>
                  <button
                    onClick={() => {
                      setIsAssigningCharacters(false);
                      setSelectedFolder(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    <FiX size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {characters.map((character, index) => (
                    <motion.div
                      key={character.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer
                        ${selectedCharacters.includes(character.id)
                          ? 'bg-primary/10 dark:bg-primary/20 border-primary'
                          : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                        }`}
                      onClick={() => handleCharacterSelect(character.id)}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        {character.imageUrl ? (
                          <img 
                            src={character.imageUrl} 
                            alt={character.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiUser className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 flex-grow">{character.name}</span>
                      {selectedCharacters.includes(character.id) && (
                        <FiCheck className="text-primary w-5 h-5" />
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsAssigningCharacters(false);
                      setSelectedFolder(null);
                      setSelectedCharacters([]);
                    }}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl 
                      hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleConfirmAssignment}
                    className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl 
                      hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                  >
                    Confirm
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default FolderManager;