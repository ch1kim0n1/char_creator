import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUser } from 'react-icons/fi';
import Head from 'next/head';

export default function TemplateCharacters() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]); // Initialize as empty array
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('./api/character-templates');
        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }
        const data = await response.json();
        // Ensure data is an array before setting state
        setTemplates(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading templates:', error);
        setError(error.message);
        setTemplates([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const handleSelectTemplate = (template) => {
    const formattedTemplate = {
      id: Date.now().toString(), // Add temporary id for new character
      name: template.Character,
      description: template.Backstory,
      personality: template.Personality,
      background: template.Backstory,
      attributes: {
        gender: template.Gender,
        age: template.Age,
        height: template.Heights,
        species: template.Speciest,
        occupation: template.Occupation,
        status: template.Status,
        language: template.Language
      },
      appearance: {
        description: template.Appearance,
        figure: template.Figure
      },
      traits: {
        skills: template.Skill?.split(', ') || [],
        habits: template.Habit?.split(', ') || [],
        likes: template.Likes?.split(', ') || [],
        dislikes: template.Dislike?.split(', ') || []
      },
      imageUrl: template.imageUrl
    };

    // Change back to create page
    router.push({
      pathname: '/create',
      query: { template: JSON.stringify(formattedTemplate) },
    });
  };

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-900 transition-colors duration-200">
      <Head>
        <title>Template Characters - char_creator</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            <FiArrowLeft className="w-6 h-6" />
          </motion.button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Template Characters</h1>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-red-500 dark:text-red-400 mb-4">
              Error loading templates: {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-dark"
            >
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full"
            />
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No template characters available.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ y: -8 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="aspect-square relative bg-gray-200 dark:bg-gray-700">
                  {template.imageUrl ? (
                    <img
                      src={template.imageUrl}
                      alt={template.Character}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiUser className="w-20 h-20 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {template.Character}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                    {template.Backstory}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {template.Speciest && (
                      <span className="px-2 py-1 bg-accent/10 text-accent rounded-lg text-xs">
                        {template.Speciest}
                      </span>
                    )}
                    {template.Occupation && (
                      <span className="px-2 py-1 bg-accent/10 text-accent rounded-lg text-xs">
                        {template.Occupation}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
