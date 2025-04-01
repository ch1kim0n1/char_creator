import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiEdit, FiSettings, FiDownload } from 'react-icons/fi';
import { MdAutoAwesome } from 'react-icons/md';

const IntroAnimation = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 8000); // Total animation duration

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800"
    >
      <div className="relative w-full h-full">
        {/* Animated background elements */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"
        />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: "100vw", y: "100vh" }}
            animate={{
              x: ["100vw", "0vw", "-100vw"],
              y: ["100vh", "0vh", "-100vh"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "linear",
            }}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}

        {/* Main content container */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          {/* Title */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mb-12"
          >
            <motion.h1
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="text-7xl font-bold text-white mb-4"
            >
              CHAR_CREATOR
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="text-xl text-white/80"
            >
              Create, Customize, and Export Your Characters
            </motion.p>
          </motion.div>

          {/* Character creation process visualization */}
          <div className="relative w-96 h-64 mb-12">
            {/* Base character */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <FiUser className="text-8xl text-white/40" />
            </motion.div>

            {/* Customization overlay */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 3 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <FiEdit className="text-8xl text-purple-400" />
            </motion.div>

            {/* AI enhancement */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 4 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <MdAutoAwesome className="text-8xl text-blue-400" />
            </motion.div>

            {/* Final character */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <FiUser className="text-8xl text-white" />
            </motion.div>
          </div>

          {/* Feature icons */}
          <div className="flex gap-8">
            {[
              { icon: FiUser, label: "Create" },
              { icon: FiEdit, label: "Customize" },
              { icon: FiSettings, label: "Configure" },
              { icon: FiDownload, label: "Export" },
            ].map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 6 + index * 0.2 }}
                className="flex flex-col items-center"
              >
                <feature.icon className="text-4xl text-white mb-2" />
                <span className="text-white/80 text-sm">{feature.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default IntroAnimation;