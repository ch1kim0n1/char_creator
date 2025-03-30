import { motion } from 'framer-motion';
import { FiX, FiExternalLink, FiCopy, FiUpload, FiLayout } from 'react-icons/fi';

export default function CharacterAITutorial({ onClose, onContinue }) {
  const steps = [
    { icon: <FiExternalLink />, text: "Go to Character.AI website" },
    { icon: <FiLayout />, text: "Click on \"Create\" in the top navigation" },
    { icon: <FiCopy />, text: "Click \"Create a Character\"" },
    { icon: <FiLayout />, text: "In the character creation form, locate the input fields" },
    { icon: <FiCopy />, text: "Copy and paste the exported content into respective fields" },
    { icon: <FiUpload />, text: "For the image, upload the exported PFP file" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full shadow-2xl border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <motion.h2 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent"
          >
            Import Guide
          </motion.h2>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 
              p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <FiX className="w-6 h-6" />
          </motion.button>
        </div>

        <div className="space-y-6 mb-8">
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-700 dark:text-gray-300 text-lg"
          >
            Follow these steps to import your character to Character.AI:
          </motion.p>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid gap-4"
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * (index + 3) }}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 
                  border border-gray-200 dark:border-gray-600 hover:border-accent dark:hover:border-accent 
                  transition-all duration-300"
              >
                <div className="p-2 bg-accent/10 rounded-lg text-accent">
                  {step.icon}
                </div>
                <span className="text-gray-700 dark:text-gray-300">{step.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-gray-600 dark:text-gray-400 mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
        >
          The exported format is specifically designed to match Character.AI's requirements. Just copy and paste!
        </motion.p>

        <div className="flex justify-end gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl
              hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Close
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onContinue}
            className="px-6 py-2 bg-gradient-to-r from-accent to-accent-light text-white rounded-xl
              shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 
              transition-all duration-300 border border-white/20"
          >
            Continue to Export
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
