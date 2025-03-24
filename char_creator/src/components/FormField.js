import { FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';

const FormField = ({ 
  label, 
  name, 
  type = 'text', 
  placeholder, 
  description, 
  required = false, 
  as = 'input', 
  options = [],
  value,
  onChange,
  error
}) => {
  const InputComponent = as;
  const id = `field-${name}`;
  
  return (
    <div className="mb-5 relative">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-status-error">*</span>}
        </label>
        {description && (
          <div className="group relative">
            <FiInfo className="text-gray-400 hover:text-primary cursor-help" />
            <div className="absolute right-0 -top-1 transform translate-y-full w-64 bg-gray-900 dark:bg-gray-800 p-2 rounded-lg shadow-lg text-xs text-white invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity z-10 border border-gray-700">
              {description}
            </div>
          </div>
        )}
      </div>

      {as === 'select' ? (
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
            error ? 'border-status-error' : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          <option value="">{placeholder || 'Select an option'}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : as === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
          className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
            error ? 'border-status-error' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
      ) : (
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
            error ? 'border-status-error' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
      )}
      
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-status-error"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default FormField;
