import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle,
  Clock,
  Shield,
  Zap
} from 'lucide-react';
import logo from '../assets/logo_light.png';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    watch,
  } = useForm();

  const email = watch('email');
  const password = watch('password');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Don't render the form if already authenticated or still loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-800 to-gray-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-100 mx-auto mb-4"></div>
          <p className="text-gray-100 text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const features = [
    {
      icon: <CheckCircle className="h-5 w-5" />,
      text: "Access all your projects and clients"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      text: "Track time and manage deadlines"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      text: "Secure and encrypted data"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      text: "Lightning-fast performance"
    }
  ];

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    console.log('=== Login Flow Debug ===');
    console.log('1. Form submitted with email:', data.email);
    
    try {
      console.log('2. Calling login function from AuthContext...');
      const result = await login(data);
      console.log('3. Login result:', result);
      
      if (result.success) {
        console.log('4. Login successful, user data:', result.user);
        
        // Check token storage
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        console.log('5. Token stored in localStorage:', !!storedToken);
        console.log('6. User stored in localStorage:', !!storedUser);
        console.log('7. Token preview:', storedToken ? storedToken.substring(0, 50) + '...' : 'none');
        
        // Handle navigation based on onboarding status
        if (!result.user.onboarding?.isCompleted) {
          console.log('8. Redirecting to onboarding...');
          navigate('/onboarding');
        } else {
          console.log('8. Redirecting to dashboard...');
          navigate('/dashboard');
        }
      } else {
        console.log('4. Login failed:', result.error);
        console.log('4a. Error message (lowercase):', result.error?.toLowerCase());
        
        // Handle specific error cases
        const errorMessage = result.error?.toLowerCase() || '';
        
        if (errorMessage.includes('invalid email or password') || errorMessage.includes('invalid credentials') || errorMessage.includes('wrong password')) {
          setError('password', {
            type: 'manual',
            message: 'Incorrect password. Please try again.',
          });
        } else if (errorMessage.includes('user not found') || errorMessage.includes('email not found')) {
          setError('email', {
            type: 'manual',
            message: 'No account found with this email address.',
          });
        } else if (errorMessage.includes('account not verified')) {
          setError('root', {
            type: 'manual',
            message: 'Please verify your email address before logging in.',
          });
        } else if (errorMessage.includes('account suspended')) {
          setError('root', {
            type: 'manual',
            message: 'Your account has been suspended. Please contact support.',
          });
        } else {
          setError('root', {
            type: 'manual',
            message: result.error || 'Login failed. Please try again.',
          });
        }
        
        // Debug logging
        console.log('4b. Final error handling complete');
      }
    } catch (error) {
      console.error('3. Login error:', error);
      
      // Handle network errors
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        setError('root', {
          type: 'manual',
          message: 'Network error. Please check your internet connection and try again.',
        });
      } else if (error.response?.status === 500) {
        setError('root', {
          type: 'manual',
          message: 'Server error. Please try again later.',
        });
      } else {
        setError('root', {
          type: 'manual',
          message: 'An unexpected error occurred. Please try again.',
        });
      }
    } finally {
      setIsSubmitting(false);
      console.log('=== Login Flow Complete ===');
    }
  };

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
                  Welcome Back
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-lg text-gray-300 leading-relaxed"
                >
                  Sign in to your SoloDesk workspace and continue managing your freelance business.
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
                      onFocus={() => clearErrors('email')}
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
                      onClick={() => clearErrors('email')}
                      className="text-red-400 text-sm cursor-pointer hover:text-red-300 transition-colors"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                      placeholder="Password"
                      onFocus={() => clearErrors('password')}
                      className={cn(
                        'w-full pl-12 pr-12 py-4 bg-gray-800/50 backdrop-blur-sm border rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:border-gray-400/50 transition-all duration-300',
                        errors.password ? 'border-red-400' : 'border-gray-600'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => clearErrors('password')}
                      className="text-red-400 text-sm cursor-pointer hover:text-red-300 transition-colors"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </div>

                {/* Remember me and forgot password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      {...register('rememberMe')}
                      className="h-4 w-4 rounded border-gray-600 text-gray-400 focus:ring-gray-400/50 bg-gray-800/50"
                    />
                    <span className="text-sm text-gray-300">Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-300"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Root error */}
                {errors.root && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="relative p-3 rounded-lg bg-red-400/10 border border-red-400/20 group"
                  >
                    <button
                      onClick={() => setError('root', { type: 'manual', message: '' })}
                      className="absolute top-2 right-2 text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p className="text-sm text-red-400 pr-6">{errors.root.message}</p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gray-600 text-gray-100 font-semibold py-4 px-6 rounded-xl hover:bg-gray-500 hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-gray-100 border-t-transparent rounded-full"
                      />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>

                {/* Sign Up Link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                  className="text-center"
                >
                  <p className="text-gray-300">
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="text-gray-400 hover:text-gray-300 font-medium transition-colors duration-300 hover:underline"
                    >
                      Create Account
                    </Link>
                  </p>
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

export default Login; 