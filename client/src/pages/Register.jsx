import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Users,
  CreditCard,
  Palette,
  Building
} from 'lucide-react';
import Button from '../components/Button';

import { cn } from '../utils/cn';
import logo from '../assets/logo_light.png';

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm();

  const password = watch('password');

  // Loading animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);



  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Prepare payload for backend (exclude confirmPassword)
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        // Only include phone if provided
        ...(data.phone ? { phone: data.phone } : {})
      };
      const result = await registerUser(payload);
      if (result.success) {
        // Show success message and redirect to login page after successful registration
        toast.success('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Handle specific error cases
        const errorMessage = result.error?.toLowerCase() || '';
        
        if (errorMessage.includes('email already exists') || errorMessage.includes('user already exists')) {
          setError('email', {
            type: 'manual',
            message: 'An account with this email already exists. Please sign in instead.',
          });
          
          // Show a toast notification and redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else if (errorMessage.includes('invalid email')) {
          setError('email', {
            type: 'manual',
            message: 'Please enter a valid email address.',
          });
        } else if (errorMessage.includes('password too weak') || errorMessage.includes('password requirements')) {
          setError('password', {
            type: 'manual',
            message: 'Password must be at least 8 characters long and contain letters and numbers.',
          });
        } else if (errorMessage.includes('first name') || errorMessage.includes('last name')) {
          if (errorMessage.includes('first name')) {
            setError('firstName', {
              type: 'manual',
              message: 'Please enter a valid first name.',
            });
          } else {
            setError('lastName', {
              type: 'manual',
              message: 'Please enter a valid last name.',
            });
          }
        } else if (errorMessage.includes('phone number')) {
          setError('phone', {
            type: 'manual',
            message: 'Please enter a valid phone number.',
          });
        } else {
          setError('root', {
            type: 'manual',
            message: result.error || 'Registration failed. Please try again.',
          });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      
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
    }
  };

  const features = [
    {
      icon: <Users className="h-5 w-5" />,
      text: "All-in-one workspace"
    },
    {
      icon: <Palette className="h-5 w-5" />,
      text: "Client-friendly interface"
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      text: "Stunning branded invoices"
    }
  ];

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-800 to-gray-700 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-gray-600"
          >
            <Sparkles className="h-8 w-8 text-gray-100" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-2xl font-semibold text-gray-100 mb-2"
          >
            Welcome to SoloDesk
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-gray-300"
          >
            Setting up your workspace...
          </motion.p>
        </motion.div>
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
            
            {/* Form Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-4xl lg:text-5xl font-bold text-gray-100 leading-tight"
                >
                  Welcome to your business, beautifully organized.
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-lg text-gray-300 leading-relaxed"
                >
                  Join thousands of freelancers who manage clients, projects, and payments — all in one place.
                </motion.p>
              </div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="space-y-3"
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
                {/* Name fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                      <input
                        type="text"
                        {...register('firstName', {
                          required: 'First name is required',
                          minLength: {
                            value: 2,
                            message: 'First name must be at least 2 characters',
                          },
                        })}
                        placeholder="First Name"
                        className={cn(
                          'w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:border-gray-400/50 transition-all duration-300',
                          errors.firstName ? 'border-red-400' : 'border-gray-600'
                        )}
                        onFocus={() => clearErrors('firstName')}
                      />
                    </div>
                    {errors.firstName && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => clearErrors('firstName')}
                        className="text-red-400 text-sm cursor-pointer hover:text-red-300 transition-colors"
                      >
                        {errors.firstName.message}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                      <input
                        type="text"
                        {...register('lastName', {
                          required: 'Last name is required',
                          minLength: {
                            value: 2,
                            message: 'Last name must be at least 2 characters',
                          },
                        })}
                        placeholder="Last Name"
                        className={cn(
                          'w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:border-gray-400/50 transition-all duration-300',
                          errors.lastName ? 'border-red-400' : 'border-gray-600'
                        )}
                        onFocus={() => clearErrors('lastName')}
                      />
                    </div>
                    {errors.lastName && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => clearErrors('lastName')}
                        className="text-red-400 text-sm cursor-pointer hover:text-red-300 transition-colors"
                      >
                        {errors.lastName.message}
                      </motion.p>
                    )}
                  </div>
                </div>

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
                      onFocus={() => clearErrors('email')}
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
                          value: 8,
                          message: 'Password must be at least 8 characters',
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                        },
                      })}
                      placeholder="Password"
                      className={cn(
                        'w-full pl-12 pr-12 py-4 bg-gray-800/50 backdrop-blur-sm border rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:border-gray-400/50 transition-all duration-300',
                        errors.password ? 'border-red-400' : 'border-gray-600'
                      )}
                      onFocus={() => clearErrors('password')}
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

                {/* Confirm Password field */}
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) =>
                          value === password || 'Passwords do not match',
                      })}
                      placeholder="Confirm Password"
                      className={cn(
                        'w-full pl-12 pr-12 py-4 bg-gray-800/50 backdrop-blur-sm border rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:border-gray-400/50 transition-all duration-300',
                        errors.confirmPassword ? 'border-red-400' : 'border-gray-600'
                      )}
                      onFocus={() => clearErrors('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => clearErrors('confirmPassword')}
                      className="text-red-400 text-sm cursor-pointer hover:text-red-300 transition-colors"
                    >
                      {errors.confirmPassword.message}
                    </motion.p>
                  )}
                </div>

                {/* Phone field (optional) */}
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                    <input
                      type="tel"
                      {...register('phone', {
                        pattern: {
                          value: /^\+?[0-9\-\s()]{7,20}$/,
                          message: 'Invalid phone number',
                        },
                      })}
                      placeholder="Phone (optional)"
                      className={cn(
                        'w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:border-gray-400/50 transition-all duration-300',
                        errors.phone ? 'border-red-400' : 'border-gray-600'
                      )}
                      onFocus={() => clearErrors('phone')}
                    />
                  </div>
                  {errors.phone && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => clearErrors('phone')}
                      className="text-red-400 text-sm cursor-pointer hover:text-red-300 transition-colors"
                    >
                      {errors.phone.message}
                    </motion.p>
                  )}
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
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>

                {/* Sign In Link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                  className="text-center"
                >
                  <p className="text-gray-300">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="text-gray-400 hover:text-gray-300 font-medium transition-colors duration-300 hover:underline"
                    >
                      Sign In
                    </Link>
                  </p>
                </motion.div>
              </motion.form>
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
};

export default Register; 