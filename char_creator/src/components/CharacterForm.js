import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { 
  FiUpload, 
  FiUser, 
  FiSave, 
  FiArrowLeft, 
  FiCheck, 
  FiInfo, 
  FiHeart, 
  FiThumbsDown, 
  FiBookOpen,
  FiUserPlus,
  FiStar,
  FiBook
} from 'react-icons/fi';
import { MdHeight, MdLanguage, MdWork, MdAutoAwesome } from 'react-icons/md';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import ErrorPopup from './ErrorPopup';
import useCharacters from '../hooks/useCharacters';

const CharacterForm = ({ initialData = {}, onSubmit, isEdit = false }) => {
  const router = useRouter();
  const fileInputRef = useRef();
  const { 
    createCharacter, 
    updateCharacter, 
    getCharacter, 
    error,
    setError 
  } = useCharacters();
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    gender: initialData.gender || '',
    age: initialData.age || '',
    description: initialData.description || '',
    personality: initialData.personality || '',
    scenario: initialData.scenario || '',
    greeting: initialData.greeting || '',
    interests: initialData.interests || '',
    background: initialData.background || '',
    height: initialData.height || '',
    language: initialData.language || '',
    status: initialData.status || '',
    occupation: initialData.occupation || '',
    skills: initialData.skills || '',
    appearance: initialData.appearance || '',
    figure: initialData.figure || '',
    attributes: initialData.attributes || '',
    species: initialData.species || '',
    habits: initialData.habits || '',
    likes: initialData.likes || '',
    dislikes: initialData.dislikes || '',
  });
  
  const [imagePreview, setImagePreview] = useState(initialData.imageUrl || null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const imageRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cropOperation, setCropOperation] = useState(null);
  const [isUserSubmitted, setIsUserSubmitted] = useState(false);

  // Field descriptors to show tooltips
  const fieldDescriptions = {
    personality: "Describe your character's personality traits and behaviors.",
    scenario: "The setting or context for conversations with this character.",
    greeting: "How your character introduces themselves or greets someone for the first time.",
    background: "The backstory and history of your character.",
    species: "The species, race, or type of being your character is.",
    height: "Your character's height (preferably in cm).",
    figure: "Physical build, body type, or notable physical characteristics.",
    attributes: "Special abilities, powers, or defining traits.",
    habits: "Regular behaviors, routines, or quirks of your character.",
    likes: "Things your character enjoys, favorites, or preferences.",
    dislikes: "Things your character dislikes, avoids, or hates."
  };

  const handleChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    
    const reader = new FileReader();
    reader.onload = () => {
      setOriginalImage(reader.result);
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const minSize = Math.min(img.width, img.height);
        const size = minSize * 0.8;
        const newCrop = {
          unit: 'px',
          x: (img.width - size) / 2,
          y: (img.height - size) / 2,
          width: size,
          height: size
        };
        setCrop(newCrop);
        setCompletedCrop(newCrop);
        setShowCropModal(true);
      };
    };
    reader.readAsDataURL(file);
  };

  const getCroppedImg = (image, crop) => {
    // Add validation
    if (!image || !crop || !crop.width || !crop.height) {
      return Promise.reject('Invalid crop parameters');
    }

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      500,
      500
    );

    return new Promise((resolve) => {
      canvas.toBlob(blob => {
        if (blob) {
          blob.name = 'cropped-image.jpg';
          resolve(blob);
        }
      }, 'image/jpeg', 1);
    });
  };

  const handleCropComplete = async (crop) => {
    // Add null check and dimension validation
    if (!imageRef.current || !crop || !crop.width || !crop.height) {
      console.warn('Invalid crop parameters');
      return;
    }

    try {
      const croppedImageBlob = await getCroppedImg(imageRef.current, crop);
      if (croppedImageBlob) {
        const croppedImageUrl = URL.createObjectURL(croppedImageBlob);
        setImagePreview(croppedImageUrl);
        setImageFile(new File([croppedImageBlob], 'cropped-image.jpg', { type: 'image/jpeg' }));
        setShowCropModal(false);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      window.scrollTo(0, 0);
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    window.scrollTo(0, 0);
    setCurrentStep(prev => prev - 1);
  };

  const handleCropDragStart = () => {
    setCropOperation('dragging');
  };

  const handleCropDragEnd = () => {
    setCropOperation(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      const characterData = {
        name: formData.name,
        gender: formData.gender,
        age: formData.age,
        description: formData.description,
        personality: formData.personality,
        scenario: formData.scenario,
        greeting: formData.greeting,
        interests: formData.interests,
        background: formData.background,
        height: formData.height,
        language: formData.language,
        status: formData.status,
        occupation: formData.occupation,
        skills: formData.skills,
        appearance: formData.appearance,
        figure: formData.figure,
        attributes: formData.attributes,
        species: formData.species,
        habits: formData.habits,
        likes: formData.likes,
        dislikes: formData.dislikes,
        imageUrl: imagePreview // Include the image URL if it exists
      };

      if (isEdit) {
        await updateCharacter(initialData.id, characterData, imageFile);
      } else {
        await createCharacter(characterData, imageFile);
      }

      setShowSuccessMessage(true);
      
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      // Error is already handled by useCharacters hook
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Smooth animation variants
  const pageTransition = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { 
        duration: 0.3
      }
    }
  };

  // Update button variants for consistent animations
  const buttonVariants = {
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  // Add these new animation variants after the existing ones
  const stepIndicatorVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    hover: { 
      scale: 1.1,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { 
      scale: 0.95,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const stepLineVariants = {
    initial: { scaleX: 0 },
    animate: { 
      scaleX: 1,
      transition: { 
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  const stepLabelVariants = {
    initial: { y: 10, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.3,
        delay: 0.2
      }
    }
  };

  // Create a custom FormField component for consistency
  const FormField = ({ label, name, type = 'text', placeholder, description, required = false, as = 'input', options = [] }) => {
    const InputComponent = as;
    const id = `field-${name}`;
    
    const handleInputChange = (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleChange(e);
    };
    
    return (
      <div className="mb-5 relative">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label} {required && <span className="text-status-error">*</span>}
          </label>
          {description && (
            <div className="group relative">
              <FiInfo className="text-gray-400 hover:text-primary cursor-help" />
              <div className="absolute right-0 -top-1 transform translate-y-full w-64 bg-gray-900 dark:bg-gray-800 p-2 rounded-lg shadow-lg text-xs text-white invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity z-10 border border-gray-700">
                {description}
              </div>
            </div>
          )}
        </div>

        {as === 'select' ? (
          <select
            id={id}
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
              errors[name] ? 'border-status-error' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <option value="">{placeholder || 'Select an option'}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : as === 'textarea' ? (
          <textarea
            id={id}
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            placeholder={placeholder}
            rows={4}
            className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
              errors[name] ? 'border-status-error' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
        ) : (
          <input
            type={type}
            id={id}
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
              errors[name] ? 'border-status-error' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
        )}
        
        {errors[name] && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-status-error"
          >
            {errors[name]}
          </motion.p>
        )}
      </div>
    );
  };

  // Render different steps of the form
  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            variants={pageTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="md:col-span-2">
                <FormField
                  label="Character Name"
                  name="name"
                  placeholder="Enter character name"
                  required
                />
              </div>
              
              <FormField
                label="Gender"
                name="gender"
                as="select"
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'non-binary', label: 'Non-binary' },
                  { value: 'other', label: 'Other' }
                ]}
              />
              
              <FormField
                label="Age"
                name="age"
                placeholder="Character age"
              />
              
              <FormField
                label="Height"
                name="height"
                placeholder="Character height (cm)"
                description={fieldDescriptions.height}
              />
              
              <FormField
                label="Language"
                name="language"
                placeholder="Character's language(s)"
              />
              
              <FormField
                label="Species/Race"
                name="species"
                placeholder="Human, Elf, Android, etc."
                description={fieldDescriptions.species}
              />
              
              <FormField
                label="Status"
                name="status"
                placeholder="Alive, Active, Royal, etc."
              />
            </div>
            
            <FormField
              label="Short Description"
              name="description"
              as="textarea"
              placeholder="Brief description of your character"
            />
            
            <div className="mt-8">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Character Image
              </label>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div 
                  className="w-36 h-36 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex items-center justify-center overflow-hidden bg-gray-200 dark:bg-gray-800"
                >
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Character preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiUser className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <motion.button
                    type="button"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={triggerFileInput}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors"
                  >
                    <FiUpload className="text-primary" />
                    <span>{imagePreview ? 'Change Image' : 'Upload Image'}</span>
                  </motion.button>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Recommended size: 500x500 pixels. JPG, PNG or GIF.
                  </p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    A good picture helps bring your character to life!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      
      case 2:
        return (
          <motion.div
            key="step2"
            variants={pageTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">Character Attributes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="md:col-span-2">
                <FormField
                  label="Occupation/Role"
                  name="occupation"
                  placeholder="Character's job or role"
                />
              </div>
              
              <div className="md:col-span-2">
                <FormField
                  label="Personality Traits"
                  name="personality"
                  as="textarea"
                  placeholder="What is your character's personality like?"
                  description={fieldDescriptions.personality}
                />
              </div>
              
              <div className="md:col-span-2">
                <FormField
                  label="Skills & Abilities"
                  name="skills"
                  as="textarea"
                  placeholder="What special skills or abilities does your character have?"
                />
              </div>
              
              <div className="md:col-span-2">
                <FormField
                  label="Physical Appearance"
                  name="appearance"
                  as="textarea"
                  placeholder="Describe your character's appearance"
                />
              </div>
              
              <FormField
                label="Figure/Body Type"
                name="figure"
                placeholder="Character's physical build"
                description={fieldDescriptions.figure}
              />
              
              <FormField
                label="Notable Attributes"
                name="attributes"
                placeholder="Key character attributes"
                description={fieldDescriptions.attributes}
              />
              
              <FormField
                label="Habits"
                name="habits"
                placeholder="Character's usual habits"
                description={fieldDescriptions.habits}
              />

              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Likes"
                    name="likes"
                    placeholder="Things your character enjoys"
                    description={fieldDescriptions.likes}
                  />
                  
                  <FormField
                    label="Dislikes"
                    name="dislikes"
                    placeholder="Things your character dislikes"
                    description={fieldDescriptions.dislikes}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      
      case 3:
        return (
          <motion.div
            key="step3"
            variants={pageTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">Background & AI Settings</h2>
            
            <div className="space-y-6">
              <FormField
                label="Interests & Hobbies"
                name="interests"
                as="textarea"
                placeholder="What does your character enjoy doing?"
              />
              
              <FormField
                label="Background Story"
                name="background"
                as="textarea"
                placeholder="Share your character's backstory"
                description={fieldDescriptions.background}
              />
              
              <FormField
                label="Scenario"
                name="scenario"
                as="textarea"
                placeholder="Setting or context for conversations with this character"
                description={fieldDescriptions.scenario}
              />
              
              <FormField
                label="First Message / Greeting"
                name="greeting"
                as="textarea"
                placeholder="How does your character greet someone for the first time?"
                description={fieldDescriptions.greeting}
              />
              
              <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-2xl mt-8 border border-primary/10">
                <div className="flex gap-3 items-start">
                  <MdAutoAwesome className="text-primary text-xl flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-2">Character Format Information</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      The information you've provided will be used to generate a character file in the standard format.
                      After saving, you can download this file from the dashboard in both Character AI format and text format.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  const CropModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Crop Image</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Drag corners to resize. Keep 1:1 ratio.
          </span>
        </div>
        <div className="max-h-[70vh] overflow-auto bg-gray-100 dark:bg-gray-900 rounded-xl p-4">
          <ReactCrop
            crop={crop}
            onChange={handleCropChange}
            onComplete={setCompletedCrop}
            onDragStart={handleCropDragStart}
            onDragEnd={handleCropDragEnd}
            aspect={1}
            className="flex justify-center"
            ruleOfThirds={true}
            keepSelection={true}
          >
            <img
              ref={imageRef}
              src={originalImage}
              alt="Crop me"
              className="max-w-full max-h-[60vh] object-contain select-none"
              draggable={false}
              style={{ cursor: cropOperation === 'dragging' ? 'grabbing' : 'grab' }}
            />
          </ReactCrop>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => setShowCropModal(false)}
            className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 
                      text-gray-700 dark:text-gray-300 rounded-xl 
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      active:scale-95 transition-all duration-200
                      cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleCropComplete(completedCrop)}
            className="px-5 py-2.5 bg-primary border border-primary/20
                      text-white rounded-xl 
                      hover:bg-primary/90 hover:border-primary/40
                      active:scale-95 transition-all duration-200
                      cursor-pointer shadow-md shadow-primary/20"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );

  // Update the CSS for ReactCrop (add this after your imports)
  const cropStyles = `
    .ReactCrop__crop-selection {
      border: 3px solid white;
      box-shadow: 0 0 0 9999em rgba(0, 0, 0, 0.5);
      touch-action: none;
      pointer-events: auto;
    }

    .ReactCrop {
      position: relative;
      cursor: grab;
      max-height: 100%;
      touch-action: none;
    }

    .ReactCrop:active {
      cursor: grabbing;
    }

    .ReactCrop__drag-handle {
      width: 20px;
      height: 20px;
      background-color: white;
      border: 3px solid #3B82F6;
      border-radius: 50%;
      opacity: 0.8;
      pointer-events: auto;
      touch-action: none;
      transition: background-color 0.2s, transform 0.1s;
    }

    .ReactCrop__drag-handle:hover {
      opacity: 1;
      transform: scale(1.1);
      background-color: #3B82F6;
    }

    .ReactCrop__drag-handle:active {
      opacity: 1;
      transform: scale(1.05);
    }

    .ReactCrop__drag-handle::after {
      content: '';
      width: 8px;
      height: 8px;
      background: #3B82F6;
      border-radius: 50%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .ReactCrop__drag-handle.ord-n,
    .ReactCrop__drag-handle.ord-s {
      cursor: ns-resize !important;
    }

    .ReactCrop__drag-handle.ord-e,
    .ReactCrop__drag-handle.ord-w {
      cursor: ew-resize !important;
    }

    .ReactCrop__drag-handle.ord-nw,
    .ReactCrop__drag-handle.ord-se {
      cursor: nwse-resize !important;
    }

    .ReactCrop__drag-handle.ord-ne,
    .ReactCrop__drag-handle.ord-sw {
      cursor: nesw-resize !important;
    }
  `;

  // Remove previous drag-related effects and handlers since we're using new ones
  // Keep the style injection effect
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = cropStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
      document.body.style.cursor = 'default';
    };
  }, []);

  const handleCropChange = (newCrop, percentCrop) => {
    // Ensure minimum size (100x100 pixels)
    if (newCrop.width >= 100 && newCrop.height >= 100) {
      setCrop(newCrop);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
      {showCropModal && <CropModal />}
      
      {/* New header section */}
      <div className="h-24 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 relative">
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <motion.h1 
            className="text-3xl font-bold text-white drop-shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {isEdit ? 'Edit Character' : 'Create New Character'}
          </motion.h1>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 text-white 
              hover:text-accent dark:hover:text-accent bg-white dark:bg-gray-800 
              rounded-xl border border-gray-200 dark:border-gray-600
              transition-all duration-300 hover:shadow-lg hover:shadow-white/20 
              dark:hover:shadow-white/10 cursor-pointer"
          >
            <FiArrowLeft /> Back to Dashboard
          </motion.button>
        </div>
        
        {/* Enhanced Step indicator with icons */}
        <div className="mb-12 px-4">
          <div className="flex items-center justify-between relative">
            {[
              { number: 1, label: 'Basic Info', icon: FiUserPlus },
              { number: 2, label: 'Attributes', icon: FiStar },
              { number: 3, label: 'Background', icon: FiBook }
            ].map((step) => {
              const Icon = step.icon;
              return (
                <motion.div 
                  key={step.number} 
                  className="flex flex-col items-center relative z-10"
                  variants={stepIndicatorVariants}
                  initial="initial"
                  animate="animate"
                  whileHover={step.number < currentStep ? "hover" : ""}
                  whileTap={step.number < currentStep ? "tap" : ""}
                  onClick={step.number < currentStep ? () => setCurrentStep(step.number) : undefined}
                  style={{ cursor: step.number < currentStep ? 'pointer' : 'default' }}
                >
                  <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
                    ${currentStep === step.number 
                      ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' 
                      : currentStep > step.number 
                        ? 'bg-success text-white shadow-lg shadow-success/30' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="w-8 h-8"
                      >
                        <FiCheck className="w-full h-full" />
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.8, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="w-8 h-8"
                      >
                        <Icon className="w-full h-full" />
                      </motion.div>
                    )}
                    {currentStep === step.number && (
                      <motion.div
                        className="absolute -inset-1 bg-primary/20 rounded-2xl"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                  </div>
                  <motion.div 
                    className="mt-3 text-center"
                    variants={stepLabelVariants}
                  >
                    <motion.span 
                      className="block text-sm font-medium text-gray-600 dark:text-gray-400"
                    >
                      {step.label}
                    </motion.span>
                    <motion.span 
                      className="block text-xs text-gray-500 dark:text-gray-500 mt-1"
                    >
                      Step {step.number}
                    </motion.span>
                  </motion.div>
                  {step.number < 3 && (
                    <>
                      <div className="absolute top-8 left-25 w-[10rem] h-1 -z-10 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        {currentStep > step.number && (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 0.5 }}
                            className="h-full bg-green-500"
                          />
                        )}
                      </div>
                      <div className="absolute top-4 left-58 -z-10">
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ 
                            opacity: currentStep > step.number ? 1 : 0.5,
                            y: 0,
                            color: currentStep > step.number ? "#22c55e" : "#9ca3af"
                          }}
                          className="flex items-center"
                        >
                          <svg 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24" 
                            fill="none"
                          >
                            <path 
                              d="M5 12H19L12 5M12 19" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            />
                          </svg>
                        </motion.div>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
        
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
          
          <div className="mt-10 flex justify-between">
            {currentStep > 1 && (
              <motion.button
                type="button"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={prevStep}
                className="px-5 py-2.5 bg-gray-800/40 text-white border border-white/20 rounded-xl hover:bg-gray-700/60 transition-all cursor-pointer"
              >
                Previous
              </motion.button>
            )}
            
            <div className={currentStep > 1 ? "ml-auto" : ""}>
              {currentStep < 3 ? (
                <motion.button
                  type="button"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={nextStep}
                  className="px-5 py-2.5 bg-gray-800/40 text-white border border-white/20 rounded-xl hover:bg-gray-700/60 transition-all cursor-pointer"
                >
                  Next
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-800/40 text-white border border-white/20 rounded-xl hover:bg-gray-700/60 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800/40"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="text-lg" />
                      Save Character
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </div>
        
        {/* Success notification */}
        <AnimatePresence>
          {showSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-success text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50"
            >
              <FiCheck className="text-lg" />
              Character saved successfully!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && <ErrorPopup message={error} onDismiss={() => setError(null)} />}
    </div>
  );
};

export default CharacterForm;
