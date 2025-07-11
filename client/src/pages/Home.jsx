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
      title: 'Integrated Smart Scheduling',
      description: 'Book smarter, not harder. Clients can view your availability and self-book meetings or sessions, with built-in buffers, auto-reminders, and timezone detection.',
      color: 'from-purple-500/20 to-purple-600/20',
      borderColor: 'border-purple-500/30',
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Business Insights & Analytics',
      description: 'Know what\'s working. Get simple, visual analytics on your earnings, busiest months, top clients, and most popular services — all in one place.',
      color: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30',
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: 'AI-Powered Notes & Summaries',
      description: 'Summarize like a pro. Record and auto-summarize meeting notes, client chats, or project briefs using built-in AI — searchable and organized.',
      color: 'from-green-500/20 to-green-600/20',
      borderColor: 'border-green-500/30',
    },
    {
      icon: <Workflow className="h-8 w-8" />,
      title: 'Client Workflow Templates',
      description: 'Repeat without reinventing. Create and reuse customized project workflows for recurring services or client types, with automated task generation.',
      color: 'from-orange-500/20 to-orange-600/20',
      borderColor: 'border-orange-500/30',
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: 'Unified Notifications Hub',
      description: 'Stay in the loop. One notification panel for emails, invoices, file uploads, client messages, deadlines — all streamlined, not scattered.',
      color: 'from-red-500/20 to-red-600/20',
      borderColor: 'border-red-500/30',
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Time Tracking',
      description: 'Track time effortlessly with smart timers, project categorization, and detailed reports to optimize your productivity and billing.',
      color: 'from-indigo-500/20 to-indigo-600/20',
      borderColor: 'border-indigo-500/30',
    },
  ];

  const steps = [
    {
      icon: <Settings className="h-8 w-8" />,
      title: 'Set Up Your Workspace',
      quote: 'Brand it. Own it. Run it your style.',
      step: '01',
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Add or Invite Clients',
      quote: 'Keep client info close, and chaos far.',
      step: '02',
    },
    {
      icon: <FolderOpen className="h-8 w-8" />,
      title: 'Create Projects & Tasks',
      quote: 'From idea to delivery — track every step.',
      step: '03',
    },
    {
      icon: <Send className="h-8 w-8" />,
      title: 'Share & Collaborate',
      quote: 'Your project hub. Their peace of mind.',
      step: '04',
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: 'Send Invoices & Get Paid',
      quote: 'Look professional. Get paid faster.',
      step: '05',
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Stay in Control',
      quote: 'Work smarter with SoloDesk by your side.',
      step: '06',
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
            className="absolute top-20 left-20 h-32 w-32 rounded-full bg-[#FFD166]/10 blur-xl"
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
            className="absolute top-40 right-32 h-24 w-24 rounded-full bg-[#BC96E6]/15 blur-lg"
          />
        </div>

        <div className="relative w-full h-screen flex items-center">
          {/* Full viewport hero waves */}
          <Waves
            lineColor="#fff"
            backgroundColor="rgba(255, 255, 255, 0.2)"
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
                  <BlurText
                    text="Revolutionary Workspace Management"
                    delay={300}
                    animateBy="words"
                    direction="top"
                    className="text-lg font-bold tracking-wide uppercase drop-shadow-lg"
                    duration={1.2}
                    stagger={0.1}
                  />
                </motion.div>
                
                <div className="mb-6">
                  <BlurText
                    text="Transform Your"
                    delay={600}
                    animateBy="words"
                    direction="top"
                    className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#210B2C] drop-shadow-xl mb-2"
                    duration={1.5}
                    stagger={0.15}
                  />
                  <BlurText
                    text="Workspace"
                    delay={900}
                    animateBy="letters"
                    direction="bottom"
                    className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-[#FFD166] to-[#BC96E6] bg-clip-text text-transparent drop-shadow-lg mb-2"
                    duration={1.8}
                    stagger={0.08}
                  />
                  <BlurText
                    text="Experience"
                    delay={1200}
                    animateBy="words"
                    direction="top"
                    onAnimationComplete={handleAnimationComplete}
                    className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#210B2C] drop-shadow-xl"
                    duration={1.2}
                    stagger={0.1}
                  />
                </div>
                
                <BlurText
                  text="Smart, seamless desk and workspace management with a dreamy interface that inspires productivity."
                  delay={1500}
                  animateBy="words"
                  direction="bottom"
                  className="text-lg md:text-xl text-[#210B2C]/90 font-medium mb-8 drop-shadow max-w-2xl mx-auto"
                  duration={1.5}
                  stagger={0.1}
                />
                
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="hero-buttons"
                >
                  <Button size="lg" className="hero-primary-button group" asChild>
                    <Link to="/register">
                      Get Started
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
            className="absolute top-20 left-20 h-8 w-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20 shadow-sm z-20"
          >
            <Heart className="h-4 w-4 text-[#FFD166]" />
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
            className="absolute bottom-20 right-20 h-6 w-6 bg-white/10 backdrop-blur-sm rounded-md flex items-center justify-center border border-white/20 shadow-sm z-20"
          >
            <Coffee className="h-3 w-3 text-[#BC96E6]" />
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
            className="absolute top-1/3 right-16 h-7 w-7 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-sm z-20"
          >
            <BookOpen className="h-3 w-3 text-[#FFD166]" />
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
            className="absolute top-1/4 left-12 h-6 w-6 bg-white/10 backdrop-blur-sm rounded-md flex items-center justify-center border border-white/20 shadow-sm z-20"
          >
            <Target className="h-3 w-3 text-[#BC96E6]" />
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
            className="absolute bottom-1/3 left-20 h-7 w-7 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20 shadow-sm z-20"
          >
            <Award className="h-3 w-3 text-[#FFD166]" />
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
            className="absolute top-2/3 right-8 h-6 w-6 bg-white/10 backdrop-blur-sm rounded-md flex items-center justify-center border border-white/20 shadow-sm z-20"
          >
            <Lightbulb className="h-3 w-3 text-[#BC96E6]" />
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
            className="absolute top-1/2 left-8 h-8 w-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20 shadow-sm z-20"
          >
            <Shield className="h-4 w-4 text-[#FFD166]" />
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
            className="absolute bottom-16 left-1/3 h-7 w-7 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-sm z-20"
          >
            <Rocket className="h-3 w-3 text-[#BC96E6]" />
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
            className="absolute top-3/4 right-1/4 h-6 w-6 bg-white/10 backdrop-blur-sm rounded-md flex items-center justify-center border border-white/20 shadow-sm z-20"
          >
            <Globe className="h-3 w-3 text-[#FFD166]" />
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
            className="absolute top-1/6 right-1/3 h-7 w-7 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20 shadow-sm z-20"
          >
            <Users className="h-3 w-3 text-[#BC96E6]" />
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
            className="absolute top-1/3 left-1/4 h-6 w-6 bg-white/10 backdrop-blur-sm rounded-md flex items-center justify-center border border-white/20 shadow-sm z-20"
          >
            <Star className="h-3 w-3 text-[#FFD166]" />
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
            className="absolute bottom-1/4 right-1/3 h-7 w-7 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20 shadow-sm z-20"
          >
            <Zap className="h-3 w-3 text-[#BC96E6]" />
          </motion.div>
        </div>
      </section>

      {/* What We Do Section */}
      <section id="features" className="section-container what-we-do-section">
        {/* Subtle background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              y: [0, -10, 0],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 right-20 h-20 w-20 rounded-full bg-[#FFD166]/5 blur-lg"
          />
        </div>

        <div className="section-content">
          <div className="section-title">
            <ScrollFloat
              animationDuration={1.2}
              ease="back.inOut(2)"
              scrollStart="center bottom+=50%"
              scrollEnd="bottom bottom-=40%"
              stagger={0.03}
              containerClassName="mb-4"
              textClassName="text-4xl lg:text-5xl font-bold text-[#FFD166]"
            >
              What We Do
            </ScrollFloat>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="section-description"
            >
              Transform your workspace management with our comprehensive suite of tools
            </motion.p>
          </div>

          <div className="what-we-do-grid">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex justify-center"
              >
                <div className="what-we-do-card group">
                  <div className="what-we-do-card-content">
                    <div className="what-we-do-icon">
                      <div className="text-[#FFD166] group-hover:text-white transition-colors duration-300">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="what-we-do-title">
                      {feature.title}
                    </h3>
                    <p className="what-we-do-description">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How SoloDesk Works Section */}
      <section className="section-container how-it-works-section">
        {/* Subtle background elements */}
        <div className="section-background">
          <motion.div
            animate={{
              y: [0, -8, 0],
              opacity: [0.03, 0.08, 0.03],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="bg-floating-element bg-floating-yellow top-1/3 left-10 h-16 w-16"
          />
        </div>

        <div className="section-content">
          <div className="section-title">
            <ScrollFloat
              animationDuration={1.2}
              ease="back.inOut(2)"
              scrollStart="center bottom+=50%"
              scrollEnd="bottom bottom-=40%"
              stagger={0.03}
              containerClassName="mb-4"
              textClassName="text-4xl lg:text-5xl font-bold text-[#FFD166]"
            >
              How SoloDesk Works
            </ScrollFloat>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="section-description"
            >
              Get started in three simple steps
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                {/* Step Card */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:border-white/30 hover:shadow-2xl group-hover:shadow-[0_0_30px_rgba(255,209,102,0.3),0_0_60px_rgba(188,150,230,0.2)]">
                  {/* Step Number Badge */}
                  <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-gradient-to-r from-[#FFD166] to-[#BC96E6] flex items-center justify-center text-white font-bold text-xs shadow-lg">
                    {step.step}
                  </div>
                  
                  {/* Icon */}
                  <div className="h-16 w-16 mx-auto flex items-center justify-center mb-4">
                    <div className="text-[#FFD166] group-hover:text-white transition-colors duration-300">
                      {step.icon}
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-bold text-card-foreground mb-3 text-center">
                    {step.title}
                  </h3>
                  
                  {/* Quote */}
                  <div className="text-sm italic text-[#BC96E6] font-medium text-center leading-relaxed">
                    "{step.quote}"
                  </div>
                </div>
                
                {/* Creative Connector */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <div className="flex items-center space-x-1">
                      <div className="w-6 h-0.5 bg-gradient-to-r from-[#FFD166] to-[#BC96E6] rounded-full"></div>
                      <div className="w-2 h-2 rounded-full bg-[#FFD166] animate-pulse"></div>
      </div>
    </div>
                )}
                
                {/* Mobile Connector (for 2-column layout) */}
                {index < steps.length - 1 && index % 2 === 0 && (
                  <div className="hidden md:block lg:hidden absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-3">
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-0.5 h-6 bg-gradient-to-b from-[#FFD166] to-[#BC96E6] rounded-full"></div>
                      <div className="w-2 h-2 rounded-full bg-[#FFD166] animate-pulse"></div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>



    </PublicLayout>
  );
};

export default Home; 