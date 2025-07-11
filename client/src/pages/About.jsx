import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import { 
  Users, 
  Calendar, 
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

  const features = [
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Smart Scheduling",
      description: "Book appointments, manage availability, and sync with your calendar automatically."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Client Management",
      description: "Keep all client information, communication history, and project details in one place."
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Payment Tracking",
      description: "Create invoices, track payments, and manage your cash flow with ease."
    },
    {
      icon: <CheckSquare className="h-8 w-8" />,
      title: "Task Management",
      description: "Organize projects, set deadlines, and never miss a deliverable again."
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Business Insights",
      description: "Get clear analytics on your earnings, busiest periods, and top clients."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Automation",
      description: "Automate follow-ups, reminders, and repetitive tasks to focus on what matters."
    }
  ];

  const benefits = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Save Time",
      description: "Automate repetitive tasks and focus on what you do best - serving your clients."
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Stay Organized",
      description: "Keep all your client information, projects, and payments in one centralized location."
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Look Professional",
      description: "Present a polished, professional image to your clients with branded invoices and scheduling."
    }
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-[#210B2C] via-[#BC96E6] to-[#FFD166] overflow-hidden">
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
              <Target className="h-4 w-4 text-[#FFD166]" />
              <span className="text-white text-sm font-medium">Your Personal Freelance HQ</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              Built for Freelancers,{' '}
              <span className="bg-gradient-to-r from-[#FFD166] to-[#BC96E6] bg-clip-text text-transparent">
                by Freelancers
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl text-white/90 mb-8 leading-relaxed"
            >
              A personal CRM and business dashboard for freelancers to manage clients, bookings, tasks, and payments—all in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 bg-[#FFD166] text-[#210B2C] font-semibold px-8 py-4 rounded-xl hover:bg-[#FFD166]/90 transition-all duration-300 group"
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

      {/* Problem Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              The Freelancer's Struggle is Real
            </h2>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Freelancers like photographers, coaches, and bakers often struggle to juggle appointments, payments, and follow-ups. Tools like Notion, Calendly, and Excel don't talk to each other. They need a centralized, simple, and intelligent dashboard.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-red-50 border border-red-200 rounded-xl p-6"
              >
                <div className="text-red-500 mb-4">
                  <Calendar className="h-8 w-8 mx-auto" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Scattered Tools</h3>
                <p className="text-gray-600">Managing bookings in Calendly, clients in Excel, and payments in PayPal creates chaos.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-red-50 border border-red-200 rounded-xl p-6"
              >
                <div className="text-red-500 mb-4">
                  <Users className="h-8 w-8 mx-auto" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Lost Opportunities</h3>
                <p className="text-gray-600">Missing follow-ups and forgetting client details leads to lost business.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-red-50 border border-red-200 rounded-xl p-6"
              >
                <div className="text-red-500 mb-4">
                  <BarChart3 className="h-8 w-8 mx-auto" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">No Visibility</h3>
                <p className="text-gray-600">Without proper tracking, you can't see what's working or where to improve.</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Enter SoloDesk
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              The all-in-one platform that brings together everything you need to run your freelance business efficiently and professionally.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="text-[#FFD166] mb-4 group-hover:text-[#BC96E6] transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-[#210B2C] to-[#BC96E6]">
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
                <div className="text-3xl font-bold text-[#FFD166] mb-2">
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

      {/* Benefits Section */}
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
              Key Benefits
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to run your freelance business more efficiently
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 text-center"
              >
                <div className="text-[#FFD166] mb-4 flex justify-center">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[#210B2C] via-[#BC96E6] to-[#FFD166]">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Streamline Your Freelance Business?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Start managing your clients, projects, and payments more efficiently today.
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
                className="inline-flex items-center space-x-2 bg-[#FFD166] text-[#210B2C] font-semibold px-8 py-4 rounded-xl hover:bg-[#FFD166]/90 transition-all duration-300 group"
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