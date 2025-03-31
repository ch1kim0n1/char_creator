import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
// Remove the ForceGraph2D import

// Add dynamic import with ssr disabled
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
});
import { 
  FiArrowLeft, 
  FiDownload, 
  FiPlus, 
  FiTrash2, 
  FiHeart, 
  FiUsers, 
  FiShield, 
  FiTarget, 
  FiStar, 
  FiAward,
  FiUserPlus,
  FiUserMinus,
  FiUserX,
  FiUserCheck,
  FiUser,
  FiEdit
} from 'react-icons/fi';
import { getAllCharacters } from '../utils/characterStorage';
import html2canvas from 'html2canvas';

// Predefined relationship types with icons
const RELATIONSHIP_TYPES = [
  { id: 'friend', label: 'Friend', icon: FiUsers },
  { id: 'family', label: 'Family', icon: FiHeart },
  { id: 'enemy', label: 'Enemy', icon: FiTarget },
  { id: 'mentor', label: 'Mentor', icon: FiStar },
  { id: 'student', label: 'Student', icon: FiAward },
  { id: 'ally', label: 'Ally', icon: FiShield },
  { id: 'lover', label: 'Lover', icon: FiHeart },
  { id: 'pet', label: 'Pet', icon: FiUser },
  { id: 'acquaintance', label: 'Acquaintance', icon: FiUserPlus },
  { id: 'teammate', label: 'Teammate', icon: FiUsers },
  { id: 'custom', label: 'Custom', icon: FiEdit }
];

