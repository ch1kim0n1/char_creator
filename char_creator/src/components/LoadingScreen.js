import { motion } from 'framer-motion';
import { MdOutlineAutoAwesome } from 'react-icons/md';

const LoadingScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-900 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 360, 0]
        }}
        transition={{ 
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-accent text-6xl"
      >
        <MdOutlineAutoAwesome />
      </motion.div>
    </motion.div>
  );
};

export default LoadingScreen;
