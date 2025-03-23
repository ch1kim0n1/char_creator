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
  FiBookOpen
} from 'react-icons/fi';
import { MdHeight, MdLanguage, MdWork, MdAutoAwesome } from 'react-icons/md';

const CharacterForm = ({ initialData = {}, onSubmit, isEdit = false }) => {
  const router = useRouter();
  const fileInputRef = useRef();
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData, imageFile);
      setShowSuccessMessage(true);
      
      // Redirect after showing success message
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      console.error('Error submitting form:', error);
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

  const buttonVariants = {
    hover: {
      scale: 1.03,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.97,
    }
  };

  // Create a custom FormField component for consistency
  const FormField = ({ label, name, type = 'text', placeholder, description, required = false, as = 'input', options = [] }) => {
    const InputComponent = as;
    const id = `field-${name}`;
    
    return (
      <div className="mb-5 relative">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label} {required && <span className="text-status-error">*</span>}
          </label>
          {description && (
            <div className="group relative">
              <FiInfo className="text-gray-400 hover:text-primary cursor-help" />
              <div className="absolute right-0 -top-1 transform translate-y-full w-64 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg text-xs invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity z-10 border border-gray-200 dark:border-gray-700">
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
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-xl form-input bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
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
            onChange={handleChange}
            placeholder={placeholder}
            rows={4}
            className={`w-full px-4 py-2.5 border rounded-xl form-input bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
              errors[name] ? 'border-status-error' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
        ) : (
          <input
            type={type}
            id={id}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder={placeholder}
            className={`w-full px-4 py-2.5 border rounded-xl form-input bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
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

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-character overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Character' : 'Create New Character'}
          </h1>
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => router.push('/')}
            className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <FiArrowLeft className="text-lg" /> 
            <span className="hidden sm:inline">Back</span>
          </motion.button>
        </div>
        
        {/* Step indicator */}
        <div className="mb-8 px-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center relative">
                <motion.div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors 
                    ${currentStep === step 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : currentStep > step 
                        ? 'bg-success text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  whileHover={step < currentStep ? { scale: 1.1 } : {}}
                  whileTap={step < currentStep ? { scale: 0.95 } : {}}
                  onClick={step < currentStep ? () => setCurrentStep(step) : undefined}
                  style={{ cursor: step < currentStep ? 'pointer' : 'default' }}
                >
                  {currentStep > step ? <FiCheck className="w-5 h-5" /> : step}
                </motion.div>
                <span className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                  {step === 1 ? 'Basic Info' : step === 2 ? 'Attributes' : 'Background'}
                </span>
                {step < 3 && (
                  <div className="absolute top-5 left-10 w-full h-0.5 -z-10 bg-gray-200 dark:bg-gray-700">
                    <motion.div 
                      className="h-full bg-success" 
                      initial={{ width: "0%" }}
                      animate={{ 
                        width: currentStep > step ? "100%" : "0%",
                        transition: { duration: 0.5 }
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
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
                className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
                  className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
                >
                  Next
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors shadow-md shadow-primary/20 disabled:bg-primary/70 disabled:cursor-not-allowed"
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
        </form>
        
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
    </div>
  );
};

export default CharacterForm; 