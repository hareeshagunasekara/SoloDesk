import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle,
  Clock,
  Shield,
  Zap,
  Send
} from 'lucide-react';
import logo from '../assets/logo_light.png';

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const features = [
    {
      icon: <CheckCircle className="h-5 w-5" />,
      text: "Secure password reset process"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      text: "Quick email delivery"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      text: "Protected and encrypted"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      text: "Instant access recovery"
    }
  ];

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await forgotPassword(data.email);
      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError('root', {
          type: 'manual',
          message: result.error,
        });
      }
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-800 to-gray-700 flex flex-col">
        {/* Header with Logo */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center items-center py-8 px-6"
        >
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <img 
              src={logo} 
              alt="SoloDesk Logo" 
              className="h-12 w-12 object-contain"
            />
            <span className="text-3xl font-bold text-gray-100 group-hover:text-gray-200 transition-colors duration-300">SoloDesk</span>
          </Link>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-8">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full max-w-2xl mx-auto"
            >
              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="mx-auto h-16 w-16 rounded-full bg-gray-600/20 flex items-center justify-center mb-6"
                >
                  <Mail className="h-8 w-8 text-gray-300" />
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-3xl lg:text-4xl font-bold text-gray-100 mb-4"
                >
                  Check your email
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-lg text-gray-300 leading-relaxed mb-8"
                >
                  We've sent you a password reset link. Please check your email and follow the instructions to reset your password.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="space-y-3 mb-8"
                >
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.text}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                      className="flex items-center justify-center space-x-3"
                    >
                      <div className="text-gray-300">
                        {feature.icon}
                      </div>
                      <span className="text-gray-200 font-medium">{feature.text}</span>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-gray-300">
                    Didn't receive the email? Check your spam folder or{' '}
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="text-gray-400 hover:text-gray-300 transition-colors font-medium"
                    >
                      try again
                    </button>
                  </p>
                  
                  <Link
                    to="/login"
                    className="inline-flex items-center text-sm text-gray-400 hover:text-gray-300 transition-colors duration-300 font-medium"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to login
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="py-8 px-6 text-center"
        >
          <div className="max-w-2xl mx-auto space-y-4">
            <p className="text-gray-400 text-sm">
              © 2024 SoloDesk. All rights reserved.
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <Link
                to="/privacy"
                className="text-gray-500 hover:text-gray-300 transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-gray-500 hover:text-gray-300 transition-colors duration-300"
              >
                Terms of Service
              </Link>
              <Link
                to="/support"
                className="text-gray-500 hover:text-gray-300 transition-colors duration-300"
              >
                Support
              </Link>
            </div>
          </div>
        </motion.footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-800 to-gray-700 flex flex-col">
      {/* Header with Logo */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-center items-center py-8 px-6"
      >
        <Link to="/" className="inline-flex items-center space-x-3 group">
          <img 
            src={logo} 
            alt="SoloDesk Logo" 
            className="h-12 w-12 object-contain"
          />
          <span className="text-3xl font-bold text-gray-100 group-hover:text-gray-200 transition-colors duration-300">SoloDesk</span>
        </Link>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-8">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-6xl mx-auto"
          >
            <div className="max-w-2xl mx-auto">
              {/* Welcome Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-center mb-8"
              >
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-4xl lg:text-5xl font-bold text-gray-100 mb-4"
                >
                  Forgot your password?
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-lg text-gray-300 leading-relaxed"
                >
                  Enter your email address and we'll send you a link to reset your password.
                </motion.p>
              </motion.div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="space-y-3 mb-8"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="text-gray-300">
                      {feature.icon}
                    </div>
                    <span className="text-gray-200 font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Form */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Email field */}
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                    <input
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      placeholder="Email Address"
                      className={cn(
                        'w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:border-gray-400/50 transition-all duration-300',
                        errors.email ? 'border-red-400' : 'border-gray-600'
                      )}
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>

                {/* Root error */}
                {errors.root && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-red-400/10 border border-red-400/20"
                  >
                    <p className="text-sm text-red-400">{errors.root.message}</p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gray-600 text-gray-100 font-semibold py-4 px-6 rounded-xl hover:bg-gray-500 hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-gray-100 border-t-transparent rounded-full"
                      />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>

                {/* Back to Login Link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                  className="text-center"
                >
                  <Link
                    to="/login"
                    className="inline-flex items-center text-sm text-gray-400 hover:text-gray-300 transition-colors duration-300 font-medium"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to login
                  </Link>
                </motion.div>
              </motion.form>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="py-8 px-6 text-center"
      >
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-gray-400 text-sm">
            © 2024 SoloDesk. All rights reserved.
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link
              to="/privacy"
              className="text-gray-500 hover:text-gray-300 transition-colors duration-300"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-gray-500 hover:text-gray-300 transition-colors duration-300"
            >
              Terms of Service
            </Link>
            <Link
              to="/support"
              className="text-gray-500 hover:text-gray-300 transition-colors duration-300"
            >
              Support
            </Link>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default ForgotPassword; 