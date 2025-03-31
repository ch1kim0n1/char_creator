const handleDeleteFolder = (folderId) => {
  try {
    deleteFolder(folderId);
    
    // Update the local state
    const updatedFolders = folders.filter(f => f.id !== folderId);
    setFolders(updatedFolders);
    
    // Close the modal
    setShowDeleteFolderConfirm(null);
    
    // Close the folder manager if it's open
    setIsFolderManagerOpen(false);
  } catch (error) {
    console.error('Error deleting folder:', error);
    alert('Failed to delete folder. Please try again.');
  }
}; 