export default function Relationships() {
  const [characters, setCharacters] = useState([]);
  const [relationships, setRelationships] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCharacter1, setSelectedCharacter1] = useState(null);
  const [selectedCharacter2, setSelectedCharacter2] = useState(null);
  const [relationshipType, setRelationshipType] = useState('');
  const [relationshipDescription, setRelationshipDescription] = useState('');
  const [customType, setCustomType] = useState('');
  const [mapRef] = useState(useRef(null));
  const [nodesRef] = useState(useRef([]));
  const [edgesRef] = useState(useRef([]));
  const [selectedRelationship, setSelectedRelationship] = useState(null);
  const [selectedCharacterForDeletion, setSelectedCharacterForDeletion] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [graphRef, setGraphRef] = useState(null);  // Add this near other state declarations

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const charactersData = await getAllCharacters();
        setCharacters(charactersData);
        // Load existing relationships from localStorage
        const savedRelationships = localStorage.getItem('characterRelationships');
        if (savedRelationships) {
          setRelationships(JSON.parse(savedRelationships));
        }
      } catch (error) {
        console.error('Error loading characters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacters();
  }, []);

  useEffect(() => {
    if (characters.length > 0 && relationships) {
      // Create nodes with proper IDs
      const nodes = characters.map(char => ({
        id: char.id,
        name: char.name,
        imageUrl: char.imageUrl || '/default-avatar.png'
      }));

      // Create links using node references
      const links = [];
      Object.entries(relationships).forEach(([charId1, charRelationships]) => {
        Object.entries(charRelationships).forEach(([charId2, relationship]) => {
          const sourceNode = nodes.find(node => node.id === charId1);
          const targetNode = nodes.find(node => node.id === charId2);
          
          if (sourceNode && targetNode) {
            links.push({
              source: sourceNode,
              target: targetNode,
              type: relationship.type,
              description: relationship.description
            });
          }
        });
      });

      setGraphData({ nodes, links });

      // Center the graph after data is set with proper checks
      if (graphRef && nodes.length > 0) {
        // Wait for the graph to be properly initialized
        setTimeout(() => {
          try {
            if (graphRef.graph && typeof graphRef.centerAt === 'function') {
              const { x, y, width, height } = graphRef.graph.getBoundingClientRect();
              graphRef.centerAt(x + width / 2, y + height / 2);
              graphRef.zoom(1.5);
            }
          } catch (error) {
            console.error('Error centering graph:', error);
          }
        }, 1000); // Add a delay to ensure the graph is rendered
      }
    }
  }, [characters, relationships, graphRef]);

  const handleAddRelationship = () => {
    if (!selectedCharacter1 || !selectedCharacter2 || !relationshipType) return;

    // Create a copy of the current relationships
    const newRelationships = { ...relationships };

    // Initialize empty objects for both characters if they don't exist
    if (!newRelationships[selectedCharacter1]) {
      newRelationships[selectedCharacter1] = {};
    }
    if (!newRelationships[selectedCharacter2]) {
      newRelationships[selectedCharacter2] = {};
    }

    // Delete any existing relationships between these characters
    delete newRelationships[selectedCharacter1][selectedCharacter2];
    delete newRelationships[selectedCharacter2][selectedCharacter1];

    // Add the new relationship
    newRelationships[selectedCharacter1][selectedCharacter2] = {
      type: relationshipType,
      description: relationshipDescription,
      customType: relationshipType === 'custom' ? customType : undefined
    };
    newRelationships[selectedCharacter2][selectedCharacter1] = {
      type: relationshipType,
      description: relationshipDescription,
      customType: relationshipType === 'custom' ? customType : undefined
    };

    setRelationships(newRelationships);
    localStorage.setItem('characterRelationships', JSON.stringify(newRelationships));
    setRelationshipType('');
    setRelationshipDescription('');
    setCustomType('');
  };

  const handleDeleteRelationship = (char1, char2) => {
    const newRelationships = { ...relationships };
    if (newRelationships[char1]) {
      delete newRelationships[char1][char2];
      if (Object.keys(newRelationships[char1]).length === 0) {
        delete newRelationships[char1];
      }
    }
    if (newRelationships[char2]) {
      delete newRelationships[char2][char1];
      if (Object.keys(newRelationships[char2]).length === 0) {
        delete newRelationships[char2];
      }
    }
    setRelationships(newRelationships);
    localStorage.setItem('characterRelationships', JSON.stringify(newRelationships));
  };

  const downloadMap = async () => {
    try {
      // Get the canvas element from the ForceGraph
      const canvas = document.querySelector('.force-graph-container canvas');
      if (!canvas) {
        console.error('Canvas element not found');
        return;
      }
  
      // Create a temporary canvas with white background
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const ctx = tempCanvas.getContext('2d');
      
      // Fill background
      ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#1F2937' : '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the graph canvas on top
      ctx.drawImage(canvas, 0, 0);
  
      // Convert to image and trigger download
      const dataUrl = tempCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'character-relationships.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error downloading map:', error);
    }
  };

  const clearAllRelationships = () => {
    setRelationships({});
    localStorage.removeItem('characterRelationships');
    setGraphData({ nodes: [], links: [] });
  };

  const clearCharacterRelationships = (characterId) => {
    const newRelationships = { ...relationships };
    // Remove relationships where this character is involved
    delete newRelationships[characterId];
    // Remove references to this character in other relationships
    Object.keys(newRelationships).forEach(charId => {
      if (newRelationships[charId][characterId]) {
        delete newRelationships[charId][characterId];
      }
    });
    setRelationships(newRelationships);
    localStorage.setItem('characterRelationships', JSON.stringify(newRelationships));
    setGraphData({ nodes: [], links: [] });
  };

  const deleteSelectedRelationship = () => {
    if (!selectedCharacterForDeletion || !selectedRelationship) return;
    
    const newRelationships = { ...relationships };
    if (newRelationships[selectedCharacterForDeletion]?.[selectedRelationship]) {
      delete newRelationships[selectedCharacterForDeletion][selectedRelationship];
      delete newRelationships[selectedRelationship][selectedCharacterForDeletion];
    }
    setRelationships(newRelationships);
    localStorage.setItem('characterRelationships', JSON.stringify(newRelationships));
    setSelectedCharacterForDeletion(null);
    setSelectedRelationship(null);
    setGraphData({ nodes: [], links: [] });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Head>
        <title>Character Relationships - char_creator</title>
        <meta name="description" content="Map relationships between your characters" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <Link href="/">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <FiArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
          </Link>
          <h1 className="text-2xl font-bold ml-4 text-gray-800 dark:text-white">Character Relationships</h1>
        </div>

        <div className="flex flex-wrap gap-8 mb-8">
          {/* Management Controls */}
          <div className="w-full flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <button
              onClick={clearAllRelationships}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              <FiTrash2 className="inline mr-2" />
              Clear All Relationships
            </button>
            
            <div className="flex gap-4">
              <select
                value={selectedCharacterForDeletion || ''}
                onChange={(e) => setSelectedCharacterForDeletion(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Character</option>
                {characters.map(char => (
                  <option key={char.id} value={char.id}>{char.name}</option>
                ))}
              </select>
              
              {selectedCharacterForDeletion && (
                <>
                  <button
                    onClick={() => clearCharacterRelationships(selectedCharacterForDeletion)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    <FiUserX className="inline mr-2" />
                    Clear Character Relationships
                  </button>
                  
                  <select
                    value={selectedRelationship || ''}
                    onChange={(e) => setSelectedRelationship(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Relationship</option>
                    {Object.keys(relationships[selectedCharacterForDeletion] || {}).map(relId => (
                      <option key={relId} value={relId}>
                        {characters.find(c => c.id === relId)?.name || 'Unknown'}
                      </option>
                    ))}
                  </select>
                  
                  {selectedRelationship && (
                    <button
                      onClick={deleteSelectedRelationship}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    >
                      <FiTrash2 className="inline mr-2" />
                      Delete Selected Relationship
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="flex w-full gap-8">
            {/* Character Selection */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">1. Select Characters</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Character
                  </label>
                  <div className="space-y-2">
                    {characters.map((char) => (
                      <button
                        key={char.id}
                        onClick={() => setSelectedCharacter1(char.id)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                          selectedCharacter1 === char.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <img 
                          src={char.imageUrl || '/default-avatar.png'} 
                          alt={char.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        {char.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Second Character
                  </label>
                  <div className="space-y-2">
                    {characters
                      .filter(char => char.id !== selectedCharacter1)
                      .map((char) => (
                        <button
                          key={char.id}
                          onClick={() => setSelectedCharacter2(char.id)}
                          className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                            selectedCharacter2 === char.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          <img 
                            src={char.imageUrl || '/default-avatar.png'} 
                            alt={char.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          {char.name}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-16 h-16 text-gray-400 dark:text-gray-500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>

            {/* Relationship Form */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">2. Add Relationship</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Relationship Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {RELATIONSHIP_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => setRelationshipType(type.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            relationshipType === type.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                  {relationshipType === 'custom' && (
                    <input
                      type="text"
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter custom relationship type"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={relationshipDescription}
                    onChange={(e) => setRelationshipDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="3"
                    placeholder="Describe the relationship..."
                  />
                </div>
                <button
                  onClick={handleAddRelationship}
                  disabled={!selectedCharacter1 || !selectedCharacter2 || !relationshipType || (relationshipType === 'custom' && !customType)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Relationship
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Relationship Map - Full Width */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Relationship Map</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400 opacity-75">
                Tip: Use left click and scroll wheel to find your characters!
              </span>
            </div>
            <button
              onClick={downloadMap}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FiDownload className="w-5 h-5" />
              Download Map
            </button>
          </div>
          <div ref={mapRef} className="relative w-full h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <ForceGraph2D
              ref={setGraphRef}
              graphData={graphData}
              nodeLabel={node => `${node.name}`}
              nodeRelSize={10} 
              d3Force={(d3Force) => {
                // Increase link distance (space between connected nodes)
                d3Force('link').distance(300);
                // Increase repulsive force (makes unconnected nodes stay further apart)
                d3Force('charge').strength(-2000);
                // Add collision force to prevent node overlap
                d3Force('collision').radius(10150);
              }}
              nodeCanvasObject={(node, ctx, globalScale) => {
                // Load and draw character avatar
                const size =10;
                const img = new Image(size, size);
                img.src = node.imageUrl;
                
                // Draw circular clipping path
                ctx.save();
                ctx.beginPath();
                ctx.arc(node.x, node.y, size/2, 0, 2 * Math.PI, false);
                ctx.clip();
                
                // Draw the image
                ctx.drawImage(img, node.x - size/2, node.y - size/2, size, size);
                ctx.restore();

                // Draw node label below avatar with larger font
                const fontSize = 20/globalScale; // Doubled from 12 to 24
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(node.name, node.x, node.y + size/2 + fontSize/2);
              }}
              linkLabel={link => {
                const relType = relationships[link.source.id]?.[link.target.id]?.type;
                const customType = relationships[link.source.id]?.[link.target.id]?.customType;
                const type = relType === 'custom' ? customType : RELATIONSHIP_TYPES.find(t => t.id === relType)?.label;
                return `${type || 'Unknown'}`;
              }}
              linkCanvasObject={(link, ctx, scale) => {
                // Draw link line
                ctx.beginPath();
                ctx.strokeStyle = '#3B82F6';
                ctx.lineWidth = 2;
                ctx.moveTo(link.source.x, link.source.y);
                ctx.lineTo(link.target.x, link.target.y);
                ctx.stroke();

                // Draw relationship type label
                if (scale > 0.7) {
                  const relType = relationships[link.source.id]?.[link.target.id]?.type;
                  const customType = relationships[link.source.id]?.[link.target.id]?.customType;
                  const type = relType === 'custom' ? customType : RELATIONSHIP_TYPES.find(t => t.id === relType)?.label;
                  
                  if (type) {
                    const fontSize = 20/scale; // Doubled from 10 to 20
                    ctx.font = `${fontSize}px Sans-Serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#ffffff'; // Make text always white
                    
                    // Position text in middle of link
                    const midX = (link.source.x + link.target.x) / 2;
                    const midY = (link.source.y + link.target.y) / 2;
                    
                    // Add background for better readability
                    const padding = 3; // Increased padding for larger text
                    const textWidth = ctx.measureText(type).width;
                    ctx.fillStyle = '#1F2937'; // Dark background for text
                    ctx.fillRect(
                      midX - textWidth/2 - padding,
                      midY - fontSize/2 - padding,
                      textWidth + padding*2,
                      fontSize + padding*2
                    );
                    
                    // Draw text in white
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(type, midX, midY);
                  }
                }
              }}
              linkDirectionalParticles={2}
              linkDirectionalParticleSpeed={0.005}
              linkDirectionalParticleWidth={2}
              backgroundColor="#1F2937"
              onNodeClick={(node) => {
                // Show node details if needed
                console.log('Node clicked:', node);
              }}
              onLinkClick={(link) => {
                // Show relationship details if needed
                console.log('Link clicked:', link);
              }}
              cooldownTime={3000}
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.3}
              warmupTicks={100}
              onEngineStop={() => {
                // Graph has finished initial simulation
                console.log('Graph layout stabilized');
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}