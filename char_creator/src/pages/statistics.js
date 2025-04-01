import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FiArrowLeft, FiBarChart2, FiUser, FiUsers, FiAward } from 'react-icons/fi';
import { getCharacterStatistics } from '../utils/characterStorage';
import Header from '../components/website_essentials/Header';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Statistics() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add new chart data states
  const [speciesData, setSpeciesData] = useState({ labels: [], data: [] });
  const [ageDistribution, setAgeDistribution] = useState({ labels: [], data: [] });
  const [creationTimeline, setCreationTimeline] = useState({ labels: [], data: [] });
  const [topCreators, setTopCreators] = useState([]);

  useEffect(() => {
    try {
      const statistics = getCharacterStatistics();
      setStats(statistics);

      // Process species data
      const speciesCount = statistics.speciesDistribution;
      setSpeciesData({
        labels: Object.keys(speciesCount),
        data: Object.values(speciesCount)
      });

      // Process age distribution
      const ageGroups = statistics.ageDistribution;
      setAgeDistribution({
        labels: Object.keys(ageGroups),
        data: Object.values(ageGroups)
      });

      // Fix timeline data processing
      setCreationTimeline({
        labels: statistics.creationTimelineEnhanced.map(d => d.date),
        data: statistics.creationTimelineEnhanced
      });

      // Set top creators
      setTopCreators(statistics.topCreators);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-200 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-primary border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, className = "" }) => (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 ${className}`}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
      </div>
    </motion.div>
  );

  // Chart options and configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgb(156, 163, 175)'
        }
      }
    }
  };

  return (
    <>
      <Head>
        <title>Statistics | char_creator</title>
        <meta name="description" content="Character creation statistics and analytics" />
      </Head>

      <div className="min-h-screen bg-gray-200 dark:bg-gray-900 transition-colors duration-200">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12"> {/* Added space-y-12 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <motion.button
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                onClick={() => router.push('/')}
                className="cursor-pointer flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
              >
                <FiArrowLeft /> Back to Dashboard
              </motion.button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Character Statistics</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"> {/* Changed gap-6 to gap-8 */}
            <StatCard 
              title="Total Characters" 
              value={stats.totalCharacters}
              icon={FiUsers}
            />
            <StatCard 
              title="Average Height" 
              value={`${stats.heightStatistics.average} cm`}
              icon={FiUser}
            />
            <StatCard 
              title="Most Common Skill" 
              value={stats.mostCommonSkills[0]?.word || 'N/A'}
              icon={FiAward}
            />
            <StatCard 
              title="Average Completeness" 
              value={`${stats.completeness.average}%`}
              icon={FiBarChart2}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gender Distribution */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Gender Distribution</h2>
              <div className="space-y-4">
                {Object.entries(stats.genderDistribution).map(([gender, count]) => (
                  <div key={gender} className="flex items-center gap-4">
                    <div className="w-24 text-gray-600 dark:text-gray-400 capitalize">{gender}</div>
                    <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / stats.totalCharacters) * 100}%` }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                    <div className="w-12 text-right text-gray-600 dark:text-gray-400">{count}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Common Personality Traits */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Common Personality Traits</h2>
              <div className="grid grid-cols-2 gap-4">
                {stats.mostCommonPersonalityWords.map(({ word, count }) => (
                  <div key={word} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-gray-700 dark:text-gray-300">{word}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-auto">({count})</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Creation Timeline */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Character Creation Timeline</h2>
              <div className="h-[300px]">
                <Line
                  data={{
                    labels: creationTimeline.labels,
                    datasets: [
                      {
                        label: 'Characters Created',
                        data: creationTimeline.data.map(d => d.creations),
                        borderColor: 'rgb(99, 102, 241)',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        tension: 0.4
                      },
                      {
                        label: 'Characters Edited',
                        data: creationTimeline.data.map(d => d.edits),
                        borderColor: 'rgb(236, 72, 153)',
                        backgroundColor: 'rgba(236, 72, 153, 0.1)',
                        tension: 0.4
                      }
                    ]
                  }}
                  options={chartOptions}
                />
              </div>
            </motion.div>

            {/* Species Distribution */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Species Distribution</h2>
              <div className="h-[300px]">
                <Doughnut
                  data={{
                    labels: speciesData.labels,
                    datasets: [{
                      data: speciesData.data,
                      backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(167, 139, 250, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(248, 113, 113, 0.8)',
                        'rgba(251, 146, 60, 0.8)'
                      ]
                    }]
                  }}
                  options={chartOptions}
                />
              </div>
            </motion.div>
          </div>

          {/* Leaderboard Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 mb-8" // Changed p-6 to p-8
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Top Characters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topCreators.map((character, index) => (
                <motion.div
                  key={character.id}
                  whileHover={{ y: -5 }}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl 
                    border border-gray-200 dark:border-gray-600"
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600">
                      {character.imageUrl ? (
                        <img
                          src={character.imageUrl}
                          alt={character.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiUser className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary 
                      flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{character.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Completeness: {character.completeness}%
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Additional Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Age Distribution */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Age Distribution</h2>
              <div className="h-[300px]">
                <Bar
                  data={{
                    labels: ageDistribution.labels,
                    datasets: [{
                      label: 'Characters',
                      data: ageDistribution.data,
                      backgroundColor: 'rgba(99, 102, 241, 0.8)'
                    }]
                  }}
                  options={chartOptions}
                />
              </div>
            </motion.div>

            {/* Common Traits Cloud */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Common Traits</h2>
              <div className="flex flex-wrap gap-2">
                {stats.mostCommonTraits?.map((trait) => (
                  <div
                    key={trait.word}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary 
                      text-sm font-medium"
                    style={{
                      fontSize: `${Math.max(0.8, Math.min(1.5, trait.count / 5))}rem`
                    }}
                  >
                    {trait.word}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Language Distribution */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Language Distribution</h2>
              <div className="h-[300px]">
                <Bar
                  data={{
                    labels: stats.additionalStats?.languageStats ? Object.keys(stats.additionalStats.languageStats) : [],
                    datasets: [{
                      label: 'Characters',
                      data: Object.values(stats.additionalStats.languageStats),
                      backgroundColor: 'rgba(167, 139, 250, 0.8)'
                    }]
                  }}
                  options={chartOptions}
                />
              </div>
            </motion.div>

            {/* Occupation Categories */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Occupation Distribution</h2>
              <div className="h-[300px]">
                <Doughnut
                  data={{
                    labels: Object.keys(stats.additionalStats.occupationStats),
                    datasets: [{
                      data: Object.values(stats.additionalStats.occupationStats),
                      backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(167, 139, 250, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(248, 113, 113, 0.8)',
                        'rgba(251, 146, 60, 0.8)'
                      ]
                    }]
                  }}
                  options={chartOptions}
                />
              </div>
            </motion.div>
          </div>

          {/* Background Length Analysis */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 mb-8" // Changed p-6 to p-8
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Background Detail Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-3"> {/* Changed color to white */}
                  {Math.round(stats.additionalStats.backgroundStats.reduce((a, b) => a + b, 0) / 
                    stats.additionalStats.backgroundStats.length || 0)}
                </div>
                <div className="text-gray-400">Average Words</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-3"> {/* Changed color to white */}
                  {Math.max(...stats.additionalStats.backgroundStats) || 0}
                </div>
                <div className="text-gray-400">Longest Background</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-3"> {/* Changed color to white */}
                  {stats.additionalStats.backgroundStats.filter(words => words > 100).length}
                </div>
                <div className="text-gray-400">Detailed Backgrounds</div>
              </div>
            </div>
          </motion.div>

          {/* Profile Completeness Distribution */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 h-[450px]" // Increased height and padding
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Profile Images & Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[300px]">
              <div className="h-[300px] relative">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Profile Images</h3>
                {stats.additionalStats?.imageStats && (
                  <Doughnut
                    data={{
                      labels: ['With Image', 'Without Image'],
                      datasets: [{
                        data: [
                          stats.additionalStats.imageStats.withImage || 0,
                          stats.additionalStats.imageStats.withoutImage || 0
                        ],
                        backgroundColor: [
                          'rgba(99, 102, 241, 0.8)',
                          'rgba(236, 72, 153, 0.8)'
                        ]
                      }]
                    }}
                    options={{
                      ...chartOptions,
                      animation: {
                        duration: 0 // Disable animations to prevent GPU stress
                      },
                      maintainAspectRatio: false
                    }}
                  />
                )}
              </div>
              <div className="h-[300px] relative">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Likes vs Dislikes</h3>
                {stats.additionalStats?.preferencesStats && (
                  <Bar
                    data={{
                      labels: ['Likes', 'Dislikes'],
                      datasets: [{
                        label: 'Count',
                        data: [
                          stats.additionalStats.preferencesStats.likes || 0,
                          stats.additionalStats.preferencesStats.dislikes || 0
                        ],
                        backgroundColor: [
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(239, 68, 68, 0.8)'
                        ]
                      }]
                    }}
                    options={{
                      ...chartOptions,
                      animation: {
                        duration: 0 // Disable animations to prevent GPU stress
                      },
                      maintainAspectRatio: false
                    }}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
