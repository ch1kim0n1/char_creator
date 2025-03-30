import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';

export default function CharacterAITutorial({ onClose, onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How to Import to Character.AI</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-gray-700 dark:text-gray-300">
            To import your character to Character.AI, follow these steps:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Go to Character.AI website</li>
            <li>Click on "Create" in the top navigation</li>
            <li>Click "Create a Character"</li>
            <li>In the character creation form, you'll see various fields</li>
            <li>Copy and paste the exported content into respective fields</li>
            <li>For the image, upload the exported PFP file</li>
          </ol>
          <p className="text-gray-700 dark:text-gray-300">
            The exported format is specifically designed to match Character.AI's requirements.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl"
          >
            Close
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onContinue}
            className="px-4 py-2 bg-primary text-white rounded-xl"
          >
            Continue to Export
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
