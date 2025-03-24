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
    
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: '45ae0f98-37df-4284-aada-6c17f42c747f', // Replace with your Web3Forms access key
          name: formData.name,
          email: formData.email,
          feedback_type: formData.feedbackType,
          message: formData.message,
          subject: `New Feedback: ${formData.feedbackType} from ${formData.name}`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setIsSubmitted(true);
        setFormData({
          name: '',
          email: '',
          feedbackType: 'general',
          message: ''
        });
      } else {
        throw new Error('Failed to submit feedback');
      }
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
            <motion.button 
              onClick={() => router.push('/')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 text-white 
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
            <div className="h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">Share Your Feedback</h1>
              </div>
            </div>
            
            <div className="px-8 py-6">
              {isSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="text-center py-10"
                >
                  <motion.div 
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 
                      rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                  >
                    <FiThumbsUp className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-3">Thank You for Your Feedback!</h2>
                  <p className="text-white mb-6 max-w-md mx-auto">
                    Your feedback has been submitted successfully. It helps make the C.AI Character Creator better for everyone.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/')}
                    className="px-5 py-2.5 bg-accent text-white rounded-xl 
                        hover:bg-accent-dark transition-all duration-300 
                        border border-accent/20 shadow-lg shadow-white/20 
                        hover:shadow-xl hover:shadow-white/30 cursor-pointer"
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
                    <p className="text-white mb-6 text-lg">
                      Help us improve C.AI Character Creator by sharing your experience. 
                      Your feedback shapes the future of character creation.
                    </p>
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`form-input bg-gray-100 dark:bg-gray-700 text-white ${errors.name ? 'border-red-500 dark:border-red-500' : ''}`}
                        placeholder="Enter your name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`form-input bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white ${errors.email ? 'border-red-500 dark:border-red-500' : ''}`}
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                      )}
                    </div>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <label htmlFor="feedbackType" className="block text-sm font-medium text-white mb-1">
                      Feedback Type
                    </label>
                    <select
                      id="feedbackType"
                      name="feedbackType"
                      value={formData.feedbackType}
                      onChange={handleChange}
                      className="form-input bg-gray-100 dark:bg-gray-700 text-white
                        border border-gray-300 dark:border-gray-600 focus:border-accent 
                        dark:focus:border-accent rounded-xl shadow-sm transition-all duration-200"
                    >
                      <option value="general">💭 General Feedback</option>
                      <option value="feature">✨ Feature Request</option>
                      <option value="bug">🐛 Bug Report</option>
                      <option value="suggestion">💡 Suggestion</option>
                      <option value="other">📝 Other</option>
                    </select>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <label htmlFor="message" className="block text-sm font-medium text-white mb-1">
                      Your Feedback
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="form-textarea bg-gray-100 dark:bg-gray-700 text-white
                        border border-gray-300 dark:border-gray-600 focus:border-accent 
                        dark:focus:border-accent rounded-xl shadow-sm transition-all duration-200
                        w-full resize-none"
                      placeholder="Please share your thoughts, ideas, or concerns..."
                    ></textarea>
                    {errors.message && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-400"
                      >
                        {errors.message}
                      </motion.p>
                    )}
                  </motion.div>
                  
                  {errors.submit && (
                    <motion.div 
                      variants={itemVariants}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-red-100 dark:bg-red-900/30 text-red-400 
                        rounded-xl border border-red-200 dark:border-red-800/30"
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
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-accent-light
                        text-white rounded-xl transition-all duration-300 
                        border border-accent/20 shadow-lg shadow-accent/20
                        hover:shadow-xl hover:shadow-accent/30 
                        disabled:opacity-70 disabled:cursor-not-allowed
                        cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <FiSend className="animate-pulse" />
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