import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  BarChart3,
  Wrench,
  UserPlus,
  MapPin,
  Settings,
  ArrowRight,
  Sparkles,
  Star,
  Zap,
  Heart,
  Coffee,
  BookOpen,
  Target,
  Award,
  Lightbulb,
  Shield,
  Rocket,
  Globe,
  Users,
  Brain,
  Workflow,
  Bell,
  Clock,
  FolderOpen,
  Send,
  CreditCard,
} from 'lucide-react';
import Button from '../components/Button';
import PublicLayout from '../layouts/PublicLayout';

import BlurText from '../components/BlurText';
import ScrollFloat from '../components/ScrollFloat';
import Waves from '../components/Waves';
import Carousel from '../components/Carousel';
import meshBackground from '../assets/mesh-340.png';

import '../styles/Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Handle hash navigation when page loads
    if (location.hash === '#features') {
      const featuresSection = document.getElementById('features');
      if (featuresSection) {
        // Small delay to ensure the page is fully loaded
        setTimeout(() => {
          featuresSection.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location.hash]);

  const handleAnimationComplete = () => {
    console.log('Hero animation completed!');
  };
  const features = [
    {
      icon: <Calendar className="h-8 w-8" />,
      title: 'Smart Scheduling',
      description: 'Let bookings run themselves — with availability, timezones, buffers, and reminders baked in.',
      color: 'from-gray-600/20 to-gray-700/20',
      borderColor: 'border-gray-600/30',
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Visual Insights',
      description: 'See your growth at a glance — earnings, peak months, top clients, popular services.',
      color: 'from-gray-500/20 to-gray-600/20',
      borderColor: 'border-gray-500/30',
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: 'AI Summaries',
      description: 'Auto-capture and summarize chats, meetings, and notes — all searchable, all sorted.',
      color: 'from-gray-400/20 to-gray-500/20',
      borderColor: 'border-gray-400/30',
    },
    {
      icon: <Workflow className="h-8 w-8" />,
      title: 'Workflow Templates',
      description: 'Skip the setup. Reuse custom workflows for services you offer often.',
      color: 'from-gray-700/20 to-gray-800/20',
      borderColor: 'border-gray-700/30',
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: 'Unified Notifications',
      description: 'One panel. All alerts. Nothing missed — from invoices to messages.',
      color: 'from-gray-300/20 to-gray-400/20',
      borderColor: 'border-gray-300/30',
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Effortless Time Tracking',
      description: 'Run timers, tag tasks, get reports — bill smarter and work cleaner.',
      color: 'from-gray-800/20 to-gray-900/20',
      borderColor: 'border-gray-800/30',
    },
  ];



  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="hero-section">
        {/* Dreamy sunset background gradient */}
        <div className="hero-background"></div>
        
        {/* Subtle floating elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 left-20 h-32 w-32 rounded-full bg-gray-400/10 blur-xl"
          />
          <motion.div
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-40 right-32 h-24 w-24 rounded-full bg-gray-500/15 blur-lg"
          />
        </div>

        <div className="relative w-full h-screen flex items-center">
          {/* Full viewport hero waves */}
          <Waves
            lineColor="#f3f4f6"
            backgroundColor="rgba(243, 244, 246, 0.2)"
            waveSpeedX={0.02}
            waveSpeedY={0.01}
            waveAmpX={40}
            waveAmpY={20}
            friction={0.9}
            tension={0.01}
            maxCursorMove={120}
            xGap={12}
            yGap={36}
          />
          
          {/* Centered content overlay */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hero-content"
          >
            <div className="hero-content-wrapper">
              <div className="hero-glass-card">
                {/* Glass overlay effect */}
                <div className="hero-glass-overlay"></div>
                {/* Subtle inner glow */}
                <div className="hero-inner-glow"></div>
                {/* Content wrapper */}
                <div className="hero-content-inner">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="hero-badge"
                >
                  <div className="hero-badge-icon">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="text-lg font-bold tracking-wide uppercase drop-shadow-lg text-gray-300"
                  >
                    Elevate Your Workspace. Empower Your Business.
                  </motion.span>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.9 }}
                  className="mb-6"
                >
                  <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 bg-clip-text text-transparent drop-shadow-xl mb-4">
                    SoloDesk
                  </h1>
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 1.2 }}
                  className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-300/90 mb-6 drop-shadow"
                >
                  Smart. Seamless. Beautifully Yours.
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 1.5 }}
                  className="text-lg md:text-xl text-gray-200/90 font-medium mb-8 drop-shadow max-w-3xl mx-auto leading-relaxed"
                >
                  A next-gen CRM and workspace command center — built to organize, streamline, and elevate how you work, all from one intuitive dashboard.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="hero-buttons"
                >
                  <Button size="lg" className="hero-primary-button group" asChild>
                    <Link to="/register" className="flex items-center gap-2">
                      <span>Get Started</span>
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
          
                    {/* Professional floating UI elements */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              opacity: [0.6, 0.8, 0.6],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-10 sm:top-20 left-10 sm:left-20 h-6 w-6 sm:h-8 sm:w-8 bg-gray-100/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-gray-200/20 shadow-sm z-20"
          >
            <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
          </motion.div>
          
          <motion.div
            animate={{
              y: [0, 8, 0],
              opacity: [0.6, 0.8, 0.6],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 h-5 w-5 sm:h-6 sm:w-6 bg-gray-100/10 backdrop-blur-sm rounded-md flex items-center justify-center border border-gray-200/20 shadow-sm z-20"
          >
            <Coffee className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500" />
          </motion.div>
          
          <motion.div
            animate={{
              x: [0, 6, 0],
              y: [0, -8, 0],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/3 right-8 sm:right-16 h-6 w-6 sm:h-7 sm:w-7 bg-gray-100/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-200/20 shadow-sm z-20"
          >
            <BookOpen className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
          </motion.div>
          
          <motion.div
            animate={{
              x: [0, -5, 0],
              y: [0, 6, 0],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/4 left-8 sm:left-12 h-5 w-5 sm:h-6 sm:w-6 bg-gray-100/10 backdrop-blur-sm rounded-md flex items-center justify-center border border-gray-200/20 shadow-sm z-20"
          >
            <Target className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500" />
          </motion.div>
          
          <motion.div
            animate={{
              y: [0, -8, 0],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 16,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-1/3 left-12 sm:left-20 h-6 w-6 sm:h-7 sm:w-7 bg-gray-100/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-gray-200/20 shadow-sm z-20"
          >
            <Award className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
          </motion.div>
          
          <motion.div
            animate={{
              x: [0, 8, 0],
              y: [0, -6, 0],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-2/3 right-4 sm:right-8 h-5 w-5 sm:h-6 sm:w-6 bg-gray-100/10 backdrop-blur-sm rounded-md flex items-center justify-center border border-gray-200/20 shadow-sm z-20"
          >
            <Lightbulb className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500" />
          </motion.div>
          
          <motion.div
            animate={{
              y: [0, 10, 0],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-4 sm:left-8 h-6 w-6 sm:h-8 sm:w-8 bg-gray-100/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-gray-200/20 shadow-sm z-20"
          >
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
          </motion.div>
          
          <motion.div
            animate={{
              x: [0, -8, 0],
              y: [0, 6, 0],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-12 sm:bottom-16 left-1/4 sm:left-1/3 h-6 w-6 sm:h-7 sm:w-7 bg-gray-100/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-200/20 shadow-sm z-20"
          >
            <Rocket className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500" />
          </motion.div>
          
          <motion.div
            animate={{
              y: [0, -8, 0],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 24,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-3/4 right-1/5 sm:right-1/4 h-5 w-5 sm:h-6 sm:w-6 bg-gray-100/10 backdrop-blur-sm rounded-md flex items-center justify-center border border-gray-200/20 shadow-sm z-20"
          >
            <Globe className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
          </motion.div>
          
          <motion.div
            animate={{
              x: [0, 6, 0],
              y: [0, -6, 0],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 26,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/6 right-1/4 sm:right-1/3 h-6 w-6 sm:h-7 sm:w-7 bg-gray-100/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-gray-200/20 shadow-sm z-20"
          >
            <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500" />
          </motion.div>
          
          <motion.div
            animate={{
              y: [0, 8, 0],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/3 left-1/5 sm:left-1/4 h-5 w-5 sm:h-6 sm:w-6 bg-gray-100/10 backdrop-blur-sm rounded-md flex items-center justify-center border border-gray-200/20 shadow-sm z-20"
          >
            <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
          </motion.div>
          
          <motion.div
            animate={{
              x: [0, -6, 0],
              y: [0, 8, 0],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-1/4 right-1/4 sm:right-1/3 h-6 w-6 sm:h-7 sm:w-7 bg-gray-100/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-gray-200/20 shadow-sm z-20"
          >
            <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500" />
          </motion.div>
        </div>
      </section>

      {/* What We Do Section */}
      <section id="features" className="section-container what-we-do-section">
        {/* Mesh Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
            style={{ backgroundImage: `url(${meshBackground})` }}
          />
        </div>
        
        {/* Subtle background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              y: [0, -15, 0],
              opacity: [0.03, 0.08, 0.03],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 right-20 h-24 w-24 rounded-full bg-gray-400/8 blur-xl"
          />
          <motion.div
            animate={{
              x: [0, 10, 0],
              y: [0, -8, 0],
              opacity: [0.02, 0.06, 0.02],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-20 left-20 h-16 w-16 rounded-full bg-gray-500/6 blur-lg"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.01, 0.04, 0.01],
            }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-gray-300/4 blur-2xl"
          />
        </div>

                <div className="section-content">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Left 40% - Title and Description */}
            <div className="w-full lg:w-2/5 lg:sticky lg:top-24">
              <div className="section-title-left">
                <ScrollFloat
                  animationDuration={1.2}
                  ease="back.inOut(2)"
                  scrollStart="center bottom+=50%"
                  scrollEnd="bottom bottom-=40%"
                  stagger={0.03}
                  containerClassName="mb-6"
                  textClassName="text-4xl lg:text-5xl font-bold text-gray-50 drop-shadow-lg"
                >
                  What We Do
                </ScrollFloat>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="section-description-left"
                >
                  Your smart command center — built to simplify, sync, and supercharge your solo business.
                </motion.p>
              </div>
            </div>

            {/* Right 60% - Features Grid */}
            <div className="w-full lg:w-3/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="what-we-do-card-compact group h-full">
                      <div className="what-we-do-card-content-compact">
                        <div className="what-we-do-icon-compact">
                          <div className="text-gray-400 group-hover:text-gray-100 transition-colors duration-300">
                            {feature.icon}
                          </div>
                        </div>
                        <h3 className="what-we-do-title-compact">
                          {feature.title}
                        </h3>
                        <p className="what-we-do-description-compact">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How SoloDesk Works Section */}
      <section className="section-container how-it-works-section">
        {/* Mesh Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
            style={{ backgroundImage: `url(${meshBackground})` }}
          />
        </div>
        
        {/* Subtle background elements */}
        <div className="section-background">
          <motion.div
            animate={{
              y: [0, -12, 0],
              opacity: [0.02, 0.07, 0.02],
            }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/3 left-10 h-20 w-20 rounded-full bg-gray-400/6 blur-xl"
          />
          <motion.div
            animate={{
              x: [0, -8, 0],
              y: [0, 10, 0],
              opacity: [0.01, 0.05, 0.01],
            }}
            transition={{
              duration: 32,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-1/3 right-16 h-16 w-16 rounded-full bg-gray-500/5 blur-lg"
          />
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.015, 0.045, 0.015],
            }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/4 right-1/4 h-24 w-24 rounded-full bg-gray-300/3 blur-2xl"
          />
        </div>

        <div className="section-content">
          <div className="flex flex-col lg:flex-row gap-12 items-start min-h-[300px]">
            {/* Left 50% - Title and Description */}
            <div className="w-full lg:w-1/2 flex items-start justify-center pt-0">
              <div className="text-right max-w-md">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="text-4xl lg:text-5xl font-bold text-gray-50 drop-shadow-lg mb-6"
                >
                  <div className="text-left">
                    <div>How SoloDesk</div>
                    <div>Works</div>
                  </div>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="text-lg text-gray-300/90 font-medium leading-relaxed text-left"
                >
                  Your business, beautifully organized — in just a few steps.
                </motion.p>
              </div>
            </div>

            {/* Right 50% - Carousel */}
            <div className="w-full lg:w-1/2 flex items-start justify-center pt-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                viewport={{ once: true }}
                className="w-full flex justify-center"
                style={{ height: '350px', position: 'relative' }}
              >
                <Carousel
                  baseWidth={500}
                  autoplay={true}
                  autoplayDelay={3000}
                  pauseOnHover={true}
                  loop={true}
                  round={false}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>



    </PublicLayout>
  );
};

export default Home; 