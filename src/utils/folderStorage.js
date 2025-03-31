// Delete a folder
export const deleteFolder = (folderId) => {
  try {
    const folders = getAllFolders();
    const updatedFolders = folders.filter(folder => folder.id !== folderId);
    
    // Save the updated folders to localStorage
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(updatedFolders));
    
    // Force a reload of the folders from localStorage
    const reloadedFolders = getAllFolders();
    
    // Verify the folder was actually deleted
    if (reloadedFolders.some(folder => folder.id === folderId)) {
      throw new Error('Failed to delete folder');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw error;
  }
}; 