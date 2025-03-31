import { motion } from 'framer-motion';
import Link from 'next/link';
import { MdAutoAwesome, MdMenuBook } from 'react-icons/md';

const Header = () => {
  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.165, 0.84, 0.44, 1] }}
      className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-white/10 dark:bg-gray-900/30 backdrop-blur-xl shadow-lg border-b-2 border-gray-300 dark:border-gray-600"
    >
      <Link href="/">
        <motion.div
          className="flex items-center gap-3 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <MdAutoAwesome className="text-cyan-500 dark:text-cyan-400 text-3xl filter drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]" />
          <h1 className="text-xl md:text-2xl font-semibold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-cyan-600 dark:from-cyan-300 dark:to-cyan-400">char_</span>
            <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-600 to-gray-800 dark:from-white dark:via-gray-300 dark:to-gray-100">creator</span>
          </h1>
        </motion.div>
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05, filter: 'brightness(110%)' }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center cursor-pointer gap-2 text-sm sm:text-base font-medium px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800 dark:from-white dark:via-gray-200 dark:to-gray-300 text-white dark:text-gray-800 shadow-md shadow-gray-500/20 hover:shadow-lg hover:shadow-gray-500/30 transition-all duration-200"
          >
            <MdMenuBook size={20} />
            <span className="hidden sm:inline">My Characters</span>
          </motion.button>
        </Link>
      </div>
    </motion.nav>
  );
};

export default Header;
