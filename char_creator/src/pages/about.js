import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { FiArrowLeft, FiGithub, FiLinkedin, FiMail, FiTwitter, FiHeart, FiUser } from 'react-icons/fi';

const AboutPage = () => {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        when: 'beforeChildren'
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <>
      <Head>
        <title>About | C.AI Character Creator</title>
        <meta name="description" content="Information about the C.AI Character Creator and its developer" />
      </Head>

      <div className="min-h-screen bg-gray-200 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
        <div className="max-w-3xl mx-auto pt-12 pb-12 px-6 flex-grow">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <button 
              onClick={() => router.push('/')}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent-light transition-colors"
            >
              <FiArrowLeft className="mr-2" /> Back to Dashboard
            </button>
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="h-32 bg-gradient-to-r from-accent to-accent-light"></div>
            
            <div className="px-8 py-6">
              <motion.h1 
                variants={itemVariants}
                className="text-3xl font-bold text-gray-900 dark:text-white mb-6 animate-slide-in-left"
              >
                About C.AI Character Creator
              </motion.h1>
              
              <motion.div 
                variants={itemVariants}
                className="prose dark:prose-invert max-w-none mb-8"
              >
                <p className="text-gray-700 dark:text-gray-300">
                  C.AI Character Creator is a tool designed to help you create, manage, and export character profiles for 
                  use with Character.AI and other AI storytelling platforms. It provides an intuitive interface for 
                  building detailed character personas with customizable traits, backgrounds, and personalities.
                </p>
                
                <p className="text-gray-700 dark:text-gray-300 mt-4">
                  <strong>Key features:</strong>
                </p>
                
                <ul className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                  <li>Intuitive character creation workflow</li>
                  <li>Local storage for all your characters</li>
                  <li>Export in Character.AI compatible format</li>
                  <li>Dark/Light mode support</li>
                  <li>Responsive design that works on any device</li>
                  <li>Image upload and customization</li>
                </ul>
                
                <div className="mt-6 p-4 bg-accent/10 dark:bg-accent/20 rounded-xl border border-accent/20">
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    <strong>Disclaimer:</strong> C.AI Character Creator is a fan-made tool and is not affiliated with, endorsed by, 
                    or connected to Character.AI in any way. This is an independent project created to help the community.
                  </p>
                </div>
              </motion.div>
              
              <motion.h2 
                variants={itemVariants}
                className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
              >
                About the Developer
              </motion.h2>
              
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-6 mb-8 items-start"
              >
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {/* Replace with actual developer avatar if available */}
                  <FiUser className="w-12 h-12 text-gray-400" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Vladislav Kondratyev</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Web developer and AI enthusiast passionate about creating tools that help others 
                    express their creativity. I built C.AI Character Creator to make it easier for people 
                    to create rich, detailed characters for their AI interactions and storytelling.
                  </p>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Connect with me</h3>
                
                <div className="flex flex-wrap gap-3">
                  <a 
                    href="https://github.com/yourgithub" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full transition-colors text-gray-800 dark:text-gray-200"
                  >
                    <FiGithub /> GitHub
                  </a>
                  <a 
                    href="https://linkedin.com/in/yourlinkedin" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/30 rounded-full transition-colors text-blue-800 dark:text-blue-300"
                  >
                    <FiLinkedin /> LinkedIn
                  </a>
                  <a 
                    href="mailto:your.email@example.com" 
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/30 rounded-full transition-colors text-green-800 dark:text-green-300"
                  >
                    <FiMail /> Email
                  </a>
                  <a 
                    href="https://twitter.com/yourtwitter" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/30 rounded-full transition-colors text-blue-600 dark:text-blue-300"
                  >
                    <FiTwitter /> Twitter
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
        
        <footer className="footer">
          <p>Made with <span className="heart"><FiHeart /></span> for character creators</p>
        </footer>
      </div>
    </>
  );
};

export default AboutPage; 
