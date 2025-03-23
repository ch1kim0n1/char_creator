import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FiArrowLeft, FiSend, FiThumbsUp, FiHeart } from 'react-icons/fi';

const FeedbackPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedbackType: 'general',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Feedback message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // In a real application, you would submit this to a backend
    // For this example, we'll simulate a submission
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // If submission successful
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        feedbackType: 'general',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setErrors({
        submit: 'Failed to submit feedback. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
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
        <title>Feedback | C.AI Character Creator</title>
        <meta name="description" content="Submit your feedback for the C.AI Character Creator" />
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
            <div className="h-24 bg-gradient-to-r from-accent to-accent-light relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="text-3xl font-bold text-white">Share Your Feedback</h1>
              </div>
            </div>
            
            <div className="px-8 py-6">
              {isSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiThumbsUp className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Thank You for Your Feedback!</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Your feedback has been submitted successfully. It helps make the C.AI Character Creator better for everyone.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/')}
                    className="px-5 py-2.5 bg-accent text-white rounded-xl hover:bg-accent-dark transition-colors"
                  >
                    Return to Dashboard
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form 
                  variants={containerVariants}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <motion.div variants={itemVariants}>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                      Your feedback helps improve the C.AI Character Creator. Please share your thoughts, 
                      suggestions, bug reports, or feature requests.
                    </p>
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`form-input ${errors.name ? 'border-red-500 dark:border-red-500' : ''}`}
                        placeholder="Enter your name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`form-input ${errors.email ? 'border-red-500 dark:border-red-500' : ''}`}
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                      )}
                    </div>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <label htmlFor="feedbackType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Feedback Type
                    </label>
                    <select
                      id="feedbackType"
                      name="feedbackType"
                      value={formData.feedbackType}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="general">General Feedback</option>
                      <option value="feature">Feature Request</option>
                      <option value="bug">Bug Report</option>
                      <option value="suggestion">Suggestion</option>
                      <option value="other">Other</option>
                    </select>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Feedback
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className={`form-textarea ${errors.message ? 'border-red-500 dark:border-red-500' : ''}`}
                      placeholder="Please share your feedback in detail..."
                    ></textarea>
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message}</p>
                    )}
                  </motion.div>
                  
                  {errors.submit && (
                    <motion.div 
                      variants={itemVariants}
                      className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg"
                    >
                      {errors.submit}
                    </motion.div>
                  )}
                  
                  <motion.div 
                    variants={itemVariants}
                    className="flex justify-end"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl hover:bg-accent-dark transition-colors disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Sending Feedback...
                        </>
                      ) : (
                        <>
                          <FiSend />
                          Submit Feedback
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </motion.form>
              )}
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

export default FeedbackPage;
