import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, updateUserAvatar, updateUserLogo, changePassword, deleteAccount } from '../services/api';
import { toast } from 'react-hot-toast';
import { isTokenValid, isTokenExpiringSoon } from '../utils/tokenUtils';
import '../styles/Profile.css';
import meshBg from '../assets/mesh-bg.png';
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Building, 
  Lock, 
  Eye, 
  EyeOff,
  Camera,
  Save,
  X,
  Trash2,
  Settings,
  CreditCard,
  Clock,
  Bell,
  FileText,
  Users,
  ChevronRight,
  Upload,
  Shield,
  Palette,
  RefreshCw,
  Monitor,
  AlertTriangle
} from 'lucide-react';

const Profile = () => {
  const { user, token, updateProfile, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  /**
   * Formats the last login timestamp into a human-readable relative time string
   * @param {Date|string} lastLoginDate - The timestamp of the last login
   * @returns {string} Human-readable time difference (e.g., "2 hours ago", "Yesterday")
   */
  const formatLastLogin = (lastLoginDate) => {
    if (!lastLoginDate) return 'Never';
    
    const date = new Date(lastLoginDate);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };
  const [showClientPreviewModal, setShowClientPreviewModal] = useState(false);

  /**
   * Tracks unsaved changes across different profile sections to enable
   * section-specific save buttons and prevent data loss
   */
  const [unsavedChanges, setUnsavedChanges] = useState({
    profile: false,
    logoSocials: false,
    preferences: false,
    security: false
  });

  /**
   * Tracks which form fields are currently in edit mode for inline editing
   */
  const [editingFields, setEditingFields] = useState({});

  /**
   * Main form state containing all user profile data including
   * personal info, business details, social links, and preferences
   */
  const [formData, setFormData] = useState({
    profilePicture: '',
    businessLogo: '',
    fullName: '',
    businessName: '',
    email: '',
    phone: '',
    website: '',
    bio: '',
    freelancerType: '',
    address: '',
    country: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      instagram: '',
      facebook: '',
      website: ''
    },
    preferences: {
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      invoicePrefix: 'INV',
      paymentTerms: 30,
      serviceRate: 100,
      autoReminders: true
    }
  });

  /**
   * State for password change modal form data
   */
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  /**
   * Navigation tabs configuration for the profile settings interface
   * Each tab represents a different section of user preferences
   */
  const tabs = [
    {
      id: 'profile',
      title: 'Profile & Business',
      subtitle: 'Personal & company info',
      icon: User,
      color: 'from-gray-600 to-gray-700'
    },
    {
      id: 'logo-socials',
      title: 'Logo & Socials',
      subtitle: 'Brand identity & social links',
      icon: Palette,
      color: 'from-gray-600 to-gray-700'
    },
    {
      id: 'preferences',
      title: 'Business Preferences',
      subtitle: 'Currency, rates & settings',
      icon: Settings,
      color: 'from-gray-600 to-gray-700'
    },
    {
      id: 'security',
      title: 'Security',
      subtitle: 'Password & account safety',
      icon: Shield,
      color: 'from-gray-600 to-gray-700'
    },
    {
      id: 'previews',
      title: 'Client Previews',
      subtitle: 'How clients see your info',
      icon: Monitor,
      color: 'from-gray-600 to-gray-700'
    }
  ];

  /**
   * Determines if the component is ready to fetch user profile data
   * Ensures both token validity and authentication state are ready
   * @returns {boolean} True if ready to fetch, false otherwise
   */
  const isReadyToFetch = () => {
    const tokenValid = token && isTokenValid(token);
    const authReady = !authLoading && isAuthenticated;
    return tokenValid && authReady;
  };

  /**
   * React Query hook for fetching user profile data with automatic
   * retry logic and error handling for token expiration
   */
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      if (!isTokenValid(token)) {
        throw new Error('Token is invalid or expired');
      }
      
      const result = await getUserProfile();
      return result.data;
    },
    enabled: isReadyToFetch(),
    retry: (failureCount, error) => {
      // Don't retry if token is invalid
      if (error.message === 'Token is invalid or expired') {
        return false;
      }
      
      return failureCount < 2;
    },
    onSuccess: (response) => {
      const data = response.data;
      
      // Populate form with fetched user profile data
      if (data && data.user) {
        const userData = data.user;
      
      setFormData(prev => ({
        ...prev,
        profilePicture: userData?.avatar || '',
        businessLogo: userData?.logo || '',
        fullName: userData?.fullName || `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim(),
        businessName: userData?.businessName || '',
        email: userData?.email || '',
        phone: userData?.phone || '',
        website: userData?.website || '',
        bio: userData?.bio || '',
        freelancerType: userData?.freelancerType || '',
        address: formatAddress(userData?.address) || '',
        country: userData?.country || '',
        socialLinks: {
          linkedin: userData?.socialLinks?.linkedin || '',
          twitter: userData?.socialLinks?.twitter || '',
          instagram: userData?.socialLinks?.instagram || '',
          facebook: userData?.socialLinks?.facebook || '',
          website: userData?.socialLinks?.website || ''
        },
        preferences: {
          currency: userData?.preferredCurrency || 'USD',
          dateFormat: userData?.dateFormat || 'MM/DD/YYYY',
          timeFormat: userData?.timeFormat || '12h',
          invoicePrefix: userData?.invoicePrefix || 'INV',
          paymentTerms: userData?.paymentTerms || '30',
          serviceRate: typeof userData?.defaultServiceRate === 'number' ? userData.defaultServiceRate : 100,
          autoReminders: typeof userData?.autoReminders === 'boolean' ? userData.autoReminders : true
        }
              }));
      } else {
        // No user data found in response
      }
    },
    onError: (error) => {
      // If token is invalid, redirect to login
      if (error.message === 'Token is invalid or expired' || error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        logout();
      }
    }
  });

  /**
   * Mutation for updating user profile information
   * Handles success/error states and invalidates cached profile data
   */
  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      toast.success('Profile updated successfully!');
      updateProfile(data.user);
      setHasChanges(false);
      queryClient.invalidateQueries(['userProfile']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  /**
   * Mutation for changing user password with validation
   */
  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  });

  /**
   * Mutation for updating user profile picture/avatar
   */
  const updateAvatarMutation = useMutation({
    mutationFn: updateUserAvatar,
    onSuccess: (data) => {
      toast.success('Avatar updated successfully!');
      updateProfile(data.user);
      queryClient.invalidateQueries(['userProfile']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update avatar');
    }
  });

  /**
   * Mutation for updating business logo
   */
  const updateLogoMutation = useMutation({
    mutationFn: updateUserLogo,
    onSuccess: (data) => {
      toast.success('Logo updated successfully!');
      updateProfile(data.user);
      queryClient.invalidateQueries(['userProfile']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update logo');
    }
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      toast.success('Account deleted successfully');
      logout();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  });







  /**
   * Authentication guard effect - redirects to login if user is not authenticated
   * or if token is invalid/expired. Also warns users about expiring sessions.
   */
  useEffect(() => {
    if (!token && !authLoading) {
      window.location.href = '/login';
      return;
    }

    if (token && !isTokenValid(token)) {
      window.location.href = '/login';
      return;
    }

    if (token && isTokenExpiringSoon(token, 5)) {
      toast.warning('Your session will expire soon. Please save your work.');
    }

    if (!isAuthenticated && !authLoading) {
      window.location.href = '/login';
      return;
    }
  }, [token, isAuthenticated, authLoading]);

  /**
   * Periodic token validation to ensure session security
   * Checks token validity every minute and handles expiration gracefully
   */
  useEffect(() => {
    if (!token || authLoading) {
      return;
    }

    const interval = setInterval(() => {
      if (!isTokenValid(token)) {
        window.location.href = '/login';
      } else if (isTokenExpiringSoon(token, 2)) {
        toast.error('Your session is about to expire! Please save your work immediately.');
      }
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [token, authLoading]);

    /**
   * Initializes form data when profile data is loaded from API or AuthContext
   * Handles both successful API responses and fallback to cached user data
   */
  useEffect(() => {
    const defaultFormData = {
      profilePicture: '',
      businessLogo: '',
      fullName: '',
      businessName: '',
      email: '',
      phone: '',
      website: '',
      bio: '',
      freelancerType: '',
      address: '',
      country: '',
      socialLinks: {
        linkedin: '',
        twitter: '',
        instagram: '',
        facebook: ''
      },
      preferences: {
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        invoicePrefix: 'INV',
        paymentTerms: 30,
        serviceRate: 100,
        autoReminders: true
      }
    };
    
          // Use profile data from API if available
      if ((profile?.data?.user && typeof profile.data.user === 'object') || 
          (profile?.user && typeof profile.user === 'object')) {
        const userData = profile?.data?.user || profile?.user;
      console.log('Setting form data with user data from API:', userData);
      setFormData({
        ...defaultFormData,
        profilePicture: safeRender(userData?.avatar) || '',
        businessLogo: safeRender(userData?.logo) || '',
        fullName: safeRender(userData?.fullName) || `${safeRender(userData?.firstName) || ''} ${safeRender(userData?.lastName) || ''}`.trim(),
        businessName: safeRender(userData?.businessName) || '',
        email: safeRender(userData?.email) || '',
        phone: safeRender(userData?.phone) || '',
        website: safeRender(userData?.website) || '',
        bio: safeRender(userData?.bio) || '',
        socialLinks: {
          linkedin: safeRender(userData?.socialLinks?.linkedin) || '',
          twitter: safeRender(userData?.socialLinks?.twitter) || '',
          instagram: safeRender(userData?.socialLinks?.instagram) || '',
          facebook: safeRender(userData?.socialLinks?.facebook) || ''
        },
        preferences: {
          ...defaultFormData.preferences,
          currency: safeRender(userData?.preferredCurrency) || 'USD',
          serviceRate: typeof userData?.defaultServiceRate === 'number' ? userData.defaultServiceRate : 100,
          invoicePrefix: safeRender(userData?.invoicePrefix) || 'INV',
          paymentTerms: safeRender(userData?.paymentTerms) || '30',
          autoReminders: typeof userData?.autoReminders === 'boolean' ? userData.autoReminders : true,
          dateFormat: safeRender(userData?.dateFormat) || 'MM/DD/YYYY',
          timeFormat: safeRender(userData?.timeFormat) || '12h',
        },
        freelancerType: userData?.freelancerType || '',
        address: formatAddress(userData?.address) || '',
        country: safeRender(userData?.country) || ''
      });
    } 
    // Use cached user data as fallback when API data is not available
    else if (user && typeof user === 'object' && !profile) {
      console.log('Using user data from AuthContext as fallback:', user);
      setFormData({
        ...defaultFormData,
        profilePicture: safeRender(user?.avatar) || '',
        businessLogo: safeRender(user?.logo) || '',
        fullName: safeRender(user?.fullName) || `${safeRender(user?.firstName) || ''} ${safeRender(user?.lastName) || ''}`.trim(),
        businessName: safeRender(user?.businessName) || '',
        email: safeRender(user?.email) || '',
        phone: safeRender(user?.phone) || '',
        website: safeRender(user?.website) || '',
        bio: safeRender(user?.bio) || '',
        socialLinks: {
          linkedin: safeRender(user?.socialLinks?.linkedin) || '',
          twitter: safeRender(user?.socialLinks?.twitter) || '',
          instagram: safeRender(user?.socialLinks?.instagram) || '',
          facebook: safeRender(user?.socialLinks?.facebook) || ''
        },
        preferences: {
          ...defaultFormData.preferences,
          currency: safeRender(user?.preferredCurrency) || 'USD',
          serviceRate: typeof user?.defaultServiceRate === 'number' ? user.defaultServiceRate : 100,
          invoicePrefix: safeRender(user?.invoicePrefix) || 'INV',
          paymentTerms: safeRender(user?.paymentTerms) || '30',
          autoReminders: typeof user?.autoReminders === 'boolean' ? user.autoReminders : true,
          dateFormat: safeRender(user?.dateFormat) || 'MM/DD/YYYY',
          timeFormat: safeRender(user?.timeFormat) || '12h',
        },
        freelancerType: user?.freelancerType || '',
        address: formatAddress(user?.address) || '',
        country: safeRender(user?.country) || ''
      });
    } else if (profile && !profile.user) {
      // Profile data structure issue
    }
  }, [profile, user]);

  /**
   * Safely renders form values by handling null, undefined, and object types
   * Prevents rendering errors when displaying form data
   * @param {any} value - The value to render
   * @returns {string} Safe string representation of the value
   */
  const safeRender = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return '';
    if (typeof value === 'string' || typeof value === 'number') return value;
    return String(value);
  };

  /**
   * Converts address object to displayable string format
   * Handles both string addresses and structured address objects
   * @param {string|object} address - Address as string or object with street, city, state, etc.
   * @returns {string} Formatted address string
   */
  const formatAddress = (address) => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    if (typeof address === 'object') {
      const parts = [];
      if (address.street) parts.push(address.street);
      if (address.city) parts.push(address.city);
      if (address.state) parts.push(address.state);
      if (address.zipCode) parts.push(address.zipCode);
      if (address.country) parts.push(address.country);
      return parts.join(', ');
    }
    return '';
  };

  /**
   * Updates form data and marks the current section as having unsaved changes
   * @param {string} field - The field name to update
   * @param {any} value - The new value for the field
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
    setUnsavedChanges(prev => ({ ...prev, [activeTab]: true }));
  };

  /**
   * Updates social media links and marks the logo-socials section as changed
   * @param {string} platform - The social platform (linkedin, twitter, etc.)
   * @param {string} value - The URL value
   */
  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
    setHasChanges(true);
    setUnsavedChanges(prev => ({ ...prev, logoSocials: true }));
  };

  /**
   * Updates business preferences and marks the preferences section as changed
   * @param {string} field - The preference field name
   * @param {any} value - The new preference value
   */
  const handlePreferenceChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
    setHasChanges(true);
    setUnsavedChanges(prev => ({ ...prev, preferences: true }));
  };

  /**
   * Enables inline editing mode for a specific field
   * @param {string} fieldName - The field to enable editing for
   */
  const handleDoubleClick = (fieldName) => {
    setEditingFields(prev => ({ ...prev, [fieldName]: true }));
  };

  /**
   * Disables inline editing mode for a specific field
   * @param {string} fieldName - The field to disable editing for
   */
  const handleFieldBlur = (fieldName) => {
    setEditingFields(prev => ({ ...prev, [fieldName]: false }));
  };

  /**
   * Saves changes for a specific profile section with validation
   * Validates URLs, business preferences, and other section-specific requirements
   * @param {string} section - The section to save (profile, logoSocials, preferences, security)
   */
  const handleSaveSection = (section) => {
      // Validate social media URLs and website for logo-socials section
      if (section === 'logoSocials') {
        if (formData.socialLinks?.linkedin && !formData.socialLinks.linkedin.startsWith('https://')) {
          toast.error('LinkedIn URL must start with https://');
          return;
        }
        
        // Validate all social media URLs for proper HTTPS format
        const urlFields = ['twitter', 'instagram', 'facebook'];
        for (const field of urlFields) {
          const value = formData.socialLinks?.[field];
          if (value && !value.startsWith('https://')) {
            toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} URL must start with https://`);
            return;
          }
        }
        
        // Validate business website URL
        if (formData.website && !formData.website.startsWith('https://')) {
          toast.error('Website URL must start with https://');
          return;
        }
      }

      // Validate business preferences for preferences section
      if (section === 'preferences') {
        // Ensure hourly rate is set and valid
        if (!formData.preferences?.serviceRate || formData.preferences.serviceRate <= 0) {
          toast.error('Hourly rate is required and must be greater than 0');
          return;
        }
        
        // Ensure currency is selected
        if (!formData.preferences?.currency) {
          toast.error('Please select a currency');
          return;
        }
      }

    updateProfileMutation.mutate({
      fullName: formData.fullName,
      businessName: formData.businessName,
      phone: formData.phone,
      website: formData.website,
      bio: formData.bio,
      freelancerType: formData.freelancerType,
      address: formData.address,
      country: formData.country,
      socialLinks: formData.socialLinks || {},
      preferredCurrency: formData.preferences?.currency || 'USD',
        defaultServiceRate: formData.preferences?.serviceRate || 100,
        invoicePrefix: formData.preferences?.invoicePrefix || 'INV',
        paymentTerms: formData.preferences?.paymentTerms || '30',
        autoReminders: formData.preferences?.autoReminders !== undefined ? formData.preferences.autoReminders : true,
        dateFormat: formData.preferences?.dateFormat || 'MM/DD/YYYY',
        timeFormat: formData.preferences?.timeFormat || '12h'
    });
    setUnsavedChanges(prev => ({ ...prev, [section]: false }));
  };

  /**
   * Saves all unsaved changes across all profile sections
   * Triggers the profile update mutation with current form data
   */
  const handleSave = () => {
    updateProfileMutation.mutate({
      fullName: formData.fullName,
      businessName: formData.businessName,
      phone: formData.phone,
      website: formData.website,
      bio: formData.bio,
      freelancerType: formData.freelancerType,
      address: formData.address,
      country: formData.country,
      socialLinks: formData.socialLinks || {},
      preferredCurrency: formData.preferences?.currency || 'USD',
      defaultServiceRate: formData.preferences?.serviceRate || 100,
      invoicePrefix: formData.preferences?.invoicePrefix || 'INV',
      paymentTerms: formData.preferences?.paymentTerms || '30',
      autoReminders: formData.preferences?.autoReminders !== undefined ? formData.preferences.autoReminders : true,
      dateFormat: formData.preferences?.dateFormat || 'MM/DD/YYYY',
      timeFormat: formData.preferences?.timeFormat || '12h'
    });
    setUnsavedChanges({
      profile: false,
      logoSocials: false,
      preferences: false,
      security: false
    });
  };

  /**
   * Cancels all unsaved changes and resets form data to original values
   * Clears all editing states and unsaved change flags
   */
  const handleCancel = () => {
    // Reset form data to original values from API response
    if (profile?.user && typeof profile.user === 'object') {
      const userData = profile.user;
      setFormData({
        profilePicture: userData?.avatar || '',
        businessLogo: userData?.logo || '',
        fullName: userData?.fullName || `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim(),
        businessName: userData?.businessName || '',
        email: userData?.email || '',
        phone: userData?.phone || '',
        website: userData?.website || '',
        bio: userData?.bio || '',
        freelancerType: userData?.freelancerType || '',
        address: formatAddress(userData?.address) || '',
        country: userData?.country || '',
        socialLinks: {
          linkedin: userData?.socialLinks?.linkedin || '',
          twitter: userData?.socialLinks?.twitter || '',
          instagram: userData?.socialLinks?.instagram || '',
          facebook: userData?.socialLinks?.facebook || '',
          website: userData?.socialLinks?.website || ''
        },
        preferences: {
          currency: userData?.preferredCurrency || 'USD',
          dateFormat: userData?.dateFormat || 'MM/DD/YYYY',
          timeFormat: userData?.timeFormat || '12h',
          invoicePrefix: userData?.invoicePrefix || 'INV',
          paymentTerms: userData?.paymentTerms || '30',
          serviceRate: userData?.defaultServiceRate || 100,
          autoReminders: typeof userData?.autoReminders === 'boolean' ? userData.autoReminders : true
        }
      });
    }
    setHasChanges(false);
    setUnsavedChanges({
      profile: false,
      logoSocials: false,
      preferences: false,
      security: false
    });
    setEditingFields({});
  };

  /**
   * Handles password change with comprehensive validation
   * Validates password length, confirmation match, and current password requirement
   */
  const handlePasswordChange = () => {
    // Ensure new password meets minimum security requirements
    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    
    // Verify password confirmation matches
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    // Ensure current password is provided for security
    if (!passwordData.currentPassword) {
      toast.error('Current password is required');
      return;
    }
    
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  /**
   * Handles account deletion with confirmation validation
   * Requires explicit "DELETE" confirmation to prevent accidental deletions
   */
  const handleAccountDeletion = () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type "DELETE" to confirm account deletion');
      return;
    }
    
    deleteAccountMutation.mutate({ password: deleteConfirmation });
    setShowDeleteModal(false);
    setDeleteConfirmation('');
  };

  /**
   * Handles file uploads for profile pictures and business logos
   * Converts files to base64 and triggers appropriate update mutations
   * @param {string} type - The upload type ('avatar' or 'logo')
   * @param {File} file - The file to upload
   */
  const handleFileUpload = (type, file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = e.target.result;
      
      if (type === 'avatar') {
        setFormData(prev => ({ ...prev, profilePicture: fileData }));
        updateAvatarMutation.mutate({ avatar: fileData });
      } else if (type === 'logo') {
        setFormData(prev => ({ ...prev, businessLogo: fileData }));
        updateLogoMutation.mutate({ logo: fileData });
      }
      setHasChanges(true);
      setUnsavedChanges(prev => ({ ...prev, [activeTab]: true }));
    };
    reader.readAsDataURL(file);
  };

  // Display loading state during authentication check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-700 text-lg mb-4">You need to be logged in to view your profile.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <p className="loading-text">Failed to load profile</p>
          <button 
            onClick={() => window.location.reload()}
            className="save-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Prevent rendering without user data
  if (!user && !profile) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <p className="loading-text">Loading user data...</p>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }



  // Validate form data structure before rendering
  if (!formData || typeof formData !== 'object') {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <p className="loading-text">Initializing form data...</p>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  // Ensure required nested objects exist with default values
  if (!formData.socialLinks || typeof formData.socialLinks !== 'object') {
    formData.socialLinks = { linkedin: '', twitter: '', instagram: '', facebook: '', website: '' };
  }
  
  if (!formData.preferences || typeof formData.preferences !== 'object') {
    formData.preferences = {
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      invoicePrefix: 'INV',
      paymentTerms: 30,
      serviceRate: 100,
      autoReminders: true
    };
  }

  return (
    <div className="profile-container">
      {/* Mesh Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{ backgroundImage: `url(${meshBg})` }}
      />
      
      {/* Content Overlay */}
      <div className="profile-content relative z-10">
        {/* Header */}
        <div className="profile-header">
                      <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
              <p className="text-gray-700 text-lg leading-relaxed">Tailor your SoloDesk experience • update your details, brand your workspace, and fine-tune preferences for a seamless, professional setup.</p>
            </div>
        </div>
          


        {/* Tab Navigation */}
        <div className="tab-container">
          <div className="tab-nav">
            {Array.isArray(tabs) && tabs.map((tab) => {
              if (!tab || typeof tab !== 'object') {
                console.error('Invalid tab:', tab);
                return null;
              }
              const IconComponent = tab.icon;
              console.log('Tab:', tab.id, 'Icon:', IconComponent, 'Type:', typeof IconComponent, 'IsFunction:', typeof IconComponent === 'function', 'IsComponent:', typeof IconComponent === 'object');
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-button transition-all duration-200 ease-in-out ${
                    isActive 
                      ? 'bg-gradient-to-r from-gray-600 to-gray-700 shadow-lg scale-105' 
                      : 'bg-white/80 hover:bg-white hover:shadow-md hover:scale-102 border border-gray-200'
                  }`}
                >
                  {/* Glow effect for active tab */}
                  {isActive && <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl opacity-20 blur-sm"></div>}
                  
                  {/* Background glow */}
                  {isActive && <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl opacity-10"></div>}
                  
                  {/* Content */}
                  <div className="tab-content relative z-10">
                    <div className="tab-icon-container">
                      {IconComponent && (typeof IconComponent === 'function' || typeof IconComponent === 'object') ? (
                        React.createElement(IconComponent, { 
                          className: `tab-icon transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`, 
                          size: 24 
                        })
                      ) : (
                        <div className="tab-icon text-red-500 text-2xl">❌</div>
                      )}
                    </div>
                    <div className="tab-text">
                      <div className={`tab-title transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-800 hover:text-gray-900'}`}>
                        {tab.title || 'Tab'}
                      </div>
                      <div className={`tab-subtitle transition-colors duration-200 ${isActive ? 'text-white/80' : 'text-gray-600 hover:text-gray-700'}`}>
                        {tab.subtitle || 'Description'}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content-container">
          {/* Tab 1: Profile & Business Info */}
          {activeTab === 'profile' && (
            <div className="tab-section">
              {/* Section Header with Save Button */}
              <div className="section-header">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h3>
                {unsavedChanges.profile && (
                  <button
                    onClick={() => handleSaveSection('profile')}
                    disabled={updateProfileMutation.isLoading}
                    className="save-button"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                )}
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Full Name</label>
                  <div 
                    className="form-input-container"
                    onDoubleClick={() => handleDoubleClick('fullName')}
                  >
                    {editingFields.fullName ? (
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        onBlur={() => handleFieldBlur('fullName')}
                        className="form-input"
                        placeholder="Enter your full name"
                        autoFocus
                      />
                    ) : (
                      <div className="form-display">
                        {safeRender(formData.fullName) || 'Double-click to edit'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Business Name</label>
                  <div 
                    className="form-input-container"
                    onDoubleClick={() => handleDoubleClick('businessName')}
                  >
                    {editingFields.businessName ? (
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        onBlur={() => handleFieldBlur('businessName')}
                        className="form-input"
                        placeholder="Enter business name"
                        autoFocus
                      />
                    ) : (
                      <div className="form-display">
                        {safeRender(formData.businessName) || 'Double-click to edit'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="form-input disabled"
                    placeholder="Email (cannot be changed)"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Phone Number</label>
                  <div 
                    className="form-input-container"
                    onDoubleClick={() => handleDoubleClick('phone')}
                  >
                    {editingFields.phone ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        onBlur={() => handleFieldBlur('phone')}
                        className="form-input"
                        placeholder="Enter phone number"
                        autoFocus
                      />
                    ) : (
                      <div className="form-display">
                        {safeRender(formData.phone) || 'Double-click to edit'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Freelancer Type</label>
                  <div 
                    className="form-input-container"
                    onDoubleClick={() => handleDoubleClick('freelancerType')}
                  >
                    {editingFields.freelancerType ? (
                      <input
                        type="text"
                        value={formData.freelancerType}
                        onChange={(e) => handleInputChange('freelancerType', e.target.value)}
                        onBlur={() => handleFieldBlur('freelancerType')}
                        className="form-input"
                        placeholder="Add your role"
                        autoFocus
                      />
                    ) : (
                      <div className="form-display" id="freelancer-type-display">
                        {formData.freelancerType || 'Double-click to edit'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Country</label>
                  <div 
                    className="form-input-container"
                    onDoubleClick={() => handleDoubleClick('country')}
                  >
                    {editingFields.country ? (
                      <select
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        onBlur={() => handleFieldBlur('country')}
                        className="form-select"
                        autoFocus
                      >
                        <option value="">Select country</option>
                        <option value="Afghanistan">Afghanistan</option>
                        <option value="Albania">Albania</option>
                        <option value="Algeria">Algeria</option>
                        <option value="Andorra">Andorra</option>
                        <option value="Angola">Angola</option>
                        <option value="Antigua and Barbuda">Antigua and Barbuda</option>
                        <option value="Argentina">Argentina</option>
                        <option value="Armenia">Armenia</option>
                        <option value="Australia">Australia</option>
                        <option value="Austria">Austria</option>
                        <option value="Azerbaijan">Azerbaijan</option>
                        <option value="Bahamas">Bahamas</option>
                        <option value="Bahrain">Bahrain</option>
                        <option value="Bangladesh">Bangladesh</option>
                        <option value="Barbados">Barbados</option>
                        <option value="Belarus">Belarus</option>
                        <option value="Belgium">Belgium</option>
                        <option value="Belize">Belize</option>
                        <option value="Benin">Benin</option>
                        <option value="Bhutan">Bhutan</option>
                        <option value="Bolivia">Bolivia</option>
                        <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                        <option value="Botswana">Botswana</option>
                        <option value="Brazil">Brazil</option>
                        <option value="Brunei">Brunei</option>
                        <option value="Bulgaria">Bulgaria</option>
                        <option value="Burkina Faso">Burkina Faso</option>
                        <option value="Burundi">Burundi</option>
                        <option value="Cabo Verde">Cabo Verde</option>
                        <option value="Cambodia">Cambodia</option>
                        <option value="Cameroon">Cameroon</option>
                        <option value="Canada">Canada</option>
                        <option value="Central African Republic">Central African Republic</option>
                        <option value="Chad">Chad</option>
                        <option value="Chile">Chile</option>
                        <option value="China">China</option>
                        <option value="Colombia">Colombia</option>
                        <option value="Comoros">Comoros</option>
                        <option value="Congo">Congo</option>
                        <option value="Costa Rica">Costa Rica</option>
                        <option value="Croatia">Croatia</option>
                        <option value="Cuba">Cuba</option>
                        <option value="Cyprus">Cyprus</option>
                        <option value="Czech Republic">Czech Republic</option>
                        <option value="Democratic Republic of the Congo">Democratic Republic of the Congo</option>
                        <option value="Denmark">Denmark</option>
                        <option value="Djibouti">Djibouti</option>
                        <option value="Dominica">Dominica</option>
                        <option value="Dominican Republic">Dominican Republic</option>
                        <option value="East Timor">East Timor</option>
                        <option value="Ecuador">Ecuador</option>
                        <option value="Egypt">Egypt</option>
                        <option value="El Salvador">El Salvador</option>
                        <option value="Equatorial Guinea">Equatorial Guinea</option>
                        <option value="Eritrea">Eritrea</option>
                        <option value="Estonia">Estonia</option>
                        <option value="Eswatini">Eswatini</option>
                        <option value="Ethiopia">Ethiopia</option>
                        <option value="Fiji">Fiji</option>
                        <option value="Finland">Finland</option>
                        <option value="France">France</option>
                        <option value="Gabon">Gabon</option>
                        <option value="Gambia">Gambia</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Germany">Germany</option>
                        <option value="Ghana">Ghana</option>
                        <option value="Greece">Greece</option>
                        <option value="Grenada">Grenada</option>
                        <option value="Guatemala">Guatemala</option>
                        <option value="Guinea">Guinea</option>
                        <option value="Guinea-Bissau">Guinea-Bissau</option>
                        <option value="Guyana">Guyana</option>
                        <option value="Haiti">Haiti</option>
                        <option value="Honduras">Honduras</option>
                        <option value="Hungary">Hungary</option>
                        <option value="Iceland">Iceland</option>
                        <option value="India">India</option>
                        <option value="Indonesia">Indonesia</option>
                        <option value="Iran">Iran</option>
                        <option value="Iraq">Iraq</option>
                        <option value="Ireland">Ireland</option>
                        <option value="Israel">Israel</option>
                        <option value="Italy">Italy</option>
                        <option value="Ivory Coast">Ivory Coast</option>
                        <option value="Jamaica">Jamaica</option>
                        <option value="Japan">Japan</option>
                        <option value="Jordan">Jordan</option>
                        <option value="Kazakhstan">Kazakhstan</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Kiribati">Kiribati</option>
                        <option value="Kuwait">Kuwait</option>
                        <option value="Kyrgyzstan">Kyrgyzstan</option>
                        <option value="Laos">Laos</option>
                        <option value="Latvia">Latvia</option>
                        <option value="Lebanon">Lebanon</option>
                        <option value="Lesotho">Lesotho</option>
                        <option value="Liberia">Liberia</option>
                        <option value="Libya">Libya</option>
                        <option value="Liechtenstein">Liechtenstein</option>
                        <option value="Lithuania">Lithuania</option>
                        <option value="Luxembourg">Luxembourg</option>
                        <option value="Madagascar">Madagascar</option>
                        <option value="Malawi">Malawi</option>
                        <option value="Malaysia">Malaysia</option>
                        <option value="Maldives">Maldives</option>
                        <option value="Mali">Mali</option>
                        <option value="Malta">Malta</option>
                        <option value="Marshall Islands">Marshall Islands</option>
                        <option value="Mauritania">Mauritania</option>
                        <option value="Mauritius">Mauritius</option>
                        <option value="Mexico">Mexico</option>
                        <option value="Micronesia">Micronesia</option>
                        <option value="Moldova">Moldova</option>
                        <option value="Monaco">Monaco</option>
                        <option value="Mongolia">Mongolia</option>
                        <option value="Montenegro">Montenegro</option>
                        <option value="Morocco">Morocco</option>
                        <option value="Mozambique">Mozambique</option>
                        <option value="Myanmar">Myanmar</option>
                        <option value="Namibia">Namibia</option>
                        <option value="Nauru">Nauru</option>
                        <option value="Nepal">Nepal</option>
                        <option value="Netherlands">Netherlands</option>
                        <option value="New Zealand">New Zealand</option>
                        <option value="Nicaragua">Nicaragua</option>
                        <option value="Niger">Niger</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="North Korea">North Korea</option>
                        <option value="North Macedonia">North Macedonia</option>
                        <option value="Norway">Norway</option>
                        <option value="Oman">Oman</option>
                        <option value="Pakistan">Pakistan</option>
                        <option value="Palau">Palau</option>
                        <option value="Palestine">Palestine</option>
                        <option value="Panama">Panama</option>
                        <option value="Papua New Guinea">Papua New Guinea</option>
                        <option value="Paraguay">Paraguay</option>
                        <option value="Peru">Peru</option>
                        <option value="Philippines">Philippines</option>
                        <option value="Poland">Poland</option>
                        <option value="Portugal">Portugal</option>
                        <option value="Qatar">Qatar</option>
                        <option value="Romania">Romania</option>
                        <option value="Russia">Russia</option>
                        <option value="Rwanda">Rwanda</option>
                        <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                        <option value="Saint Lucia">Saint Lucia</option>
                        <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                        <option value="Samoa">Samoa</option>
                        <option value="San Marino">San Marino</option>
                        <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                        <option value="Saudi Arabia">Saudi Arabia</option>
                        <option value="Senegal">Senegal</option>
                        <option value="Serbia">Serbia</option>
                        <option value="Seychelles">Seychelles</option>
                        <option value="Sierra Leone">Sierra Leone</option>
                        <option value="Singapore">Singapore</option>
                        <option value="Slovakia">Slovakia</option>
                        <option value="Slovenia">Slovenia</option>
                        <option value="Solomon Islands">Solomon Islands</option>
                        <option value="Somalia">Somalia</option>
                        <option value="South Africa">South Africa</option>
                        <option value="South Korea">South Korea</option>
                        <option value="South Sudan">South Sudan</option>
                        <option value="Spain">Spain</option>
                        <option value="Sri Lanka">Sri Lanka</option>
                        <option value="Sudan">Sudan</option>
                        <option value="Suriname">Suriname</option>
                        <option value="Sweden">Sweden</option>
                        <option value="Switzerland">Switzerland</option>
                        <option value="Syria">Syria</option>
                        <option value="Taiwan">Taiwan</option>
                        <option value="Tajikistan">Tajikistan</option>
                        <option value="Tanzania">Tanzania</option>
                        <option value="Thailand">Thailand</option>
                        <option value="Togo">Togo</option>
                        <option value="Tonga">Tonga</option>
                        <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                        <option value="Tunisia">Tunisia</option>
                        <option value="Turkey">Turkey</option>
                        <option value="Turkmenistan">Turkmenistan</option>
                        <option value="Tuvalu">Tuvalu</option>
                        <option value="Uganda">Uganda</option>
                        <option value="Ukraine">Ukraine</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="United States">United States</option>
                        <option value="Uruguay">Uruguay</option>
                        <option value="Uzbekistan">Uzbekistan</option>
                        <option value="Vanuatu">Vanuatu</option>
                        <option value="Vatican City">Vatican City</option>
                        <option value="Venezuela">Venezuela</option>
                        <option value="Vietnam">Vietnam</option>
                        <option value="Yemen">Yemen</option>
                        <option value="Zambia">Zambia</option>
                        <option value="Zimbabwe">Zimbabwe</option>
                      </select>
                    ) : (
                      <div className="form-display">
                        {safeRender(formData.country) || 'Double-click to edit'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Address/Location</label>
                <div 
                  className="form-input-container"
                  onDoubleClick={() => handleDoubleClick('address')}
                >
                  {editingFields.address ? (
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      onBlur={() => handleFieldBlur('address')}
                      className="form-input"
                      placeholder="Enter your address or location"
                      autoFocus
                    />
                  ) : (
                    <div className="form-display">
                                              {safeRender(formData.address) || 'Double-click to edit'}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Bio/Description</label>
                <div 
                  className="form-input-container"
                  onDoubleClick={() => handleDoubleClick('bio')}
                >
                  {editingFields.bio ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      onBlur={() => handleFieldBlur('bio')}
                      rows={4}
                      className="form-textarea"
                      placeholder="Tell clients about yourself and your services"
                      autoFocus
                    />
                  ) : (
                    <div className="form-display textarea">
                                              {safeRender(formData.bio) || 'Double-click to edit'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Business Logo & Social Links */}
          {activeTab === 'logo-socials' && (
            <div className="tab-section">
              {/* Section Header with Save Button */}
              <div className="section-header">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Brand Identity</h3>
                {unsavedChanges.logoSocials && (
                  <button
                    onClick={() => handleSaveSection('logoSocials')}
                    disabled={updateProfileMutation.isLoading}
                    className="save-button"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                )}
              </div>

              <div className="form-grid">
                {/* Profile Picture Upload */}
                <div className="upload-section">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Profile Picture</h4>
                  <div className="upload-container">
                    <div className="upload-image-container">
                      <img
                        src={formData.profilePicture || user?.avatar || '/default-avatar.png'}
                        alt="Profile"
                        className="upload-image"
                      />
                      <label className="upload-button avatar bg-gray-600 hover:bg-gray-700">
                        <Camera className="w-4 h-4 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload('avatar', e.target.files?.[0])}
                          className="upload-input"
                        />
                      </label>
                    </div>
                    <div className="upload-info">
                      <p className="upload-description">Upload a professional photo</p>
                      <p className="upload-hint">Recommended: 400x400px</p>
                    </div>
                  </div>
                </div>

                {/* Business Logo Upload */}
                <div className="upload-section">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Business Logo</h4>
                  <div className="upload-container">
                    <div className="upload-image-container">
                      <img
                        src={formData.businessLogo || '/default-logo.png'}
                        alt="Logo"
                        className="upload-logo"
                      />
                      <label className="upload-button logo bg-gray-600 hover:bg-gray-700">
                        <Building className="w-4 h-4 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload('logo', e.target.files?.[0])}
                          className="upload-input"
                        />
                      </label>
                    </div>
                    <div className="upload-info">
                      <p className="upload-description">Upload your business logo</p>
                      <p className="upload-hint">Recommended: 200x200px</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="upload-section">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Social Media Links</h4>
                <div className="social-grid">
                  <div className="form-field">
                    <label className="form-label">
                      LinkedIn
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <div 
                      className="form-input-container"
                      onDoubleClick={() => handleDoubleClick('linkedin')}
                    >
                      {editingFields.linkedin ? (
                        <input
                          type="url"
                          value={formData.socialLinks?.linkedin || ''}
                          onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                          onBlur={() => handleFieldBlur('linkedin')}
                          className={`form-input ${formData.socialLinks?.linkedin && !formData.socialLinks.linkedin.startsWith('https://') ? 'border-red-400' : ''}`}
                          placeholder="https://linkedin.com/in/..."
                          autoFocus
                        />
                      ) : (
                        <div className="form-display">
                          {safeRender(formData.socialLinks?.linkedin) || 'Double-click to edit'}
                        </div>
                      )}
                    </div>
                    {formData.socialLinks?.linkedin && !formData.socialLinks.linkedin.startsWith('https://') && (
                      <p className="text-red-400 text-xs mt-1">URL must start with https://</p>
                    )}
                  </div>

                  <div className="form-field">
                    <label className="form-label">Twitter/X</label>
                    <div 
                      className="form-input-container"
                      onDoubleClick={() => handleDoubleClick('twitter')}
                    >
                      {editingFields.twitter ? (
                        <input
                          type="url"
                          value={formData.socialLinks?.twitter || ''}
                          onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                          onBlur={() => handleFieldBlur('twitter')}
                          className="form-input"
                          placeholder="https://twitter.com/..."
                          autoFocus
                        />
                      ) : (
                        <div className="form-display">
                          {safeRender(formData.socialLinks?.twitter) || 'Double-click to edit'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Instagram</label>
                    <div 
                      className="form-input-container"
                      onDoubleClick={() => handleDoubleClick('instagram')}
                    >
                      {editingFields.instagram ? (
                        <input
                          type="url"
                          value={formData.socialLinks?.instagram || ''}
                          onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                          onBlur={() => handleFieldBlur('instagram')}
                          className="form-input"
                          placeholder="https://instagram.com/..."
                          autoFocus
                        />
                      ) : (
                        <div className="form-display">
                          {safeRender(formData.socialLinks?.instagram) || 'Double-click to edit'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Facebook</label>
                    <div 
                      className="form-input-container"
                      onDoubleClick={() => handleDoubleClick('facebook')}
                    >
                      {editingFields.facebook ? (
                        <input
                          type="url"
                          value={formData.socialLinks?.facebook || ''}
                          onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                          onBlur={() => handleFieldBlur('facebook')}
                          className="form-input"
                          placeholder="https://facebook.com/..."
                          autoFocus
                        />
                      ) : (
                        <div className="form-display">
                          {safeRender(formData.socialLinks?.facebook) || 'Double-click to edit'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Website URL</label>
                    <div 
                      className="form-input-container"
                      onDoubleClick={() => handleDoubleClick('website')}
                    >
                      {editingFields.website ? (
                        <input
                          type="url"
                          value={formData.website || ''}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          onBlur={() => handleFieldBlur('website')}
                          className="form-input"
                          placeholder="https://yourwebsite.com"
                          autoFocus
                        />
                      ) : (
                        <div className="form-display">
                          {safeRender(formData.website) || 'Double-click to edit'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Business Preferences */}
          {activeTab === 'preferences' && (
            <div className="tab-section">
              {/* Section Header with Save Button */}
              <div className="section-header">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Settings</h3>
                {unsavedChanges.preferences && (
                  <button
                    onClick={() => handleSaveSection('preferences')}
                    disabled={updateProfileMutation.isLoading}
                    className="save-button"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                )}
              </div>

              <div className="form-grid">
                {/* Currency */}
                <div className="form-field">
                  <label className="form-label">Currency</label>
                  <div 
                    className="form-input-container"
                    onDoubleClick={() => handleDoubleClick('currency')}
                  >
                    {editingFields.currency ? (
                      <select
                        value={formData.preferences?.currency || ''}
                        onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                        onBlur={() => handleFieldBlur('currency')}
                        className="form-select"
                        autoFocus
                      >
                        <option value="">Select Currency</option>
                        <option value="USD">USD: US Dollar</option>
                        <option value="EUR">EUR: Euro</option>
                        <option value="GBP">GBP: British Pound</option>
                        <option value="CAD">CAD: Canadian Dollar</option>
                        <option value="LKR">LKR: Sri Lankan Rupee</option>
                        <option value="INR">INR: Indian Rupee</option>
                        <option value="AUD">AUD: Australian Dollar</option>
                        <option value="JPY">JPY: Japanese Yen</option>
                      </select>
                    ) : (
                      <div className="form-display">
                        {safeRender(formData.preferences?.currency) || 'Double-click to edit'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Hourly Rate */}
                <div className="form-field">
                  <label className="form-label">
                    Hourly Rate
                    <span className="text-red-400 ml-1">*</span>
                  </label>
                  <div 
                    className="form-input-container"
                    onDoubleClick={() => handleDoubleClick('serviceRate')}
                  >
                    {editingFields.serviceRate ? (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          {formData.preferences?.currency === 'USD' ? '$' : 
                           formData.preferences?.currency === 'EUR' ? '€' : 
                           formData.preferences?.currency === 'GBP' ? '£' : 
                           formData.preferences?.currency === 'CAD' ? 'C$' : 
                           formData.preferences?.currency === 'LKR' ? 'Rs' : 
                           formData.preferences?.currency === 'INR' ? '₹' : 
                           formData.preferences?.currency === 'AUD' ? 'A$' : 
                           formData.preferences?.currency === 'JPY' ? '¥' : '$'}
                        </span>
                      <input
                        type="number"
                        value={formData.preferences?.serviceRate || ''}
                        onChange={(e) => handlePreferenceChange('serviceRate', parseFloat(e.target.value))}
                        onBlur={() => handleFieldBlur('serviceRate')}
                          className="form-input pl-8"
                          placeholder="50"
                          min="0"
                          step="0.01"
                        autoFocus
                      />
                      </div>
                    ) : (
                      <div className="form-display">
                        {formData.preferences?.currency === 'USD' ? '$' : 
                         formData.preferences?.currency === 'EUR' ? '€' : 
                         formData.preferences?.currency === 'GBP' ? '£' : 
                         formData.preferences?.currency === 'CAD' ? 'C$' : 
                         formData.preferences?.currency === 'LKR' ? 'Rs' : 
                         formData.preferences?.currency === 'INR' ? '₹' : 
                         formData.preferences?.currency === 'AUD' ? 'A$' : 
                         formData.preferences?.currency === 'JPY' ? '¥' : '$'}{formData.preferences?.serviceRate || 'Double-click to edit'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Invoice Prefix */}
                <div className="form-field">
                  <label className="form-label">Invoice Prefix</label>
                  <div 
                    className="form-input-container"
                    onDoubleClick={() => handleDoubleClick('invoicePrefix')}
                  >
                    {editingFields.invoicePrefix ? (
                      <input
                        type="text"
                        value={formData.preferences?.invoicePrefix || ''}
                        onChange={(e) => handlePreferenceChange('invoicePrefix', e.target.value)}
                        onBlur={() => handleFieldBlur('invoicePrefix')}
                        className="form-input"
                        placeholder="INV-"
                        autoFocus
                      />
                    ) : (
                      <div className="form-display">
                        {safeRender(formData.preferences?.invoicePrefix) || 'Double-click to edit'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Terms */}
                <div className="form-field">
                  <label className="form-label">Payment Terms</label>
                  <div 
                    className="form-input-container"
                    onDoubleClick={() => handleDoubleClick('paymentTerms')}
                  >
                    {editingFields.paymentTerms ? (
                      <select
                        value={formData.preferences?.paymentTerms || ''}
                        onChange={(e) => handlePreferenceChange('paymentTerms', e.target.value)}
                        onBlur={() => handleFieldBlur('paymentTerms')}
                        className="form-select"
                        autoFocus
                      >
                        <option value="">Choose payment terms</option>
                        <option value="7">Net 7 (7 days)</option>
                        <option value="15">Net 15</option>
                        <option value="30">Net 30</option>
                        <option value="60">Net 60</option>
                        <option value="0">Due on receipt</option>
                      </select>
                    ) : (
                      <div className="form-display">
                        {formData.preferences?.paymentTerms === '7' ? 'Net 7 (7 days)' :
                         formData.preferences?.paymentTerms === '15' ? 'Net 15' :
                         formData.preferences?.paymentTerms === '30' ? 'Net 30' :
                         formData.preferences?.paymentTerms === '60' ? 'Net 60' :
                         formData.preferences?.paymentTerms === '0' ? 'Due on receipt' :
                         safeRender(formData.preferences?.paymentTerms) || 'Double-click to edit'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Auto Reminders Toggle */}
              <div className="form-field">
                <label className="form-label">Auto Reminders</label>
                <div className="flex items-center space-x-4">
                <button
                                      onClick={() => handlePreferenceChange('autoReminders', !formData.preferences?.autoReminders)}
                                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                      formData.preferences?.autoReminders ? 'bg-gray-600' : 'bg-gray-300'
                    } hover:scale-105`}
                >
                                        <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-200 ${
                          formData.preferences?.autoReminders ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                </button>
                  <span className="text-gray-700 text-sm">
                    {formData.preferences?.autoReminders ? 'ON' : 'OFF'} - For invoice reminders
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Security */}
          {activeTab === 'security' && (
            <div className="tab-section">
              {/* Section Header */}
              <div className="section-header">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Security</h3>
                <div className="flex items-center space-x-2 text-gray-600 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Last login: {profile?.user?.formattedLastLogin || formatLastLogin(profile?.user?.lastLogin)}</span>
                  {profile?.user?.country && (
                    <span className="text-xs text-gray-500">
                      ({profile?.user?.country} timezone)
                    </span>
                  )}
                  {/* Remove debug logging since it's no longer needed */}
                </div>
              </div>

              <div className="form-grid">
                {/* Password Change Card */}
                <div className="form-field">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Lock className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                                        <h4 className="text-base font-semibold text-gray-800">Password Change</h4>
                <p className="text-gray-600 text-sm">Update your account password</p>
                      </div>
                    </div>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                      className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-800 hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                  >
                      <Lock className="w-4 h-4" />
                      <span>Update Password</span>
                  </button>
                  </div>
                </div>

                {/* Account Deletion Card */}
                <div className="form-field">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Trash2 className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-gray-800">Account Deletion</h4>
                        <p className="text-gray-600 text-sm">Permanently delete your account</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm">This action cannot be undone. All your data will be permanently deleted.</p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                      className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                  >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete My Account</span>
                  </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Client Previews */}
          {activeTab === 'previews' && (
            <div className="tab-section">
              {/* Section Header */}
              <div className="section-header">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Client Previews</h3>
                <p className="text-gray-600 text-sm">See how your information appears to clients</p>
              </div>

              <div className="form-grid">
                {/* Invoice Header Preview */}
                <div className="form-field">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FileText className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-gray-800">Invoice Header Preview</h4>
                        <p className="text-gray-600 text-sm">How your invoices appear to clients</p>
                      </div>
                    </div>
                    
                    {/* Invoice Header Mockup */}
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={formData.businessLogo || '/default-logo.png'}
                            alt="Business Logo"
                            className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                          />
                          <div>
                            <h2 className="text-lg font-bold text-gray-900">
                              {safeRender(formData.businessName) || 'Your Business Name'}
                            </h2>
                            <p className="text-gray-600 text-sm">
                              {safeRender(formData.email) || 'email@example.com'}
                            </p>
                            {formData.website && (
                              <p className="text-gray-600 text-sm">
                                {safeRender(formData.website)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Invoice #</div>
                          <div className="text-sm font-semibold text-gray-900">
                            {formData.preferences?.invoicePrefix || 'INV'}-2024-001
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 pt-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">From:</span>
                            <div className="font-medium text-gray-900">
                              {safeRender(formData.businessName) || 'Your Business Name'}
                            </div>
                            <div className="text-gray-600">
                              {safeRender(formData.address) || 'Your Address'}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">To:</span>
                            <div className="font-medium text-gray-900">Client Name</div>
                            <div className="text-gray-600">Client Address</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Portal Preview */}
                <div className="form-field">
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Monitor className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-gray-800">Client Portal Preview</h4>
                        <p className="text-gray-600 text-sm">How clients see your profile</p>
                      </div>
                    </div>
                    
                    {/* Mobile Preview */}
                    <div className="mb-4">
                      <div className="text-gray-700 text-sm mb-2">Mobile View</div>
                      <div className="bg-white rounded-xl p-4 shadow-lg max-w-xs mx-auto">
                        <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={formData.profilePicture || user?.avatar || '/default-avatar.png'}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                            <p className="text-gray-900 font-medium">
                              {safeRender(formData.fullName) || 'Your Name'}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {safeRender(formData.freelancerType) || 'Freelancer'}
                            </p>
                      </div>
                    </div>
                        <p className="text-gray-700 text-sm">
                          {safeRender(formData.bio) || 'No bio added yet'}
                        </p>
                  </div>
                </div>

                    {/* Desktop Preview */}
                    <div className="mb-4">
                      <div className="text-gray-700 text-sm mb-2">Desktop View</div>
                      <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-start space-x-4">
                          <img
                            src={formData.profilePicture || user?.avatar || '/default-avatar.png'}
                            alt="Profile"
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {safeRender(formData.fullName) || 'Your Name'}
                            </h3>
                            <p className="text-gray-600 mb-2">
                              {safeRender(formData.freelancerType) || 'Freelancer'}
                            </p>
                            <p className="text-gray-700">
                              {safeRender(formData.bio) || 'No bio added yet'}
                            </p>
                      </div>
                    </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowClientPreviewModal(true)}
                      className="w-full px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-800 hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Monitor className="w-4 h-4" />
                      <span>View as Client</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Only show when there are any unsaved changes */}
        {(unsavedChanges.profile || unsavedChanges.logoSocials || unsavedChanges.preferences || unsavedChanges.security) && (
          <div className="action-buttons">
            <div className="action-buttons-container">
              <button
                onClick={handleSave}
                disabled={updateProfileMutation.isLoading}
                className="save-all-button"
              >
                <Save className="w-5 h-5" />
                {updateProfileMutation.isLoading ? 'Saving...' : 'Save All Changes'}
              </button>
              <button
                onClick={handleCancel}
                className="cancel-button"
              >
                Cancel All Changes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Lock className="w-6 h-6 text-gray-600" />
                </div>
              <h3 className="modal-title">Change Password</h3>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="modal-close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="modal-content space-y-6">
              {/* Current Password */}
              <div className="modal-field">
                <label className="modal-label">Current Password</label>
                <div className="modal-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="modal-input"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="modal-toggle"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="modal-field">
                <label className="modal-label">New Password</label>
                <div className="modal-input-container">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="modal-input"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="modal-toggle"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordData.newPassword && passwordData.newPassword.length < 8 && (
                  <p className="text-red-400 text-xs mt-1">Password must be at least 8 characters</p>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="modal-field">
                <label className="modal-label">Confirm New Password</label>
                <div className="modal-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="modal-input"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="modal-toggle"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={handlePasswordChange}
                disabled={changePasswordMutation.isLoading || 
                         passwordData.newPassword.length < 8 || 
                         passwordData.newPassword !== passwordData.confirmPassword ||
                         !passwordData.currentPassword}
                className="modal-primary-button"
              >
                {changePasswordMutation.isLoading ? 'Changing...' : 'Change Password'}
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setShowPassword(false);
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
                }}
                className="modal-secondary-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="modal-title">Delete Account</h3>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
                className="modal-close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="modal-content space-y-6">
              <div className="text-center">
                <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h4 className="text-base font-semibold text-gray-800 mb-2">Permanently Delete Account</h4>
                <p className="text-gray-600 text-sm mb-6">
                  This action cannot be undone. All your data, including projects, clients, invoices, and settings will be permanently deleted.
                </p>
              </div>

              <div className="modal-field">
                <label className="modal-label">
                  Type "DELETE" to confirm
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="modal-input"
                  placeholder="Type DELETE to confirm"
                />
                {deleteConfirmation && deleteConfirmation !== 'DELETE' && (
                  <p className="text-red-400 text-xs mt-1">Please type "DELETE" exactly to confirm</p>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
                className="modal-secondary-button"
              >
                Cancel
              </button>
              <button
                onClick={handleAccountDeletion}
                disabled={deleteConfirmation !== 'DELETE'}
                className="modal-danger-button"
              >
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Preview Simulation Modal */}
      {showClientPreviewModal && (
        <div className="modal-overlay">
          <div className="modal-container max-w-4xl">
            <div className="modal-header">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Monitor className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="modal-title">Client View Simulation</h3>
              </div>
              <button
                onClick={() => setShowClientPreviewModal(false)}
                className="modal-close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="modal-content">
              {/* Client Portal Header */}
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={formData.businessLogo || '/default-logo.png'}
                      alt="Business Logo"
                      className="w-12 h-12 rounded-lg object-cover bg-white/10"
                    />
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {safeRender(formData.businessName) || 'Your Business Name'}
                      </h2>
                      <p className="text-white/60 text-sm">
                        Client Portal
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-white/60 text-sm">
                    <div>Welcome, Client</div>
                    <div>Dashboard</div>
                  </div>
                </div>
              </div>

              {/* Client Profile View */}
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="flex items-start space-x-6">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={formData.profilePicture || user?.avatar || '/default-avatar.png'}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover shadow-lg"
                    />
                  </div>

                  {/* Profile Information */}
                  <div className="flex-1">
                    <h1 className="text-lg font-bold text-gray-900 mb-2">
                      {safeRender(formData.fullName) || 'Your Name'}
                    </h1>
                    <p className="text-sm text-gray-600 font-medium mb-4">
                      {safeRender(formData.freelancerType) || 'Freelancer'}
                    </p>
                    
                    {formData.bio && (
                      <p className="text-gray-700 text-sm mb-6 leading-relaxed">
                        {safeRender(formData.bio)}
                      </p>
                    )}

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.email && (
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-gray-500" />
                          <span className="text-gray-700">{safeRender(formData.email)}</span>
                        </div>
                      )}
                      {formData.phone && (
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-gray-500" />
                          <span className="text-gray-700">{safeRender(formData.phone)}</span>
                        </div>
                      )}
                      {formData.website && (
                        <div className="flex items-center space-x-3">
                          <Globe className="w-5 h-5 text-gray-500" />
                          <span className="text-gray-700">{safeRender(formData.website)}</span>
                        </div>
                      )}
                      {formData.address && (
                        <div className="flex items-center space-x-3">
                          <Building className="w-5 h-5 text-gray-500" />
                          <span className="text-gray-700">{safeRender(formData.address)}</span>
                        </div>
                      )}
                    </div>

                    {/* Social Links */}
                    {formData.socialLinks && Object.values(formData.socialLinks).some(link => link) && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Connect</h3>
                        <div className="flex space-x-4">
                          {formData.socialLinks.linkedin && (
                            <a href={formData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 transition-colors">
                              LinkedIn
                            </a>
                          )}
                          {formData.socialLinks.twitter && (
                            <a href={formData.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 transition-colors">
                              Twitter
                            </a>
                          )}
                          {formData.socialLinks.instagram && (
                            <a href={formData.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 transition-colors">
                              Instagram
                            </a>
                          )}
                          {formData.socialLinks.facebook && (
                            <a href={formData.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 transition-colors">
                              Facebook
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Client Actions */}
              <div className="mt-6 flex justify-center space-x-4">
                <button className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
                  Book Consultation
                </button>
                <button className="px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors">
                  View Portfolio
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowClientPreviewModal(false)}
                className="modal-secondary-button"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 