import { motion } from 'framer-motion';
import { FiGitCommit, FiStar, FiBug, FiTool } from 'react-icons/fi';
import devlogData from '../data/devlog.json';

const typeIcons = {
  'new feature': FiStar,
  'improvement': FiTool,
  'bug': FiBug,
  'fix': FiBug,
  'misc': FiGitCommit,
  'other': FiGitCommit
};

const typeColors = {
  'new feature': 'bg-green-500',
  'improvement': 'bg-blue-500',
  'bug': 'bg-red-500',
  'fix': 'bg-orange-500',
  'misc': 'bg-gray-500',
  'other': 'bg-gray-500'
};

const DevLog = () => {
  // Check if devlogData exists and has the devlog array
  if (!devlogData || !devlogData.devlog || !Array.isArray(devlogData.devlog)) {
    return (
      <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Development Log</h2>
        <p className="text-gray-600 dark:text-gray-300">No updates available.</p>
      </div>
    );
  }

  // Sort the devlog entries by date in descending order
  const sortedEntries = [...devlogData.devlog].sort((a, b) => {
    // Parse dates in YYYY-MM-DD format
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Development Log</h2>
      <div className="space-y-8">
        {sortedEntries.map((entry, dateIndex) => (
          <div key={dateIndex} className="relative">
            <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 py-2 mb-4">
              <h3 className="text-lg font-semibold text-accent">
                {new Date(entry.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'UTC' // Ensure dates are parsed in UTC
                })}
              </h3>
            </div>
            <div className="space-y-6">
              {entry.changes.map((change, changeIndex) => {
                const Icon = typeIcons[change.type.toLowerCase()] || typeIcons.other;
                const bgColor = typeColors[change.type.toLowerCase()] || typeColors.other;
                
                return (
                  <motion.div
                    key={changeIndex}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: changeIndex * 0.05 }}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      {changeIndex !== entry.changes.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-1 rounded-full bg-opacity-10 text-accent" 
                              style={{ backgroundColor: `${bgColor}20` }}>
                          {change.type}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {change.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {change.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default DevLog;