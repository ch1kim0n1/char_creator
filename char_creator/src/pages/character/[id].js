import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiEdit2, 
  FiTrash2, 
  FiArrowLeft, 
  FiDownload, 
  FiUser, 
  FiMessageSquare,
  FiInfo,
  FiHeart,
  FiThumbsDown,
  FiBookOpen,
  FiX,
  FiClock,
  FiUsers,
  FiTarget,
  FiStar,
  FiAward,
  FiShield,
  FiEdit,
  FiShare2
} from 'react-icons/fi';
import { MdHeight, MdLanguage, MdWork, MdAutoAwesome } from 'react-icons/md';
import { getCharacterById, deleteCharacter, exportCharacterAsText, downloadCharacterBundle } from '../../utils/characterStorage';
import CharacterAITutorial from '../../components/CharacterAITutorial';
import VersionHistoryModal from '../../components/VersionHistoryModal';
import useCharacters from '../../hooks/useCharacters';

// Add relationship type icons mapping
const RELATIONSHIP_ICONS = {
  friend: FiUsers,
  family: FiHeart,
  enemy: FiTarget,
  mentor: FiStar,
  student: FiAward,
  ally: FiShield,
  custom: FiEdit
};

export default function CharacterDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [character, setCharacter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('text');
  const [showTutorial, setShowTutorial] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versions, setVersions] = useState([]);
  const [relationships, setRelationships] = useState({});
  const [relatedCharacters, setRelatedCharacters] = useState([]);
  const { getVersions, updateCharacter } = useCharacters();
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [shareError, setShareError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchCharacter = async () => {
        try {
          const characterData = await getCharacterById(id);
          setCharacter(characterData);
          const versionHistory = getVersions(id);
          setVersions(versionHistory);

          // Load relationships
          const savedRelationships = localStorage.getItem('characterRelationships');
          if (savedRelationships) {
            const relationshipsData = JSON.parse(savedRelationships);
            setRelationships(relationshipsData);

            // Get related characters
            const related = [];
            if (relationshipsData[id]) {
              // Use Promise.all to handle async operations
              const relatedPromises = Object.entries(relationshipsData[id]).map(async ([relatedId, relationship]) => {
                const relatedChar = await getCharacterById(relatedId);
                if (relatedChar) {
                  return {
                    ...relatedChar,
                    relationship: relationship.type === 'custom' ? relationship.customType : relationship.type,
                    description: relationship.description
                  };
                }
                return null;
              });

              const resolvedRelated = await Promise.all(relatedPromises);
              setRelatedCharacters(resolvedRelated.filter(Boolean));
            }
          }
        } catch (error) {
          console.error('Error fetching character:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchCharacter();
    }
  }, [id, getVersions]);

  const handleEdit = () => {
    router.push(`/edit/${id}`);
  };

  const handleDelete = async () => {
    try {
      await deleteCharacter(id);
      router.push('/');
    } catch (error) {
      console.error('Error deleting character:', error);
    }
  };

  const handleRestoreVersion = async (version) => {
    try {
      await updateCharacter(id, version.data);
      router.reload();
    } catch (error) {
      console.error('Error restoring version:', error);
    }
  };

  const getFormattedPreview = (format) => {
    if (!character) return '';
    
    // Get relationships data
    const relationshipsJson = localStorage.getItem('characterRelationships');
    const relationships = relationshipsJson ? JSON.parse(relationshipsJson) : {};
    const characterRelationships = relationships[character.id] || {};
    
    // Format relationships
    const formattedRelationships = Object.entries(characterRelationships)
      .map(([relatedId, relationship]) => {
        const relatedChar = getCharacterById(relatedId);
        if (!relatedChar) return null;
        const relationType = relationship.type === 'custom' ? relationship.customType : relationship.type;
        return `${relatedChar.name} - ${relationType}`;
      })
      .filter(Boolean)
      .join('\n');
    
    if (format === 'text') {
      return `Name: ${character.name}
Gender: ${character.gender}
Age: ${character.age}
Height: ${character.height}
Language: ${character.language}
Status: ${character.status}
Occupation: ${character.occupation}
Personality: ${character.personality}
Skills: ${character.skills}
Appearance: ${character.appearance}
Figure: ${character.figure}
Attributes: ${character.attributes}
Species: ${character.species}
Habits: ${character.habits}
Likes: ${character.likes}
Dislikes: ${character.dislikes}
Background: ${character.background}
Relationships:
${formattedRelationships}`;
    } else {
      return `{Character("${character.name}")
Gender("${character.gender}")
Age("${character.age}")
Heights("${character.height} cm")
Language("${character.language}")
Status("${character.status}") 
Occupation("${character.occupation}") 
Personality("${character.personality}")
Skill("${character.skills}") 
Appearance("${character.appearance}") 
Figure("${character.figure}") 
Attributes("${character.attributes}") 
Speciest("${character.species}") 
Habit("${character.habits}") 
Likes("${character.likes}") 
Dislike("${character.dislikes}")
Backstory/Roleplay("${character.background}")
Relationships("${formattedRelationships}")}`;
    }
  };

  const handleExport = async () => {
    if (!character) return;
    
    // Only show tutorial for character.ai format
    if (selectedFormat === 'character.ai') {
      setShowTutorial(true);
      setPendingAction('export');
      setShowExportModal(false);
    } else {
      await downloadCharacterBundle(character, selectedFormat);
      setShowExportModal(false);
    }
  };

  const handleTutorialContinue = () => {
    setShowTutorial(false);
    if (pendingAction === 'export') {
      downloadCharacterBundle(character, selectedFormat);
    }
    setPendingAction(null);
  };

  const handleExportClick = () => {
    setShowExportModal(true);
  };

  const handleShare = async () => {
    try {
      const response = await fetch('/api/share-character', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ characterId: id }),
      });

      if (!response.ok) {
        throw new Error('Failed to share character');
      }

      const data = await response.json();
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/guest/${data.sharedCharacterId}`;
      setShareLink(shareUrl);
      setShowShareModal(true);
    } catch (error) {
      console.error('Error sharing character:', error);
      setShareError('Failed to share character. Please try again.');
      setShowShareModal(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
  };

  // Animation variants
  const pageTransition = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0 }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95 
    }
  };

  // Create a detail section component for consistency
  const DetailSection = ({ title, content, icon }) => {
    if (!content) return null;
    
    return (
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
        </div>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line pl-7">{content}</p>
      </motion.div>
    );
  };

  // Create an info chip component for basic details
  const InfoChip = ({ label, value, icon }) => {
    if (!value) return null;
    
    return (
      <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded-xl">
        {icon}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="font-medium text-gray-800 dark:text-white">{value}</p>
        </div>
      </div>
    );
  };

  // Add the ExportModal component
  const ExportModal = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={() => setShowExportModal(false)}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Export Character</h2>
          <button
            onClick={() => setShowExportModal(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Select Export Format</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedFormat('text')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedFormat === 'text'
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
              }`}
            >
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">General Text Format</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Clean, readable format without brackets
              </p>
            </button>
            <button
              onClick={() => setSelectedFormat('character.ai')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedFormat === 'character.ai'
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
              }`}
            >
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Character.AI Format</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Official format with brackets for Character.AI
              </p>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Preview</h3>
          <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4">
            <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
              {getFormattedPreview(selectedFormat)}
            </pre>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => setShowExportModal(false)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white 
            rounded-xl border border-gray-300 dark:border-gray-600 cursor-pointer 
            transition-all duration-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </motion.button>
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleExport}
            className="px-4 py-2 bg-primary text-white rounded-xl border border-primary/20 
            cursor-pointer transition-all duration-300 hover:bg-primary/90 
            flex items-center gap-2"
          >
            <FiDownload />
            Export
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );

  // Add ReferencesSection component
  const ReferencesSection = () => {
    if (!relatedCharacters.length) return null;

    const getRelationshipIcon = (type) => {
      const Icon = RELATIONSHIP_ICONS[type] || FiEdit;
      return <Icon className="w-5 h-5" />;
    };

    return (
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FiUsers className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">References</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatedCharacters.map((relatedChar) => (
            <motion.div
              key={relatedChar.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden cursor-pointer"
              onClick={() => router.push(`/character/${relatedChar.id}`)}
            >
              <div className="aspect-square relative bg-gray-200 dark:bg-gray-700">
                {relatedChar.imageUrl ? (
                  <img
                    src={relatedChar.imageUrl}
                    alt={relatedChar.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiUser className="w-20 h-20 text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <div className="flex items-center gap-2 text-white">
                    {getRelationshipIcon(relatedChar.relationship)}
                    <span className="font-medium">{relatedChar.relationship}</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{relatedChar.name}</h4>
                {relatedChar.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {relatedChar.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-200 dark:bg-gray-900 transition-colors duration-200 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-primary border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-gray-200 dark:bg-gray-900 transition-colors duration-200 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Character Not Found</h1>
        <p className="mb-6 text-gray-700 dark:text-gray-300">The character you're looking for doesn't exist or has been deleted.</p>
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 dark:bg-gray-700 text-white rounded-xl 
          border border-white/20 cursor-pointer transition-all duration-300 
          hover:shadow-lg hover:shadow-white/20 dark:hover:shadow-white/10"
        >
          <FiArrowLeft />
          Back to Dashboard
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-900 transition-colors duration-200">
      <motion.div 
        className="max-w-4xl mx-auto p-6 py-12"
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between mb-8"
        >
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white 
            rounded-xl border border-white/20 cursor-pointer transition-all duration-300 
            hover:shadow-lg hover:shadow-white/20 dark:hover:shadow-white/10"
          >
            <FiArrowLeft className="text-lg" />
            <span>Back to Dashboard</span>
          </motion.button>
          
          <div className="flex gap-2">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={handleExportClick}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white 
              rounded-xl border border-white/20 cursor-pointer transition-all duration-300 
              hover:shadow-lg hover:shadow-white/20 dark:hover:shadow-white/10"
            >
              <FiDownload />
              Export
            </motion.button>

            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => setShowVersionHistory(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white 
              rounded-xl border border-white/20 cursor-pointer transition-all duration-300 
              hover:shadow-lg hover:shadow-white/20 dark:hover:shadow-white/10"
            >
              <FiClock />
              History
            </motion.button>

            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white 
              rounded-xl border border-white/20 cursor-pointer transition-all duration-300 
              hover:shadow-lg hover:shadow-white/20 dark:hover:shadow-white/10"
            >
              <FiEdit2 />
              Edit
            </motion.button>
            
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white 
              rounded-xl border border-white/20 cursor-pointer transition-all duration-300 
              hover:shadow-lg hover:shadow-white/20 dark:hover:shadow-white/10 
              hover:bg-status-error hover:border-status-error"
            >
              <FiTrash2 />
              Delete
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Image and Basic Info */}
          <motion.div variants={itemVariants} className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-character border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="aspect-[1/1] relative bg-gray-200 dark:bg-gray-700">
                {character.imageUrl ? (
                  <img 
                    src={character.imageUrl} 
                    alt={character.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiUser className="w-24 h-24 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{character.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{character.description}</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <InfoChip 
                    label="Age" 
                    value={character.age} 
                    icon={<FiInfo className="text-primary" />} 
                  />
                  <InfoChip 
                    label="Gender" 
                    value={character.gender} 
                    icon={<FiUser className="text-primary" />} 
                  />
                  <InfoChip 
                    label="Height" 
                    value={character.height} 
                    icon={<MdHeight className="text-primary" />} 
                  />
                  <InfoChip 
                    label="Language" 
                    value={character.language} 
                    icon={<MdLanguage className="text-primary" />} 
                  />
                  <InfoChip 
                    label="Occupation" 
                    value={character.occupation} 
                    icon={<MdWork className="text-primary" />} 
                  />
                  <InfoChip 
                    label="Status" 
                    value={character.status} 
                    icon={<FiInfo className="text-primary" />} 
                  />
                  <InfoChip 
                    label="Species" 
                    value={character.species} 
                    icon={<FiInfo className="text-primary" />} 
                  />
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Right Column - Character Details */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-character border border-gray-100 dark:border-gray-700 p-6">
              <motion.div variants={itemVariants} className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <MdAutoAwesome className="text-primary" />
                  Character Details
                </h2>
                
                <DetailSection 
                  title="Personality" 
                  content={character.personality}
                  icon={<FiUser className="text-primary" />}
                />
                
                <DetailSection 
                  title="Appearance" 
                  content={character.appearance}
                  icon={<FiUser className="text-primary" />}
                />

                {character.figure && (
                  <div className="mb-5">
                    <h3 className="font-medium text-gray-800 dark:text-white mb-1">Physical Attributes</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      {character.figure && (
                        <div className="bg-gray-200 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Figure/Build</span>
                          <p className="text-gray-800 dark:text-white">{character.figure}</p>
                        </div>
                      )}
                      {character.attributes && (
                        <div className="bg-gray-200 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Notable Attributes</span>
                          <p className="text-gray-800 dark:text-white">{character.attributes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <DetailSection 
                  title="Skills & Abilities" 
                  content={character.skills}
                  icon={<FiBookOpen className="text-primary" />}
                />

                {(character.likes || character.dislikes) && (
                  <div className="mb-5">
                    <h3 className="font-medium text-gray-800 dark:text-white mb-1">Preferences</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      {character.likes && (
                        <div className="bg-gray-200 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <FiHeart className="text-success" /> Likes
                          </span>
                          <p className="text-gray-800 dark:text-white">{character.likes}</p>
                        </div>
                      )}
                      {character.dislikes && (
                        <div className="bg-gray-200 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <FiThumbsDown className="text-status-error" /> Dislikes
                          </span>
                          <p className="text-gray-800 dark:text-white">{character.dislikes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <DetailSection 
                  title="Habits" 
                  content={character.habits}
                  icon={<FiInfo className="text-primary" />}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <FiBookOpen className="text-primary" />
                  Background & Story
                </h2>
                
                <DetailSection 
                  title="Background Story" 
                  content={character.background}
                  icon={<FiBookOpen className="text-primary" />}
                />
                
                <DetailSection 
                  title="Interests & Hobbies" 
                  content={character.interests}
                  icon={<FiHeart className="text-primary" />}
                />
              </motion.div>
              
              <motion.div variants={itemVariants} className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <FiMessageSquare className="text-primary" />
                  AI Settings
                </h2>
                
                <div className="p-5 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/10">
                  <DetailSection 
                    title="Scenario" 
                    content={character.scenario}
                    icon={<FiMessageSquare className="text-primary" />}
                  />
                  
                  <DetailSection 
                    title="First Message / Greeting" 
                    content={character.greeting}
                    icon={<FiMessageSquare className="text-primary" />}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
        
        {/* Delete confirmation overlay */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowDeleteConfirm(false)}
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
                  Are you sure you want to delete <span className="font-semibold">{character.name}</span>? This action cannot be undone.
                </p>
                
                <div className="flex justify-end gap-3">
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white 
                    rounded-xl border border-white/20 cursor-pointer transition-all duration-300 
                    hover:shadow-lg hover:shadow-white/20 dark:hover:shadow-white/10"
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleDelete}
                    className="px-4 py-2 bg-status-error text-white rounded-xl border border-white/20 
                    cursor-pointer transition-all duration-300 hover:shadow-lg 
                    hover:shadow-white/20 dark:hover:shadow-white/10"
                  >
                    <FiTrash2 className="inline-block mr-2" />
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add the ExportModal */}
        <AnimatePresence>
          {showExportModal && <ExportModal />}
        </AnimatePresence>

        <AnimatePresence>
          {showTutorial && (
            <CharacterAITutorial
              onClose={() => {
                setShowTutorial(false);
                setPendingAction(null);
              }}
              onContinue={handleTutorialContinue}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showVersionHistory && (
            <VersionHistoryModal
              isOpen={showVersionHistory}
              onClose={() => setShowVersionHistory(false)}
              versions={versions}
              onRestoreVersion={handleRestoreVersion}
            />
          )}
        </AnimatePresence>

        {/* Add ReferencesSection before the last section */}
        <ReferencesSection />

        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">Share Character</h2>
              {shareError ? (
                <p className="text-red-600 mb-4">{shareError}</p>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    Share this link with others to let them view and adopt your character:
                  </p>
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 p-2 border rounded-lg"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Copy
                    </button>
                  </div>
                </>
              )}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
      <footer className="footer">
          <p>Made with <span className="heart"><FiHeart /></span> for character creators</p>
        </footer>
    </div>
  );
}