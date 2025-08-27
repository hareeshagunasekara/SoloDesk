import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import { 
  Users, 
  CreditCard, 
  CheckSquare, 
  BarChart3, 
  Zap,
  Target,
  Award,
  Heart,
  Star,
  ArrowRight,
  Play,
  Shield,
  Globe
} from 'lucide-react';

const About = () => {
  const stats = [
    { number: "100%", label: "Free to Use", icon: Heart },
    { number: "24/7", label: "Available", icon: Shield },
    { number: "Easy", label: "Setup", icon: Zap },
    { number: "Secure", label: "Platform", icon: Globe },
  ];

  const whatItOffers = [
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Centralized Dashboard",
      description: "Centralized dashboard for daily activities"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Client & Project Management",
      description: "Client & project management tools"
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Easy Invoicing",
      description: "Easy invoicing and payment tracking"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Analytics",
      description: "Analytics to measure growth"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Automated Reminders",
      description: "Automated reminders & emails"
    }
  ];

  const whyChooseSoloDesk = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightweight and User-friendly",
      description: "Lightweight and user-friendly"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Saves Time",
      description: "Saves time by reducing manual work"
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Helps You Grow",
      description: "Helps you grow your business with insights"
    }
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary-950 via-primary-400 to-primary-100 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
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
            className="absolute top-20 left-20 h-32 w-32 rounded-full bg-white/10 blur-xl"
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
            className="absolute top-40 right-32 h-24 w-24 rounded-full bg-white/10 blur-lg"
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/30"
            >
              <Target className="h-4 w-4 text-primary-100" />
              <span className="text-white text-sm font-medium">Your Personal Business Command Center</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              Crafted for Independent Professionals{' '}
              <span className="bg-gradient-to-r from-primary-100 to-primary-300 bg-clip-text text-transparent">
                Who Do It All
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl text-white/90 mb-8 leading-relaxed"
            >
              SoloDesk is your all-in-one CRM and workspace dashboard — built to help you manage clients, bookings, tasks, and payments with clarity, style, and control.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 bg-primary-100 text-primary-950 font-semibold px-8 py-4 rounded-xl hover:bg-primary-200 transition-all duration-300 group"
              >
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-xl hover:bg-white/30 transition-all duration-300"
              >
                <span>Sign In</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold text-primary-900 mb-6">
              Who It's For
            </h2>
            <p className="text-xl text-primary-600 mb-12 leading-relaxed">
              SoloDesk is designed for independent professionals who want to streamline their business operations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-primary-50 border border-primary-200 rounded-xl p-6"
              >
                <div className="text-primary-600 mb-4">
                  <Users className="h-8 w-8 mx-auto" />
                </div>
                <h3 className="font-semibold text-primary-900 mb-2">Freelancers</h3>
                <p className="text-primary-600">Designers, developers, consultants, and creative professionals.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-primary-50 border border-primary-200 rounded-xl p-6"
              >
                <div className="text-primary-600 mb-4">
                  <Target className="h-8 w-8 mx-auto" />
                </div>
                <h3 className="font-semibold text-primary-900 mb-2">Small Business Owners</h3>
                <p className="text-primary-600">Entrepreneurs running their own businesses and startups.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-primary-50 border border-primary-200 rounded-xl p-6"
              >
                <div className="text-primary-600 mb-4">
                  <Award className="h-8 w-8 mx-auto" />
                </div>
                <h3 className="font-semibold text-primary-900 mb-2">Independent Professionals</h3>
                <p className="text-primary-600">Solo practitioners and consultants managing their own practice.</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What It Offers Section */}
      <section className="py-24 bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-primary-900 mb-6">
              What It Offers
            </h2>
            <p className="text-xl text-primary-600 leading-relaxed">
              Everything you need to manage your business efficiently in one place.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {whatItOffers.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="text-primary-600 mb-4 group-hover:text-primary-700 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-primary-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-primary-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-primary-950 to-primary-400">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Why Choose SoloDesk?
            </h2>
            <p className="text-xl text-white/90">
              Built specifically for freelancers who want to run their business efficiently
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-white mb-4">
                  <stat.icon className="h-8 w-8 mx-auto" />
                </div>
                <div className="text-3xl font-bold text-primary-100 mb-2">
                  {stat.number}
                </div>
                <div className="text-white/80 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose SoloDesk Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why Choose SoloDesk
            </h2>
            <p className="text-xl text-gray-600">
              Built specifically for independent professionals who want to run their business efficiently
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {whyChooseSoloDesk.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200 text-center"
              >
                <div className="text-primary-600 mb-4 flex justify-center">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-primary-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-primary-600 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision/Future Section */}
      <section className="py-24 bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold text-primary-900 mb-6">
              Our Vision
            </h2>
            <p className="text-xl text-primary-600 leading-relaxed">
              We're continuously improving SoloDesk with new features like calendar sync, team collaboration, and advanced reporting.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-950 via-primary-400 to-primary-100">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Upgrade the Way You Work?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Streamline your entire business — from client booking to final payment — with ease.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 bg-primary-100 text-primary-950 font-semibold px-8 py-4 rounded-xl hover:bg-primary-200 transition-all duration-300 group"
              >
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-xl hover:bg-white/30 transition-all duration-300"
              >
                <span>Sign In</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default About; 