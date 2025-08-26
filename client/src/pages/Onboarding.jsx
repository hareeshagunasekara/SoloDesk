import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Building, 
  Globe, 
  DollarSign, 
  Image, 
  Users, 
  Mail, 
  Phone, 
  Tag, 
  Clock, 
  FileText,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import axios from '../services/api';
import { getTimezoneDisplayName } from '../utils/timezoneUtils';

const steps = [
  { id: 1, title: 'Profile & Business Setup', icon: <User className="h-6 w-6" />, description: 'Set up your branding and preferences' },
  { id: 2, title: 'Add Your First Client', icon: <Users className="h-6 w-6" />, description: 'Create your first client profile' },
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({});
  const [clients, setClients] = useState([]);
  const [onboarding, setOnboarding] = useState({});
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const navigate = useNavigate();

  // Forms
  const profileForm = useForm();
  const clientForm = useForm();
  const bookingForm = useForm();

  useEffect(() => {
    fetchOnboardingStatus();
  }, []);

  useEffect(() => {
    if (currentStep === 3) {
      fetchClients();
    }
  }, [currentStep]);

  const fetchOnboardingStatus = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/onboarding/status');
      setOnboarding(res.data.onboarding);
      setProfile(res.data.profile);
      setCurrentStep(res.data.onboarding?.currentStep || 1);
      
      // Pre-fill forms with existing data
      if (res.data.profile) {
        profileForm.reset(res.data.profile);
      }
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await axios.get('/onboarding/clients');
      setClients(res.data.clients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  // Auto-save functionality
  const autoSave = async (step, data) => {
    try {
      setSaving(true);
      switch (step) {
        case 1:
          await axios.post('/onboarding/profile', data);
          break;
        case 2:
          await axios.post('/onboarding/client', data);
          break;
        case 3:
          await axios.post('/onboarding/booking', data);
          break;
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Step 1: Profile Setup
  const handleProfileSubmit = async (data) => {
    setLoading(true);
    try {
      await axios.post('/onboarding/profile', data);
      setProfile(data);
      setCurrentStep(2);
    } catch (error) {
      console.error('Profile setup error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Add Client
  const handleClientSubmit = async (data) => {
    setLoading(true);
    try {
      const clientData = { ...data, tags };
      await axios.post('/onboarding/client', clientData);
      setCurrentStep(3);
    } catch (error) {
      console.error('Client creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Skip client creation
  const skipClientCreation = async () => {
    setLoading(true);
    try {
      // Optionally save a placeholder or skip entirely
      await axios.post('/onboarding/skip-client');
      setCurrentStep(3);
    } catch (error) {
      console.error('Skip client error:', error);
      // If the endpoint doesn't exist, just proceed to next step
      setCurrentStep(3);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Booking
  const handleBookingSubmit = async (data) => {
    setLoading(true);
    try {
      // Only create booking if there are clients
      if (clients.length > 0) {
        await axios.post('/onboarding/booking', data);
      }
      await axios.post('/onboarding/complete');
      navigate('/dashboard');
    } catch (error) {
      console.error('Booking creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Skip booking
  const skipBooking = async () => {
    setLoading(true);
    try {
      await axios.post('/onboarding/complete');
      navigate('/dashboard');
    } catch (error) {
      console.error('Skip booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tag management
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 flex items-center justify-center relative overflow-hidden">
        {/* Enhanced Sunset Animation Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Main sunset orb */}
          <motion.div
            animate={{ 
              scale: [1, 1.4, 1],
              opacity: [0.4, 0.8, 0.4],
              y: [-30, 30, -30],
              x: [-15, 15, -15]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-[#FFD166]/50 via-orange-300/40 to-[#BC96E6]/40 rounded-full blur-3xl"
          />
          
          {/* Secondary sunset orb */}
          <motion.div
            animate={{ 
              scale: [1.3, 1, 1.3],
              opacity: [0.3, 0.7, 0.3],
              y: [30, -30, 30],
              x: [15, -15, 15]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-[#BC96E6]/50 via-pink-300/40 to-[#210B2C]/30 rounded-full blur-3xl"
          />
          
          {/* Floating elements */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.6, 0.2],
              y: [0, -40, 0],
              rotate: [0, 10, 0]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute top-1/3 left-1/2 w-64 h-32 bg-gradient-to-r from-white/30 to-[#FFD166]/30 rounded-full blur-2xl"
          />
          
          {/* Floating particles */}
          <motion.div
            animate={{ 
              y: [0, -150, 0],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0
            }}
            className="absolute top-1/2 left-1/3 w-3 h-3 bg-[#FFD166]/70 rounded-full"
          />
          <motion.div
            animate={{ 
              y: [0, -120, 0],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3
            }}
            className="absolute top-1/3 right-1/4 w-2 h-2 bg-[#BC96E6]/70 rounded-full"
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center relative z-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg"
          >
            <Sparkles className="h-8 w-8 text-[#210B2C]" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-2xl font-semibold text-[#210B2C] mb-2"
          >
            Setting up SoloDesk
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-[#210B2C]/70"
          >
            Preparing your workspace...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 relative overflow-hidden">
      {/* Enhanced Sunset Animation Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main sunset orb - top left */}
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.8, 0.4],
            y: [-20, 20, -20],
            x: [-10, 10, -10]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-r from-[#FFD166]/40 via-orange-300/30 to-[#BC96E6]/30 rounded-full blur-3xl"
        />
        
        {/* Secondary sunset orb - top right */}
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.6, 0.3],
            y: [20, -20, 20],
            x: [10, -10, 10]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-r from-[#BC96E6]/40 via-pink-300/30 to-[#210B2C]/20 rounded-full blur-3xl"
        />
        
        {/* Floating clouds/sunset elements */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.5, 0.2],
            y: [0, -30, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-1/4 left-1/3 w-[400px] h-[200px] bg-gradient-to-r from-white/20 to-[#FFD166]/20 rounded-full blur-2xl"
        />
        
        {/* Bottom sunset reflection */}
        <motion.div
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.7, 0.3],
            y: [0, 20, 0]
          }}
          transition={{ 
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
          className="absolute bottom-0 left-1/4 w-[700px] h-[400px] bg-gradient-to-r from-[#FFD166]/30 via-pink-200/20 to-[#BC96E6]/25 rounded-full blur-3xl"
        />
        
        {/* Floating particles */}
        <motion.div
          animate={{ 
            y: [0, -100, 0],
            opacity: [0, 1, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0
          }}
          className="absolute top-1/2 left-1/4 w-2 h-2 bg-[#FFD166]/60 rounded-full"
        />
        <motion.div
          animate={{ 
            y: [0, -80, 0],
            opacity: [0, 1, 0]
          }}
          transition={{ 
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-1/3 right-1/3 w-1 h-1 bg-[#BC96E6]/60 rounded-full"
        />
        <motion.div
          animate={{ 
            y: [0, -120, 0],
            opacity: [0, 1, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
          className="absolute top-2/3 left-1/2 w-1.5 h-1.5 bg-[#210B2C]/40 rounded-full"
        />
      </div>

      <div className="max-w-5xl mx-auto h-screen flex flex-col py-6 px-6 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6 flex-shrink-0"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-3xl lg:text-4xl font-bold text-[#210B2C] mb-2"
          >
            Welcome to SoloDesk
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg text-[#210B2C]/70"
          >
            Let's get you set up in just a few steps
          </motion.p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mb-4 flex-shrink-0"
        >
          {/* Progress Bar Container */}
          <div className="relative w-full max-w-4xl mx-auto">
            {/* Background Track */}
            <div className="w-full h-2 bg-white/30 rounded-full backdrop-blur-sm">
              {/* Progress Fill */}
              <motion.div 
                className="h-full bg-gradient-to-r from-[#FFD166] to-[#BC96E6] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            
            {/* Step Indicators */}
            <div className="flex justify-between items-center mt-4">
              {steps.map((step, index) => (
                <motion.div 
                  key={step.id} 
                  className="flex flex-col items-center relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                >
                  {/* Step Icon */}
                  <motion.div 
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-lg backdrop-blur-sm mb-2 ${
                      currentStep >= step.id 
                        ? 'bg-gradient-to-br from-[#FFD166] to-[#BC96E6] border-[#FFD166] text-[#210B2C] scale-110' 
                        : 'bg-white/60 border-white/30 text-[#210B2C]/50'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      scale: currentStep >= step.id ? 1.1 : 1,
                      boxShadow: currentStep >= step.id 
                        ? '0 10px 25px -5px rgba(255, 209, 102, 0.3)' 
                        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {step.icon}
                  </motion.div>
                  
                  {/* Step Labels */}
                  <div className="text-center max-w-20">
                    <p className={`text-xs leading-tight ${
                      currentStep >= step.id ? 'text-[#210B2C]/70' : 'text-[#210B2C]/40'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-5 left-full w-full h-0.5 bg-white/20 -z-10" />
                  )}
                </motion.div>
              ))}
            </div>
            
            {/* Progress Percentage */}
            <motion.div 
              className="text-center mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <span className="text-sm font-medium text-[#210B2C]/70">
                Step {currentStep} of {steps.length}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Step Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="relative bg-white/20 backdrop-blur-2xl border border-white/40 rounded-3xl p-6 shadow-2xl overflow-hidden flex-1 min-h-0"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Frosted glass overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl pointer-events-none" />
          
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFD166]/5 via-transparent to-[#BC96E6]/5 rounded-3xl pointer-events-none" />
          
          {/* Content wrapper with relative positioning */}
          <div className="relative z-10 h-full overflow-y-auto scrollbar-hide">
          {/* Step 1: Profile & Business Setup */}
          {currentStep === 1 && (
            <motion.form 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              onSubmit={profileForm.handleSubmit(handleProfileSubmit)} 
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-[#FFD166] to-[#BC96E6] rounded-xl flex items-center justify-center shadow-lg"
                >
                  <User className="h-6 w-6 text-[#210B2C]" />
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-2xl font-bold text-[#210B2C] mb-2"
                >
                  Profile & Business Setup
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-[#210B2C]/70 text-base"
                >
                  Set up your branding, currency, and localization
                </motion.p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-accent font-medium mb-2">
                    Full Name <span className="text-error">*</span>
                  </label>
                  <input
                    {...profileForm.register('fullName', { required: 'Full name is required' })}
                    defaultValue={profile.fullName || ''}
                    className="w-full px-4 py-3 bg-background border border-accent/30 rounded-lg text-accent placeholder-accent/50 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    placeholder="Enter your full name"
                  />
                  {profileForm.formState.errors.fullName && (
                    <p className="text-error text-sm mt-1">{profileForm.formState.errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-accent font-medium mb-2">
                    Business Name
                  </label>
                  <input
                    {...profileForm.register('businessName')}
                    defaultValue={profile.businessName || ''}
                    className="w-full px-4 py-3 bg-background border border-accent/30 rounded-lg text-accent placeholder-accent/50 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    placeholder="Your business name (optional)"
                  />
                </div>

                <div>
                  <label className="block text-accent font-medium mb-2">
                    Country <span className="text-error">*</span>
                  </label>
                  <select
                    {...profileForm.register('country', { required: 'Country is required' })}
                    defaultValue={profile.country || ''}
                    onChange={(e) => {
                      profileForm.setValue('country', e.target.value);
                      // Trigger timezone display update
                      setTimeout(() => profileForm.trigger('country'), 0);
                    }}
                    className="w-full px-4 py-3 bg-background border border-accent/30 rounded-lg text-accent focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
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
                  {profileForm.formState.errors.country && (
                    <p className="text-error text-sm mt-1">{profileForm.formState.errors.country.message}</p>
                  )}
                  {profileForm.watch('country') && (
                    <div className="mt-2 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                      <div className="flex items-center space-x-2 text-sm text-accent">
                        <Clock className="w-4 h-4" />
                        <span>Timezone: {getTimezoneDisplayName(profileForm.watch('country'))}</span>
                      </div>
                      <p className="text-xs text-accent/70 mt-1">
                        All times will be displayed in your local timezone
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-accent font-medium mb-2">
                    Preferred Currency <span className="text-error">*</span>
                  </label>
                  <select
                    {...profileForm.register('preferredCurrency', { required: 'Currency is required' })}
                    defaultValue={profile.preferredCurrency || 'USD'}
                    className="w-full px-4 py-3 bg-background border border-accent/30 rounded-lg text-accent focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="LKR">LKR - Sri Lankan Rupee</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="CHF">CHF - Swiss Franc</option>
                    <option value="SEK">SEK - Swedish Krona</option>
                    <option value="NOK">NOK - Norwegian Krone</option>
                    <option value="DKK">DKK - Danish Krone</option>
                  </select>
                  {profileForm.formState.errors.preferredCurrency && (
                    <p className="text-error text-sm mt-1">{profileForm.formState.errors.preferredCurrency.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-accent font-medium mb-2">
                    Default Service Rate
                  </label>
                  <input
                    type="number"
                    {...profileForm.register('defaultServiceRate', { min: 0 })}
                    defaultValue={profile.defaultServiceRate || ''}
                    className="w-full px-4 py-3 bg-background border border-accent/30 rounded-lg text-accent placeholder-accent/50 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-accent font-medium mb-2">
                    Business Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    {...profileForm.register('logo')}
                    className="w-full px-4 py-3 bg-background border border-accent/30 rounded-lg text-accent focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-[#FFD166] to-[#BC96E6] text-[#210B2C] font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-[#210B2C] border-t-transparent rounded-full"
                      />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Next: Add First Client</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </motion.button>
              </div>
            </motion.form>
          )}

          {/* Step 2: Add Your First Client */}
          {currentStep === 2 && (
            <motion.form 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              onSubmit={clientForm.handleSubmit(handleClientSubmit)} 
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-[#FFD166] to-[#BC96E6] rounded-xl flex items-center justify-center shadow-lg"
                >
                  <Users className="h-6 w-6 text-[#210B2C]" />
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-2xl font-bold text-[#210B2C] mb-2"
                >
                  Add Your First Client
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-[#210B2C]/70 text-base"
                >
                  The core of SoloDesk is client management
                </motion.p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-accent font-medium mb-2">
                    Client Name <span className="text-error">*</span>
                  </label>
                  <input
                    {...clientForm.register('name', { required: 'Client name is required' })}
                    className="w-full px-4 py-3 bg-background border border-accent/30 rounded-lg text-accent placeholder-accent/50 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    placeholder="Enter client name"
                  />
                  {clientForm.formState.errors.name && (
                    <p className="text-error text-sm mt-1">{clientForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-accent font-medium mb-2">
                    Client Email
                  </label>
                  <input
                    type="email"
                    {...clientForm.register('email', { 
                      pattern: { 
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                        message: 'Invalid email address' 
                      } 
                    })}
                    className="w-full px-4 py-3 bg-background border border-accent/30 rounded-lg text-accent placeholder-accent/50 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    placeholder="client@example.com"
                  />
                  {clientForm.formState.errors.email && (
                    <p className="text-error text-sm mt-1">{clientForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-accent font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    {...clientForm.register('phone')}
                    className="w-full px-4 py-3 bg-background border border-accent/30 rounded-lg text-accent placeholder-accent/50 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-accent font-medium mb-2">
                    Service Type <span className="text-error">*</span>
                  </label>
                  <input
                    {...clientForm.register('serviceType', { required: 'Service type is required' })}
                    className="w-full px-4 py-3 bg-background border border-accent/30 rounded-lg text-accent placeholder-accent/50 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    placeholder="e.g., Coaching, Photography, Design"
                  />
                  {clientForm.formState.errors.serviceType && (
                    <p className="text-error text-sm mt-1">{clientForm.formState.errors.serviceType.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-accent font-medium mb-2">
                    Custom Rate
                  </label>
                  <input
                    type="number"
                    {...clientForm.register('customRate', { min: 0 })}
                    className="w-full px-4 py-3 bg-background border border-accent/30 rounded-lg text-accent placeholder-accent/50 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-accent font-medium mb-2">
                    Tags
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={handleTagKeyPress}
                        className="flex-1 px-4 py-3 bg-background border border-accent/30 rounded-lg text-accent placeholder-accent/50 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                        placeholder="Add tags (e.g., high-priority, photography)"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-3 bg-accent text-background font-medium rounded-lg hover:bg-accent/90 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-2 text-secondary hover:text-secondary/70"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-accent font-medium mb-2">
                    Notes
                  </label>
                  <textarea
                    {...clientForm.register('notes')}
                    rows={3}
                    className="w-full px-4 py-3 bg-background border border-accent/30 rounded-lg text-accent placeholder-accent/50 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 resize-none"
                    placeholder="Any additional notes about this client..."
                  />
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={skipClientCreation}
                  disabled={loading}
                  className="px-6 py-3 bg-white/20 text-[#210B2C] font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/30"
                >
                  {loading ? 'Skipping...' : 'Skip & Continue'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-[#FFD166] to-[#BC96E6] text-[#210B2C] font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-[#210B2C] border-t-transparent rounded-full"
                      />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Next: Schedule a Booking</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </button>
              </div>
            </motion.form>
          )}

          {/* Step 3: First Booking */}
          {currentStep === 3 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-[#FFD166] to-[#BC96E6] rounded-xl flex items-center justify-center shadow-lg"
                >
                  <Calendar className="h-6 w-6 text-[#210B2C]" />
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-2xl font-bold text-[#210B2C] mb-2"
                >
                  First Booking {clients.length === 0 ? '(Skip Recommended)' : '(Optional)'}
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-[#210B2C]/70 text-base"
                >
                  {clients.length === 0 
                    ? 'No clients available. You can skip this step and add bookings later.' 
                    : 'Schedule your first appointment to get started'
                  }
                </motion.p>
              </div>

              <motion.form 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                onSubmit={bookingForm.handleSubmit(handleBookingSubmit)} 
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-accent font-medium mb-2">
                      Select Client <span className="text-error">*</span>
                    </label>
                    {clients.length > 0 ? (
                                          <select
                      {...bookingForm.register('clientId', { 
                        required: clients.length > 0 ? 'Please select a client' : false 
                      })}
                      className="w-full px-4 py-3 bg-background border border-accent/30 rounded-lg text-accent focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    >
                        <option value="">Choose a client</option>
                        {clients.map(client => (
                          <option key={client._id} value={client._id}>
                            {client.name} - {client.serviceType}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-full px-4 py-3 bg-background border border-accent/30 rounded-lg text-accent/50">
                        No clients available. Please add a client first.
                      </div>
                    )}
                    {bookingForm.formState.errors.clientId && (
                      <p className="text-error text-sm mt-1">{bookingForm.formState.errors.clientId.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-accent font-medium mb-2">
                      Service <span className="text-error">*</span>
                    </label>
                    <input
                      {...bookingForm.register('service', { required: 'Service is required' })}
                      className="w-full px-4 py-3 bg-background border border-accent/30 rounded-lg text-accent placeholder-accent/50 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                      placeholder="What service is being booked?"
                    />
                    {bookingForm.formState.errors.service && (
                      <p className="text-error text-sm mt-1">{bookingForm.formState.errors.service.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-accent font-medium mb-2">
                      Date <span className="text-error">*</span>
                    </label>
                    <input
                      type="date"
                      {...bookingForm.register('date', { required: 'Date is required' })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-background border border-accent/30 rounded-lg text-accent focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    />
                    {bookingForm.formState.errors.date && (
                      <p className="text-error text-sm mt-1">{bookingForm.formState.errors.date.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-accent font-medium mb-2">
                      Start Time <span className="text-error">*</span>
                    </label>
                    <input
                      type="time"
                      {...bookingForm.register('startTime', { required: 'Start time is required' })}
                      className="w-full px-4 py-3 bg-background border border-accent/30 rounded-lg text-accent focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    />
                    {bookingForm.formState.errors.startTime && (
                      <p className="text-error text-sm mt-1">{bookingForm.formState.errors.startTime.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-accent font-medium mb-2">
                      Duration <span className="text-error">*</span>
                    </label>
                    <select
                      {...bookingForm.register('duration', { required: 'Duration is required' })}
                      className="w-full px-4 py-3 bg-background border border-accent/30 rounded-lg text-accent focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    >
                      <option value="">Select duration</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                      <option value={180}>3 hours</option>
                      <option value={240}>4 hours</option>
                    </select>
                    {bookingForm.formState.errors.duration && (
                      <p className="text-error text-sm mt-1">{bookingForm.formState.errors.duration.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-accent font-medium mb-2">
                      Rate
                    </label>
                    <input
                      type="number"
                      {...bookingForm.register('rate', { min: 0 })}
                      className="w-full px-4 py-3 bg-background border border-accent/30 rounded-lg text-accent placeholder-accent/50 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                      placeholder="Auto-filled from client"
                      step="0.01"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-accent font-medium mb-2">
                      Notes
                    </label>
                    <textarea
                      {...bookingForm.register('notes')}
                      rows={3}
                      className="w-full px-4 py-3 bg-background border border-accent/30 rounded-lg text-accent placeholder-accent/50 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 resize-none"
                      placeholder="Any additional notes for this booking..."
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={skipBooking}
                    disabled={loading}
                    className="px-6 py-3 bg-white/20 text-[#210B2C] font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/30"
                  >
                    {loading ? 'Saving...' : 'Skip & Go to Dashboard'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-[#FFD166] to-[#BC96E6] text-[#210B2C] font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-[#210B2C] border-t-transparent rounded-full"
                        />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Finish Setup</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </motion.button>
                </div>
              </motion.form>
            </motion.div>
          )}
          </div>
        </motion.div>

        {/* Auto-save indicator */}
        <AnimatePresence>
          {saving && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-6 right-6 bg-white/90 backdrop-blur-xl border border-white/30 px-6 py-4 rounded-2xl shadow-2xl"
            >
              <div className="flex items-center space-x-3">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-[#210B2C] border-t-transparent rounded-full"
                />
                <span className="text-[#210B2C] font-medium">Saving...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding; 