import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiX } from 'react-icons/fi';

const ErrorPopup = ({ message, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg shadow-lg p-4 max-w-md">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                {message}
              </p>
              <button
                onClick={onClose}
                className="mt-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-sm font-medium flex items-center gap-1"
              >
                <FiX className="w-4 h-4" />
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ErrorPopup; 