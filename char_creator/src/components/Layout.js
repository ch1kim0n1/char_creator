import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import { MdAutoAwesome, MdMenuBook } from 'react-icons/md';
import { useState, useEffect } from 'react';

const Layout = ({ children, title = 'Fiction Character Creator' }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    setIsDarkMode(true);
  }, []);

  return (
    <div className={`min-h-screen font-poppins ${isDarkMode ? 'dark' : ''}`}>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Create and manage your fictional characters" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <motion.nav
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.165, 0.84, 0.44, 1] }}
          className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-gray-100 dark:border-gray-800"
        >
          <Link href="/">
            <motion.div
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <MdAutoAwesome className="text-primary text-3xl" />
              <h1 className="text-xl md:text-2xl font-semibold text-primary dark:text-primary-light">
                Fiction <span className="font-bold">Character</span>
              </h1>
            </motion.div>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-sm sm:text-base font-medium px-3 py-2 rounded-full bg-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors duration-200"
              >
                <MdMenuBook size={18} />
                <span className="hidden sm:inline">My Characters</span>
              </motion.button>
            </Link>
          </div>
        </motion.nav>

        <main className="container mx-auto px-4 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {children}
          </motion.div>
        </main>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="py-6 text-center text-gray-500 dark:text-gray-400 text-sm border-t border-gray-100 dark:border-gray-800"
        >
          <p className="flex items-center justify-center gap-1">
            Created with <MdAutoAwesome className="text-primary" /> for character creators
          </p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Layout;
