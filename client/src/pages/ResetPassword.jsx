import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle,
  Clock,
  Shield,
  Zap,
  Key
} from 'lucide-react';
import logo from '../assets/logo.png';

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm();

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  const features = [
    {
      icon: <CheckCircle className="h-5 w-5" />,
      text: "Secure password reset"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      text: "Quick and easy process"
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

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
    }
  }, [token]);

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPassword(token, data.password);
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

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#210B2C] via-[#BC96E6] to-[#FFD166] flex flex-col">
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
            <span className="text-3xl font-bold text-white group-hover:text-[#FFD166] transition-colors duration-300">SoloDesk</span>
          </Link>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-8">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full max-w-2xl mx-auto text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mx-auto h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6"
              >
                <Key className="h-8 w-8 text-red-500" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-3xl lg:text-4xl font-bold text-white mb-4"
              >
                Invalid Reset Link
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-lg text-white/80 leading-relaxed mb-8"
              >
                The password reset link is invalid or has expired. Please request a new password reset link.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="space-y-4"
              >
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center text-sm text-[#FFD166] hover:text-[#FFD166]/80 transition-colors duration-300 font-medium"
                >
                  Request new reset link
                </Link>
                
                <div className="text-white/60">or</div>
                
          <Link
            to="/login"
                  className="inline-flex items-center text-sm text-[#FFD166] hover:text-[#FFD166]/80 transition-colors duration-300 font-medium"
          >
                  <ArrowLeft className="h-4 w-4 mr-2" />
            Back to login
          </Link>
              </motion.div>
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
            <p className="text-white/70 text-sm">
              © 2024 SoloDesk. All rights reserved.
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <Link
                to="/privacy"
                className="text-white/60 hover:text-white transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-white/60 hover:text-white transition-colors duration-300"
              >
                Terms of Service
              </Link>
              <Link
                to="/support"
                className="text-white/60 hover:text-white transition-colors duration-300"
              >
                Support
              </Link>
            </div>
          </div>
        </motion.footer>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#210B2C] via-[#BC96E6] to-[#FFD166] flex flex-col">
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
            <span className="text-3xl font-bold text-white group-hover:text-[#FFD166] transition-colors duration-300">SoloDesk</span>
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
                  className="mx-auto h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6"
                >
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-3xl lg:text-4xl font-bold text-white mb-4"
                >
                  Password Reset Successfully
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-lg text-white/80 leading-relaxed mb-8"
                >
                  Your password has been successfully reset. You can now log in with your new password.
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
                      <div className="text-[#FFD166]">
                        {feature.icon}
                      </div>
                      <span className="text-white/90 font-medium">{feature.text}</span>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="space-y-4"
                >
                  <button
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center text-sm text-[#FFD166] hover:text-[#FFD166]/80 transition-colors duration-300 font-medium"
                  >
                    Continue to login
                  </button>
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
            <p className="text-white/70 text-sm">
              © 2024 SoloDesk. All rights reserved.
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <Link
                to="/privacy"
                className="text-white/60 hover:text-white transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-white/60 hover:text-white transition-colors duration-300"
              >
                Terms of Service
              </Link>
          <Link
                to="/support"
                className="text-white/60 hover:text-white transition-colors duration-300"
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
    <div className="min-h-screen bg-gradient-to-br from-[#210B2C] via-[#BC96E6] to-[#FFD166] flex flex-col">
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
          <span className="text-3xl font-bold text-white group-hover:text-[#FFD166] transition-colors duration-300">SoloDesk</span>
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
                  className="text-4xl lg:text-5xl font-bold text-white mb-4"
                >
                  Reset Your Password
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-lg text-white/80 leading-relaxed"
                >
                  Enter your new password below to complete the reset process.
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
                    <div className="text-[#FFD166]">
                      {feature.icon}
      </div>
                    <span className="text-white/90 font-medium">{feature.text}</span>
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
                {/* Password field */}
                <div className="space-y-2">
          <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60 pointer-events-none z-10" />
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                },
              })}
                      placeholder="New Password"
              className={cn(
                        'w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FFD166]/50 focus:border-[#FFD166]/50 transition-all duration-300',
                        errors.password ? 'border-red-400' : 'border-white/20'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm"
                    >
                      {errors.password.message}
                    </motion.p>
          )}
        </div>

                {/* Confirm Password field */}
                <div className="space-y-2">
          <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60 pointer-events-none z-10" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                        validate: (value) => value === password || 'Passwords do not match',
              })}
                      placeholder="Confirm New Password"
              className={cn(
                        'w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FFD166]/50 focus:border-[#FFD166]/50 transition-all duration-300',
                        errors.confirmPassword ? 'border-red-400' : 'border-white/20'
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm"
                    >
                      {errors.confirmPassword.message}
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
                  className="w-full bg-[#FFD166] text-[#210B2C] font-semibold py-4 px-6 rounded-xl hover:bg-[#FFD166]/90 hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-[#210B2C] border-t-transparent rounded-full"
                      />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <Key className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
                    className="inline-flex items-center text-sm text-[#FFD166] hover:text-[#FFD166]/80 transition-colors duration-300 font-medium"
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
          <p className="text-white/70 text-sm">
            © 2024 SoloDesk. All rights reserved.
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link
              to="/privacy"
              className="text-white/60 hover:text-white transition-colors duration-300"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-white/60 hover:text-white transition-colors duration-300"
            >
              Terms of Service
            </Link>
            <Link
              to="/support"
              className="text-white/60 hover:text-white transition-colors duration-300"
            >
              Support
            </Link>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default ResetPassword; 