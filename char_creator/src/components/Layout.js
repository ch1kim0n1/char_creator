import { motion } from 'framer-motion';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import Footer from './website_essentials/Footer';
import Header from './website_essentials/Header';

const Layout = ({ children, title = 'char_creator' }) => {
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
        <Header />
        <main className="container mx-auto px-4 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
