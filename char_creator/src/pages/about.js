import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { FiArrowLeft, FiGithub, FiLinkedin, FiMail, FiTwitter, FiHeart, FiUser } from 'react-icons/fi';
import Image from 'next/image';
import pfp from '../../public/pfp.jpg';

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
        <title>About | char_creator</title>
        <meta name="description" content="Information about the char_creator and its developer" />
      </Head>

      <div className="min-h-screen bg-gray-200 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
        <div className="max-w-3xl mx-auto pt-12 pb-12 px-6 flex-grow">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <motion.button 
              onClick={() => router.push('/')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 
                hover:text-accent dark:hover:text-accent bg-white dark:bg-gray-800 
                rounded-xl border border-gray-200 dark:border-gray-600
                transition-all duration-300 hover:shadow-lg hover:shadow-white/20 
                dark:hover:shadow-white/10 cursor-pointer"
            >
              <FiArrowLeft /> Back to Dashboard
            </motion.button>
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">About char_creator</h1>
              </div>
            </div>
            
            <div className="px-8 py-6">
              <motion.div 
                variants={itemVariants}
                className="prose dark:prose-invert max-w-none mb-8"
              >
                <p className="text-white">
                  char_creator is an advanced tool designed to help you create, manage, and export character profiles for 
                  use with Character.AI and other AI storytelling platforms. Our intuitive interface enables you to build 
                  rich, detailed character personas with dynamic traits, compelling backgrounds, and unique personalities.
                </p>
                
                <p className="text-white mt-4">
                  <strong>Key features:</strong>
                </p>
                
                <ul className="mt-2 space-y-2 text-white">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-accent rounded-full"></span>
                    Advanced character creation workflow with dynamic traits and customization options
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-accent rounded-full"></span>
                    Secure local storage
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-accent rounded-full"></span>
                    One-click text and image export in Character.AI compatible format
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-accent rounded-full"></span>
                    Responsive design optimized for all devices
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-accent rounded-full"></span>
                    Advanced image processing and customization tools
                  </li>
                </ul>
                
                <div className="mt-6 p-4 bg-accent/10 dark:bg-accent/20 rounded-xl border border-accent/20">
                  <p className="text-white italic">
                    <strong>Disclaimer:</strong> char_creator is a fan-made tool and is not affiliated with, endorsed by, 
                    or connected to Character.AI in any way. This is an independent project created to help the community.
                  </p>
                </div>
              </motion.div>
              
              <motion.h2 
                variants={itemVariants}
                className="text-2xl font-bold text-white mb-4"
              >
                About the Developer
              </motion.h2>
              
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-6 mb-8 items-start"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg">
                  <Image
                    src={pfp}
                    alt="Vladislav K."
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white">Vladislav K.</h3>
                  <p className="text-gray-300 mt-2">
                    Hey there! I'm Vladislav, the developer behind char_creator.
                    The idea to create this tool came out of nowhere and I just decided to make it happen.
                    I really hope you like it, becaue I am always all about creating new awesome things!
                  </p>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Connect with me</h3>
                
                <div className="flex flex-wrap gap-3">
                  <motion.a 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="https://github.com/ch1kim0n1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 
                      border border-gray-300 dark:border-gray-600
                      hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl
                      transition-all duration-300 hover:shadow-lg hover:shadow-white/20 
                      dark:hover:shadow-white/10 text-gray-800 dark:text-gray-200 cursor-pointer"
                  >
                    <FiGithub /> GitHub
                  </motion.a>
                  <motion.a 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="https://www.linkedin.com/in/vladislav-kondratyev/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 
                      border border-blue-200 dark:border-blue-800/30
                      hover:bg-blue-200 dark:hover:bg-blue-800/30 rounded-xl
                      transition-all duration-300 hover:shadow-lg hover:shadow-white/20 
                      dark:hover:shadow-white/10 text-blue-800 dark:text-blue-300 cursor-pointer"
                  >
                    <FiLinkedin /> LinkedIn
                  </motion.a>
                  <motion.a 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="mailto:chikimoni61@gmail.com" 
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 
                      border border-green-200 dark:border-green-800/30
                      hover:bg-green-200 dark:hover:bg-green-800/30 rounded-xl
                      transition-all duration-300 hover:shadow-lg hover:shadow-white/20 
                      dark:hover:shadow-white/10 text-green-800 dark:text-green-300 cursor-pointer"
                  >
                    <FiMail /> Email
                  </motion.a>
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