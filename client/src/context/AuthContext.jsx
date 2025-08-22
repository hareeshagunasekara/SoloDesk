import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';
import { isTokenValid } from '../utils/tokenUtils';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('AuthContext: Checking authentication, token exists:', !!token);
      
      if (token) {
        // First validate token format and expiration
        if (!isTokenValid(token)) {
          console.log('AuthContext: Token is invalid or expired, clearing auth data');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({
            type: 'AUTH_FAILURE',
            payload: 'Token is invalid or expired',
          });
          return;
        }
        
        try {
          console.log('AuthContext: Token is valid, validating with server...');
          dispatch({ type: 'AUTH_START' });
          const response = await authAPI.getCurrentUser();
          const { user } = response.data;
          
          console.log('AuthContext: Server validation successful, user:', user.email);
          localStorage.setItem('user', JSON.stringify(user));
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token },
          });
        } catch (error) {
          console.error('AuthContext: Server validation failed:', error.response?.data?.message);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({
            type: 'AUTH_FAILURE',
            payload: error.response?.data?.message || 'Authentication failed',
          });
        }
      } else {
        console.log('AuthContext: No token found, setting as not authenticated');
        dispatch({ type: 'AUTH_FAILURE', payload: null });
      }
    };

    checkAuth();
  }, []);

  // Listen for logout events from API interceptor
  useEffect(() => {
    const handleLogoutEvent = (event) => {
      console.log('Logout event received:', event.detail);
      dispatch({ type: 'LOGOUT' });
    };

    window.addEventListener('auth:logout', handleLogoutEvent);

    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, []);

  const login = async (credentials) => {
    // Remove debug logging since it's no longer needed
    console.log('1. Login function called with credentials:', { email: credentials.email });
    
    try {
      console.log('2. Dispatching AUTH_START...');
      dispatch({ type: 'AUTH_START' });
      
      console.log('3. Making API call to /auth/login...');
      const response = await authAPI.login(credentials);
      console.log('4. API response received:', response.data);
      
      const { user, token } = response.data;
      console.log('5. Extracted user and token from response');
      console.log('6. User data:', user);
      console.log('7. Token exists:', !!token);
      console.log('8. Token preview:', token ? token.substring(0, 50) + '...' : 'none');
      
      console.log('9. Storing token in localStorage...');
      localStorage.setItem('token', token);
      console.log('10. Storing user in localStorage...');
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('11. Dispatching AUTH_SUCCESS...');
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });
      
      console.log('12. Showing success toast...');
      toast.success('Welcome back!');
      
      console.log('13. Returning success result...');
      return { success: true, user };
    } catch (error) {
      console.error('=== AuthContext Login Error ===');
      console.error('Error details:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      
      let errorMessage = 'Login failed';
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.status === 404) {
        errorMessage = 'User not found';
      } else if (error.response?.status === 403) {
        errorMessage = 'Account not verified. Please check your email.';
      } else if (error.response?.status === 423) {
        errorMessage = 'Account suspended. Please contact support.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      console.log('Dispatching AUTH_FAILURE with message:', errorMessage);
      
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage,
      });
      
      // Don't show toast for login errors - let the form handle them
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authAPI.register(userData);
      const { user } = response.data;
      
      // Don't store token or authenticate user after registration
      // Just show success message and return success
      dispatch({
        type: 'AUTH_FAILURE',
        payload: null, // Clear any previous errors
      });
      
      toast.success('Account created successfully! Please log in to continue.');
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed';
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        errorMessage = 'An account with this email already exists';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Invalid registration data';
      } else if (error.response?.status === 422) {
        errorMessage = error.response?.data?.message || 'Validation failed';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage,
      });
      
      // Don't show toast for registration errors - let the form handle them
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await userAPI.updateProfile(data);
      const updatedUser = response.data.user;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch({
        type: 'UPDATE_USER',
        payload: updatedUser,
      });
      
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (data) => {
    try {
      await userAPI.changePassword(data);
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await authAPI.forgotPassword(email);
      toast.success('Password reset email sent');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await authAPI.resetPassword(token, password);
      toast.success('Password reset successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const checkTokenValidity = () => {
    const token = localStorage.getItem('token');
    return token ? isTokenValid(token) : false;
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    clearError,
    checkTokenValidity,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 